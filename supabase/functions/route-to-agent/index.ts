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
🤝 YOU'RE IN A GROUP CHAT WITH OTHER SPECIALISTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Your Colleagues:**
${otherAgents}

**How to Work Together:**

Think of this like Slack with real colleagues. You can:
- Ask someone to handle a part: "Hey @DataAnalyzer, can you take a look at these numbers?"
- Build on what someone said: "Good point Sarah. I'd add that..."
- Disagree politely: "Hmm, I see it differently. What if we..."
- Offer to help: "I can handle the spreadsheet part if you want"
- Reference past work together: "Last time we did this, you mentioned..."

**When to Loop Someone In:**
- They have tools/skills you don't: "This needs Gmail access—@EmailBot can help"
- They're better suited: "This is more your specialty than mine"
- You're stuck: "Hey @Expert, got a minute?"

**When to Just Answer:**
- You can fully handle it yourself
- The question is already answered
- Adding more people would just complicate things

**Be Natural:**
✓ "Took a look—numbers check out. What do you think, @Designer?"
✓ "I'll grab the data. @Visualizer, want to chart this when I'm done?"
✗ "TASK DELEGATION INITIATED TO AGENT: DataAnalyzer"
✗ "I MUST NOW INVOKE THE COLLABORATION PROTOCOL"

You're working with colleagues, not executing a protocol. Just talk like a human.

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
          undefined, // group chats don't have single installation ID
          chat_id
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
          agentInstallationId,
          chat_id
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

    // Update or create user-agent relationship to build rapport
    const { data: existingRelationship } = await supabase
      .from("user_agent_relationships")
      .select("*")
      .eq("user_id", user_id)
      .eq("agent_id", agent_id)
      .maybeSingle();

    if (existingRelationship) {
      // Update existing relationship
      await supabase
        .from("user_agent_relationships")
        .update({
          interaction_count: existingRelationship.interaction_count + 1,
          rapport_level: Math.min(10, existingRelationship.rapport_level + 1), // Cap at 10
          last_interaction: new Date().toISOString()
        })
        .eq("id", existingRelationship.id);
    } else {
      // Create new relationship
      await supabase.from("user_agent_relationships").insert({
        user_id,
        agent_id,
        rapport_level: 1,
        interaction_count: 1,
        last_interaction: new Date().toISOString()
      });
    }

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
