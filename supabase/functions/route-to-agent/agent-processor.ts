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
      const systemPrompt = buildSystemPrompt(
        agent.name,
        agent.description || agent.short_description || 'A helpful AI agent',
        agent.ai_personality,
        agent.ai_instructions,
        agent.guard_rails,
        toolDefinitions,
        speechStyle
      ) + knowledgeContext;

      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) {
        throw new Error("LOVABLE_API_KEY not configured");
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: message }
          ],
          tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
          tool_choice: toolDefinitions.length > 0 ? "auto" : undefined,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      const choice = aiData.choices[0];

      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolResults = [];
        
        for (const toolCall of choice.message.tool_calls) {
          // Inject user_id and workspace_id into tool arguments for task creation
          if (toolCall.function.name === 'create_task_for_user') {
            const args = JSON.parse(toolCall.function.arguments);
            args.user_id = userId;
            args.workspace_id = workspaceId;
            toolCall.function.arguments = JSON.stringify(args);
          }
          
          const result = await executeToolCall(
            toolCall, 
            toolDefinitions,
            { user_id: userId, agent_id: agent.id, chat_id: chatId }
          );
          toolResults.push(result);
        }

        // Second AI call with tool results
        const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: message },
              choice.message,
              ...toolResults.map((result: any, idx: number) => ({
                role: "tool",
                tool_call_id: choice.message.tool_calls[idx].id,
                content: JSON.stringify(result)
              }))
            ],
          }),
        });

        const finalData = await finalResponse.json();
        return {
          content: finalData.choices[0].message.content,
          processingTime: Date.now() - startTime
        };
      }

      return {
        content: choice.message.content,
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
