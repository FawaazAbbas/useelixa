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
        .select("id, name, description, short_description, capabilities")
        .in("id", agent_ids);
      
      const agentMap = new Map(allAgents?.map(a => [a.id, a]) || []);
      
      const agentResponses = [];
      let currentMessage = message;
      let conversationRounds = 0;
      const maxRounds = 5; // Prevent infinite loops
      let lastRespondingAgentId: string | null = null;
      
      // Autonomous conversation loop
      while (conversationRounds < maxRounds) {
        conversationRounds++;
        console.log(`\n🔄 Conversation round ${conversationRounds}`);
        
        // Fetch fresh conversation history including agent-to-agent messages
        const { data: previousMessages } = await supabase
          .from("messages")
          .select("content, user_id, agent_id, is_agent_to_agent, target_agent_id, created_at")
          .eq("chat_id", chat_id)
          .order("created_at", { ascending: true })
          .limit(20);

        const conversationHistory = (previousMessages || []).map((msg: any) => {
          const agentInfo = msg.agent_id ? agentMap.get(msg.agent_id) : null;
          const prefix = agentInfo ? `[${agentInfo.name}]: ` : '';
          return {
            role: msg.user_id ? "user" : "assistant",
            content: prefix + msg.content,
          };
        });
        
        // Determine which agent should respond
        let targetAgentId: string | null = null;
        
        // Priority 1: Check for explicit @mentions in the current message
        for (const agent of allAgents || []) {
          if (currentMessage.includes(`@${agent.name}`)) {
            targetAgentId = agent.id;
            console.log(`📍 Message explicitly mentions: ${agent.name}`);
            break;
          }
        }
        
        // Priority 2: Check for delegation signals (keywords + agent names)
        if (!targetAgentId) {
          const delegationKeywords = [
            'can you', 'could you', 'please', 'help with', 'handle', 
            'take care of', 'work on', 'assist with', 'need you to'
          ];
          
          for (const agent of allAgents || []) {
            if (agent.id === lastRespondingAgentId) continue; // Skip the agent that just responded
            
            const agentNameLower = agent.name.toLowerCase();
            const messageLower = currentMessage.toLowerCase();
            
            // Check if message contains agent name + delegation keyword nearby
            if (messageLower.includes(agentNameLower)) {
              for (const keyword of delegationKeywords) {
                if (messageLower.includes(keyword)) {
                  targetAgentId = agent.id;
                  console.log(`🎯 Delegation detected to ${agent.name} (keyword: "${keyword}")`);
                  break;
                }
              }
            }
            if (targetAgentId) break;
          }
        }
        
        // Priority 3: If first round and no specific target, let the first agent respond
        if (!targetAgentId && conversationRounds === 1) {
          targetAgentId = agent_ids[0];
          console.log(`🚀 Starting conversation with primary agent: ${agentMap.get(targetAgentId)?.name}`);
        }
        
        // Priority 4: Check if last message had a target_agent_id set
        if (!targetAgentId && previousMessages && previousMessages.length > 0) {
          const lastMsg = previousMessages[previousMessages.length - 1];
          if (lastMsg.target_agent_id) {
            targetAgentId = lastMsg.target_agent_id;
            console.log(`📬 Using target from previous message: ${agentMap.get(targetAgentId)?.name}`);
          }
        }
        
        // If no agent found, conversation is complete
        if (!targetAgentId) {
          console.log("✅ Conversation complete - no more agents to route to");
          break;
        }
        
        const agent = agentMap.get(targetAgentId);
        if (!agent) {
          console.log(`⚠️ Agent ${targetAgentId} not found in agent map`);
          break;
        }
        
        // Build enhanced system prompt with group chat context
        const otherAgents = Array.from(agentMap.values())
          .filter(a => a.id !== agent.id)
          .map(a => {
            const desc = a.description || a.short_description || 'AI assistant';
            const caps = a.capabilities && a.capabilities.length > 0 
              ? ` (Capabilities: ${a.capabilities.slice(0, 3).join(', ')})`
              : '';
            return `- **${a.name}**: ${desc}${caps}`;
          })
          .join('\n');
        
        const groupChatInstructions = otherAgents ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 **MULTI-AGENT COLLABORATION MODE ACTIVE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Available Collaborators:**
${otherAgents}

**Collaboration Protocol:**

1. **Delegation**: To delegate tasks, explicitly mention the agent using @AgentName format
   Example: "@DataAnalyzer, can you process these numbers?"

2. **Task Division**: Split complex requests across agent specializations
   Example: "I'll research the data. @Visualizer, create charts when I'm done."

3. **Focus**: Only handle tasks within your expertise. Delegate others immediately.

4. **Completion**: If task is complete and no delegation needed, provide final answer WITHOUT mentioning other agents.

5. **Natural Flow**: Collaborate naturally - agents can see all messages in the conversation.

**When to Delegate:**
- Task requires skills/tools another agent has
- Another agent is better suited for the subtask
- Task can be parallelized across agents

**When NOT to Delegate:**
- Task is complete and within your capabilities
- User question has been fully answered
- No other agent can add value

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : '';
        
        // Build message for agent with collaboration context
        const messageForAgent = conversationRounds === 1 
          ? `${message}\n${groupChatInstructions}`
          : `${currentMessage}\n${groupChatInstructions}`;
        
        // Process agent's workflow with enhanced context
        console.log(`🤖 Routing to agent: ${agent.name}`);
        const agentResponse = await processAgentWorkflow(
          agent, 
          user_id, 
          effectiveWorkspaceId || '', 
          messageForAgent, 
          conversationHistory, 
          supabase,
          undefined // group chats don't have single installation ID
        );
        
        if (!agentResponse) {
          console.log(`❌ No response from ${agent.name}`);
          break;
        }
        
        // Enhanced delegation detection
        let isDelegating = false;
        let nextAgentId: string | null = null;
        let delegationReason = '';
        
        // Check for explicit @mentions in response
        for (const otherAgent of allAgents || []) {
          if (otherAgent.id !== agent.id) {
            if (agentResponse.content.includes(`@${otherAgent.name}`)) {
              isDelegating = true;
              nextAgentId = otherAgent.id;
              delegationReason = 'explicit @mention';
              console.log(`🔀 ${agent.name} → ${otherAgent.name} (${delegationReason})`);
              break;
            }
          }
        }
        
        // Check for implicit delegation phrases
        if (!isDelegating) {
          const delegationPatterns = [
            /(?:can|could|would|will)\s+you\s+(\w+)/i,
            /(?:please|kindly)\s+(\w+)/i,
            /(?:need|want)\s+you\s+to\s+(\w+)/i,
            /(?:hand(?:ing)?\s+(?:this|it|that)\s+(?:over|off)\s+to)\s+(\w+)/i,
          ];
          
          for (const otherAgent of allAgents || []) {
            if (otherAgent.id !== agent.id) {
              const agentNameInResponse = agentResponse.content.toLowerCase().includes(otherAgent.name.toLowerCase());
              
              if (agentNameInResponse) {
                for (const pattern of delegationPatterns) {
                  if (pattern.test(agentResponse.content)) {
                    isDelegating = true;
                    nextAgentId = otherAgent.id;
                    delegationReason = 'delegation phrase + agent name';
                    console.log(`🔀 ${agent.name} → ${otherAgent.name} (${delegationReason})`);
                    break;
                  }
                }
              }
              if (isDelegating) break;
            }
          }
        }
        
        // Save agent response with delegation metadata
        const { data: savedMessage } = await supabase
          .from("messages")
          .insert({
            chat_id,
            agent_id: agent.id,
            content: agentResponse.content,
            processing_time_ms: agentResponse.processingTime,
            is_agent_to_agent: isDelegating,
            target_agent_id: nextAgentId,
            metadata: {
              conversation_round: conversationRounds,
              delegation_reason: isDelegating ? delegationReason : null,
            }
          })
          .select()
          .single();

        if (savedMessage) {
          agentResponses.push(savedMessage);
        }
        
        // Update tracking
        lastRespondingAgentId = agent.id;
        
        // Decide whether to continue the loop
        if (isDelegating && nextAgentId) {
          // Extract the relevant part of the message for the next agent
          // Remove the current agent's commentary and keep the delegation
          currentMessage = agentResponse.content;
          console.log(`➡️ Continuing to next agent...`);
        } else {
          // No delegation detected - conversation complete
          console.log(`✅ Task complete - ${agent.name} provided final response`);
          break;
        }
        
        // Safety check: prevent infinite loops between same agents
        if (conversationRounds > 2 && previousMessages && previousMessages.length >= 2) {
          const recentAgents = previousMessages.slice(-2).map((m: any) => m.agent_id);
          if (recentAgents[0] === nextAgentId && recentAgents[1] === agent.id) {
            console.log(`⚠️ Detected potential loop between agents - stopping`);
            break;
          }
        }
      }

      // Update chat activity
      await supabase
        .from("chats")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", chat_id);

      console.log(`\n✅ Group chat processing complete: ${agentResponses.length} messages in ${conversationRounds} rounds`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messages: agentResponses,
          rounds: conversationRounds 
        }),
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

    // Fetch agent installation for configuration
    const { data: installation } = await supabase
      .from("agent_installations")
      .select("id")
      .eq("agent_id", agent_id)
      .eq("user_id", user_id)
      .eq("workspace_id", effectiveWorkspaceId)
      .maybeSingle();

    const agentInstallationId = installation?.id;

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
        const result = await processAgentWorkflow(
          agent,
          user_id,
          effectiveWorkspaceId || '',
          message,
          conversationHistory,
          supabase,
          agentInstallationId
        );

        if (result) {
          agentResponse = result.content;
        } else {
          agentResponse = "I encountered an error processing your request.";
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
