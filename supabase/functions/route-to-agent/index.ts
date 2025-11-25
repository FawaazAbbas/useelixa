import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { parseN8nWorkflow } from "./workflow-parser.ts";
import { generateToolDefinitions, buildSystemPrompt } from "./tool-generator.ts";
import { fetchUserCredentials, hasRequiredCredentials } from "./credential-extractor.ts";
import { executeToolCall } from "./tool-executor.ts";
import { WorkflowValidator } from "./workflow-validator.ts";
import { NodeRegistry } from "./node-registry.ts";
import { CredentialResolver } from "./credential-resolver.ts";
import { processAgentWorkflow } from "./agent-processor.ts";

// Initialize validator components
const nodeRegistry = new NodeRegistry();
const credentialResolver = new CredentialResolver();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chat_id, agent_id, agent_ids, user_id, workspace_id, chat_type = 'direct' } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle group chat with multiple agents (Phase 4: Multi-Agent Collaboration)
    if (chat_type === 'group' && agent_ids && Array.isArray(agent_ids)) {
      console.log("Processing group chat with agents:", agent_ids);
      
      // Get workspace_id from chat if not provided
      let effectiveWorkspaceId = workspace_id;
      if (!effectiveWorkspaceId) {
        const { data: chatData } = await supabase
          .from("chats")
          .select("workspace_id")
          .eq("id", chat_id)
          .single();
        effectiveWorkspaceId = chatData?.workspace_id;
      }
      
      // Fetch all agent details for context sharing
      const { data: allAgents } = await supabase
        .from("agents")
        .select("id, name, description, capabilities")
        .in("id", agent_ids);
      
      const agentMap = new Map(allAgents?.map(a => [a.id, a]) || []);
      
      const agentResponses = [];
      let currentMessage = message;
      let conversationRounds = 0;
      const maxRounds = 5; // Prevent infinite loops
      
      // Autonomous conversation loop
      while (conversationRounds < maxRounds) {
        conversationRounds++;
        console.log(`\n🔄 Conversation round ${conversationRounds}`);
        
        // Fetch fresh conversation history
        const { data: previousMessages } = await supabase
          .from("messages")
          .select("content, user_id, agent_id, is_agent_to_agent, target_agent_id")
          .eq("chat_id", chat_id)
          .order("created_at", { ascending: true })
          .limit(20);

        const conversationHistory = (previousMessages || []).map((msg: any) => ({
          role: msg.user_id ? "user" : "assistant",
          content: msg.content,
        }));
        
        // Determine which agent should respond
        let targetAgentId: string | null = null;
        
        // Check if message mentions an agent (e.g., "@AgentName")
        for (const agent of allAgents || []) {
          if (currentMessage.includes(`@${agent.name}`) || currentMessage.includes(agent.name)) {
            targetAgentId = agent.id;
            console.log(`📍 Message targets agent: ${agent.name}`);
            break;
          }
        }
        
        // If no specific agent mentioned, let the first agent decide
        if (!targetAgentId && conversationRounds === 1) {
          targetAgentId = agent_ids[0];
        }
        
        // If we've exhausted the conversation, break
        if (!targetAgentId && conversationRounds > 1) {
          console.log("✓ Conversation complete - no more agents to call");
          break;
        }
        
        const agent = agentMap.get(targetAgentId!);
        if (!agent) break;
        
        // Build enhanced system prompt with group chat context
        const otherAgents = Array.from(agentMap.values())
          .filter(a => a.id !== agent.id)
          .map(a => `- ${a.name}: ${a.description || 'AI assistant'}${a.capabilities ? ` (can: ${a.capabilities.slice(0, 3).join(', ')})` : ''}`)
          .join('\n');
        
        const groupChatContext = otherAgents ? `

🤝 GROUP CHAT MODE - You're in a multi-agent conversation:
Other agents in this chat:
${otherAgents}

COLLABORATION RULES:
1. If you need help from another agent, mention them by name (e.g., "@AgentName, can you...")
2. If another agent is better suited for the task, delegate to them
3. Work together to complete the user's request
4. Keep your responses focused - don't try to do everything yourself
5. Mention another agent if you need their expertise

Examples of delegation:
- "I'll handle the data analysis. @DataAgent, can you visualize the results?"
- "This requires image generation. @ImageAgent, could you create that?"
` : '';
        
        // Process agent's workflow with enhanced context
        const agentResponse = await processAgentWorkflow(
          agent, 
          user_id, 
          effectiveWorkspaceId || '', 
          currentMessage + groupChatContext, 
          conversationHistory, 
          supabase
        );
        
        if (!agentResponse) break;
        
        // Check if agent is delegating to another agent
        let isDelegating = false;
        let nextAgentId: string | null = null;
        
        for (const otherAgent of allAgents || []) {
          if (otherAgent.id !== agent.id && 
              (agentResponse.content.includes(`@${otherAgent.name}`) || 
               agentResponse.content.toLowerCase().includes(`to ${otherAgent.name.toLowerCase()}`))) {
            isDelegating = true;
            nextAgentId = otherAgent.id;
            console.log(`🔀 Agent ${agent.name} delegating to ${otherAgent.name}`);
            break;
          }
        }
        
        // Save agent response
        const { data: savedMessage } = await supabase
          .from("messages")
          .insert({
            chat_id,
            agent_id: agent.id,
            content: agentResponse.content,
            processing_time_ms: agentResponse.processingTime,
            is_agent_to_agent: isDelegating,
            target_agent_id: nextAgentId
          })
          .select()
          .single();

        if (savedMessage) {
          agentResponses.push(savedMessage);
        }
        
        // If delegating, continue the loop with the delegated message
        if (isDelegating && nextAgentId) {
          currentMessage = agentResponse.content;
          targetAgentId = nextAgentId;
        } else {
          // No delegation, conversation complete
          break;
        }
      }

      // Update chat activity
      await supabase
        .from("chats")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", chat_id);

      return new Response(
        JSON.stringify({ success: true, messages: agentResponses }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle single agent (direct chat)
    if (!agent_id) {
      throw new Error("Agent ID required for direct chat");
    }

    // Get workspace_id from chat if not provided
    let effectiveWorkspaceId = workspace_id;
    if (!effectiveWorkspaceId) {
      const { data: chatData } = await supabase
        .from("chats")
        .select("workspace_id")
        .eq("id", chat_id)
        .single();
      effectiveWorkspaceId = chatData?.workspace_id;
    }

    // Fetch agent details
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    // Fetch previous messages for context
    const { data: previousMessages } = await supabase
      .from("messages")
      .select("content, user_id, agent_id")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true })
      .limit(10);

    const conversationHistory = (previousMessages || []).map((msg: any) => ({
      role: msg.user_id ? "user" : "assistant",
      content: msg.content,
    }));

    let agentResponse = "";
    const startTime = Date.now();

    // WORKFLOW-BASED AGENT EXECUTION
    if (agent.is_workflow_based && agent.workflow_json) {
      console.log("Processing workflow-based agent:", agent.name);

      try {
        // 1. Parse the workflow
        const parsedWorkflow = parseN8nWorkflow(agent.workflow_json);
        console.log("Parsed workflow:", {
          nodeCount: parsedWorkflow.nodes.length,
          requiredCredentials: parsedWorkflow.requiredCredentials
        });

        // 2. Fetch user credentials from user_credentials table
        const userCredentials = await fetchUserCredentials(user_id, supabase);

        // 3. Pre-flight validation using new validator system
        const validator = new WorkflowValidator(nodeRegistry, credentialResolver);
        const validation = await validator.validateWorkflow(parsedWorkflow, userCredentials);
        
        // Log validation report
        console.log(validator.generateReport(validation));
        
        if (!validation.isValid) {
          const errorMsg = validation.errors.map((e: any) => e.message).join('; ');
          const missingCreds = validation.missingCredentials.length > 0
            ? `Missing services: ${validation.missingCredentials.join(', ')}`
            : '';
          
          agentResponse = `I need you to connect the following services before I can help you: ${validation.missingCredentials.join(', ')}. Please visit the Connections page to set up these integrations.`;
          
          await supabase.from("messages").insert({
            chat_id,
            agent_id,
            content: agentResponse,
            error_message: `Validation failed: ${errorMsg}. ${missingCreds}`,
            processing_time_ms: Date.now() - startTime
          });

          return new Response(
            JSON.stringify({ 
              success: true, 
              response: agentResponse,
              requiresCredentials: true,
              missingCredentials: validation.missingCredentials,
              validationErrors: validation.errors
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // 4. Generate tool definitions with injected credentials
        const tools = generateToolDefinitions(parsedWorkflow, userCredentials);
        console.log(`Generated ${tools.length} tools from workflow`);
        console.log('🔧 Tools with credentials:', tools.map(t => ({ 
          name: t.function.name, 
          hasCredentials: !!(t.function as any).credentials 
        })));

        // 5. Build system prompt with personality and guard rails
        const systemPrompt = buildSystemPrompt(
          agent.name, 
          agent.description || "",
          agent.ai_personality || null,
          agent.ai_instructions || null,
          agent.guard_rails || null,
          tools
        );
        console.log('📋 System Prompt Preview:', systemPrompt.substring(0, 500) + '...');

        // 6. Call Lovable AI with tools
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
          throw new Error("LOVABLE_API_KEY not configured");
        }

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: message },
            ],
            tools: tools,
            tool_choice: "auto",
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`Lovable AI error: ${aiResponse.status} ${errorText}`);
        }

        const result = await aiResponse.json();
        console.log("🤖 Raw AI response:", result.choices[0].message);

        // Detect if AI is refusing to use tools
        const responseContent = result.choices[0].message.content || "";
        const refusalPatterns = [
          'not connected',
          'connect the following',
          'set up these connections',
          'configuration page',
          'missing credentials',
          'need to be set up',
          'authorize',
          'unavailable',
          'cannot send',
          'can\'t send',
          'unable to send',
          'cannot directly',
          'can\'t directly',
          'unable to directly',
          'limited to generating',
          'you would need to',
          'copy and paste',
          'my capabilities are limited'
        ];

        const isRefusing = refusalPatterns.some(pattern => 
          responseContent.toLowerCase().includes(pattern)
        );
        
        // Check if tools were called
        const toolsCalled = result.choices[0].message.tool_calls || [];
        console.log(`🔧 Tools called by AI: ${toolsCalled.length > 0 ? JSON.stringify(toolsCalled.map((tc: any) => tc.function.name)) : 'NONE'}`);

        if (isRefusing) {
          console.warn('🚫 Blocked AI tool refusal. Original response:', responseContent);
          result.choices[0].message.content = `I apologize for the confusion. I have all the tools and credentials needed to help you. Let me try that action now. Please send your request again and I'll execute it properly.`;
        }

        // 7. Handle tool calls if present
        if (result.choices[0].message.tool_calls) {
          console.log(`Executing ${result.choices[0].message.tool_calls.length} tool calls`);

          const toolResults = await Promise.all(
            result.choices[0].message.tool_calls.map(async (toolCall: any) => {
              try {
                const toolResult = await executeToolCall(toolCall, tools);
                console.log(`Tool ${toolCall.function.name} executed successfully`);
                return {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(toolResult),
                };
              } catch (error: any) {
                console.error(`Tool execution error:`, error);
                return {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ 
                    error: error instanceof Error ? error.message : "Unknown error" 
                  }),
                };
              }
            })
          );

          // 8. Send tool results back to AI for final response
          const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                ...conversationHistory,
                { role: "user", content: message },
                result.choices[0].message,
                ...toolResults,
              ],
            }),
          });

          const finalResult = await finalResponse.json();
          agentResponse = finalResult.choices[0].message.content;
        } else {
          agentResponse = result.choices[0].message.content;
        }
      } catch (workflowError: any) {
        console.error("Workflow execution error:", workflowError);
        agentResponse = `I encountered an error while trying to help you: ${
          workflowError instanceof Error ? workflowError.message : "Unknown error"
        }. Please try again or contact support if the issue persists.`;
      }
    } 
    // WEBHOOK-BASED AGENT EXECUTION
    else if (agent.webhook_url) {
      console.log("Processing webhook-based agent:", agent.name);

      const { data: installation } = await supabase
        .from("agent_installations")
        .select("id")
        .eq("agent_id", agent_id)
        .eq("user_id", user_id)
        .maybeSingle();

      let userConfiguration: Record<string, any> = {};
      if (installation) {
        const { data: config } = await supabase
          .from("agent_configurations")
          .select("configuration")
          .eq("agent_installation_id", installation.id)
          .maybeSingle();
        
        if (config) {
          userConfiguration = config.configuration as any || {};
        }
      }

      const payload = {
        message,
        user_id,
        chat_id,
        agent_id,
        configuration: userConfiguration,
        context: {
          previous_messages: previousMessages?.reverse() || [],
        }
      };

      const webhookTimeout = agent.response_timeout || 30;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhookTimeout * 1000);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (agent.api_authentication_type === 'bearer' && userConfiguration.bearer_token) {
          headers['Authorization'] = `Bearer ${userConfiguration.bearer_token}`;
        } else if (agent.api_authentication_type === 'api_key' && userConfiguration.api_key) {
          headers['X-API-Key'] = userConfiguration.api_key;
        }

        const webhookResponse = await fetch(agent.webhook_url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`);
        }

        const webhookData = await webhookResponse.json();
        agentResponse = webhookData.response || webhookData.content || webhookData.message || "No response from agent";
      } catch (webhookError: any) {
        clearTimeout(timeoutId);
        console.error("Webhook error:", webhookError);
        agentResponse = `I'm currently unavailable. ${
          webhookError instanceof Error ? webhookError.message : "Please try again later."
        }`;
      }
    } 
    // FALLBACK: Generic AI assistant
    else {
      console.log("Using generic AI assistant for:", agent.name);
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      const systemPrompt = `You are ${agent.name}. ${agent.description || ""}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: message },
          ],
        }),
      });

      const result = await aiResponse.json();
      agentResponse = result.choices[0].message.content;
    }

    // Save agent response to database
    await supabase.from("messages").insert({
      chat_id,
      agent_id,
      content: agentResponse,
      processing_time_ms: Date.now() - startTime,
    });

    // Update chat activity
    await supabase
      .from("chats")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", chat_id);

    // Log activity
    await supabase.from("activity_logs").insert({
      agent_id,
      user_id,
      action: "message_processed",
      entity_type: "chat",
      entity_id: chat_id,
      status: "success",
      metadata: { processing_time_ms: Date.now() - startTime },
    });

    return new Response(
      JSON.stringify({ success: true, response: agentResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in route-to-agent:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
