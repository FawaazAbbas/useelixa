import { parseN8nWorkflow } from "./workflow-parser.ts";
import { generateToolDefinitions, buildSystemPrompt } from "./tool-generator.ts";
import { fetchUserCredentials } from "./credential-extractor.ts";
import { executeToolCall } from "./tool-executor.ts";
import { WorkflowValidator } from "./workflow-validator.ts";
import { NodeRegistry } from "./node-registry.ts";
import { CredentialResolver } from "./credential-resolver.ts";
import { retrieveRelevantKnowledge, formatKnowledgeContext } from "./knowledge-retriever.ts";

const nodeRegistry = new NodeRegistry();
const credentialResolver = new CredentialResolver();

export async function processAgentWorkflow(
  agent: any,
  userId: string,
  workspaceId: string,
  message: string,
  conversationHistory: any[],
  supabase: any,
  agentInstallationId?: string,
  chatId?: string
): Promise<{ content: string; processingTime: number } | null> {
  const startTime = Date.now();
  
  try {
    // WORKFLOW-BASED AGENT EXECUTION
    if (agent.is_workflow_based && agent.workflow_json) {
      console.log("Processing workflow-based agent:", agent.name);

      // ❌ REJECT if not chat compatible
      if (!agent.is_chat_compatible) {
        return {
          content: "⚠️ This agent is not configured for chat. It's missing a chat trigger node and cannot be used in conversations. Please contact the developer to make this agent chat-compatible.",
          processingTime: Date.now() - startTime
        };
      }

      const parsedWorkflow = parseN8nWorkflow(agent.workflow_json);
      const userCredentials = await fetchUserCredentials(userId, supabase);

      // Fetch speech style configuration if available
      let speechStyle: string | undefined;
      if (agentInstallationId) {
        const { data: configData } = await supabase
          .from('agent_configurations')
          .select('configuration')
          .eq('agent_installation_id', agentInstallationId)
          .maybeSingle();
        
        if (configData?.configuration) {
          speechStyle = (configData.configuration as any).speech_style;
        }
      }

      // Retrieve relevant knowledge from workspace (agent-specific + workspace-wide)
      const relevantKnowledge = await retrieveRelevantKnowledge(
        supabase,
        workspaceId,
        message,
        5,
        5,
        agentInstallationId
      );
      const knowledgeContext = formatKnowledgeContext(relevantKnowledge);

      // PHASE 2: Fetch relationship context for personalization
      let relationshipContext;
      if (chatId) {
        const { data: relationship } = await supabase
          .from('user_agent_relationships')
          .select('rapport_level, interaction_count, shared_context')
          .eq('user_id', userId)
          .eq('agent_id', agent.id)
          .maybeSingle();
        
        if (relationship) {
          relationshipContext = relationship;
        }
      }

      // Validation
      const validator = new WorkflowValidator(nodeRegistry, credentialResolver);
      const validation = await validator.validateWorkflow(parsedWorkflow, userCredentials);
      
      if (!validation.isValid) {
        const missingServices = validation.missingCredentials.join(', ');
        return {
          content: `I need you to connect the following services: ${missingServices}. Please visit the Connections page.`,
          processingTime: Date.now() - startTime
        };
      }

      // Generate tools and call AI
      const toolDefinitions = generateToolDefinitions(parsedWorkflow, userCredentials);
      
      // PHASE 1: Build system prompt with personality, quirks, interests, and relationship context
      const systemPrompt = buildSystemPrompt(
        agent.name,
        agent.description || agent.short_description || 'A helpful AI agent',
        agent.ai_personality,
        agent.ai_instructions,
        agent.guard_rails,
        toolDefinitions,
        speechStyle,
        relationshipContext,
        agent.personality_traits,
        agent.communication_quirks,
        agent.interests
      ) + knowledgeContext;

      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) {
        throw new Error("LOVABLE_API_KEY not configured");
      }

      // PHASE 1: Multi-Step Tool Execution with iterative loop
      const maxIterations = 5;
      let currentIteration = 0;
      let conversationMessages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ];
      
      let finalContent = "";
      
      while (currentIteration < maxIterations) {
        currentIteration++;
        console.log(`🔄 Iteration ${currentIteration}/${maxIterations}`);
        
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            messages: conversationMessages,
            tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
            tool_choice: toolDefinitions.length > 0 ? "auto" : undefined,
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const choice = aiData.choices[0];
        
        // Add assistant message to conversation
        conversationMessages.push(choice.message);

        // If no tool calls, we're done
        if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
          finalContent = choice.message.content;
          console.log(`✅ Task complete after ${currentIteration} iteration(s)`);
          break;
        }

        // Execute tool calls with error recovery
        console.log(`🔧 Executing ${choice.message.tool_calls.length} tool(s)...`);
        const toolResults = [];
        
        for (const toolCall of choice.message.tool_calls) {
          // Inject user_id and workspace_id into tool arguments for task creation
          if (toolCall.function.name === 'create_task_for_user') {
            const args = JSON.parse(toolCall.function.arguments);
            args.user_id = userId;
            args.workspace_id = workspaceId;
            toolCall.function.arguments = JSON.stringify(args);
          }
          
          try {
            const result = await executeToolCall(
              toolCall, 
              toolDefinitions,
              { 
                user_id: userId, 
                agent_id: agent.id, 
                chat_id: chatId,
                workspace_id: workspaceId,
                agent_installation_id: agentInstallationId
              }
            );
            toolResults.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          } catch (error) {
            console.error(`❌ Tool execution failed: ${toolCall.function.name}`, error);
            // Add error result so agent can handle gracefully
            toolResults.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: true,
                message: error instanceof Error ? error.message : 'Tool execution failed',
                suggestion: 'Try an alternative approach or let the user know what went wrong'
              })
            });
          }
        }

        // Add tool results to conversation
        conversationMessages.push(...toolResults);
        
        // Check if we should continue iterating
        // The agent will decide based on tool results whether it needs more tools
        if (currentIteration >= maxIterations) {
          console.log(`⚠️ Max iterations reached, generating final response...`);
          
          // Final call to generate response
          const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-5-mini",
              messages: conversationMessages,
            }),
          });
          
          const finalData = await finalResponse.json();
          finalContent = finalData.choices[0].message.content;
          break;
        }
      }

      return {
        content: finalContent,
        processingTime: Date.now() - startTime
      };
    }

    // WEBHOOK-BASED AGENT
    if (agent.webhook_url) {
      console.log("Calling webhook-based agent:", agent.webhook_url);
      
      const webhookResponse = await fetch(agent.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.statusText}`);
      }

      const webhookData = await webhookResponse.json();
      return {
        content: webhookData.response || webhookData.message || "Response received",
        processingTime: Date.now() - startTime
      };
    }

    // GENERIC AI FALLBACK
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...conversationHistory,
          { role: "user", content: message }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    return {
      content: aiData.choices[0].message.content,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error("Error processing agent:", error);
    return {
      content: "I encountered an error processing your request. Please try again.",
      processingTime: Date.now() - startTime
    };
  }
}
