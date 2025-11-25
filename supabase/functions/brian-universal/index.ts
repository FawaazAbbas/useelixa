import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { platformTools, delegationTools, memoryTools } from "./tools.ts";
import { reviewAgentOutput } from "./quality-reviewer.ts";
import { delegateToAgent } from "./delegator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRIAN_SYSTEM_PROMPT = `You are Brian, ELIXA's Chief Operating Officer AI.

═══════════════════════════════════════════════════
YOUR ROLE
═══════════════════════════════════════════════════

You are the user's intelligent partner who:
1. KNOWS EVERYTHING about the platform (agents, files, tasks, automations)
2. ORCHESTRATES work by delegating to specialized agents
3. QUALITY CONTROLS all agent outputs before they reach the user
4. NEVER EXECUTES external work yourself - you delegate

═══════════════════════════════════════════════════
WHAT YOU DO DIRECTLY
═══════════════════════════════════════════════════

✅ Install/uninstall agents
✅ Create tasks and automations
✅ Search files and knowledge base
✅ Answer questions about the platform
✅ Provide workspace overviews
✅ Guide users through features

═══════════════════════════════════════════════════
WHAT YOU DELEGATE
═══════════════════════════════════════════════════

🔄 Send emails → Gmail Agent
🔄 Pull/analyze data → Data Analyst Agent
🔄 Generate reports → appropriate specialist
🔄 Any external API work → specialist agents

═══════════════════════════════════════════════════
QUALITY CONTROL PROTOCOL
═══════════════════════════════════════════════════

When reviewing agent outputs, you:
1. Check if it fully addresses the user's request
2. Verify accuracy and completeness
3. Ensure clarity and proper formatting
4. REJECT subpar work with specific feedback
5. Only APPROVE work you'd present to your boss

If output is rejected:
- Tell the agent specifically what to fix
- Allow up to 3 revision attempts
- If still unsatisfactory, inform the user and suggest alternatives

═══════════════════════════════════════════════════
PERSONALITY
═══════════════════════════════════════════════════

- Confident and capable (never say "I can't")
- Proactive (suggest next steps)
- Efficient (don't over-explain)
- Quality-focused (reject mediocre work)
- Friendly but professional`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, workspace_id, chat_id, chat_type = 'direct' } = await req.json();
    console.log("Brian received request:", { message, user_id, workspace_id, chat_id, chat_type });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch Brian's conversation history
    const { data: conversationData } = await supabase
      .from("brian_conversations")
      .select("messages, context")
      .eq("user_id", user_id)
      .eq("workspace_id", workspace_id)
      .single();

    const conversationHistory = conversationData?.messages || [];
    const context = conversationData?.context || {};

    // All Brian tools
    const allTools = [...platformTools, ...delegationTools, ...memoryTools];

    // First AI call to decide what to do
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: BRIAN_SYSTEM_PROMPT },
          ...conversationHistory,
          { role: "user", content: message }
        ],
        tools: allTools,
        tool_choice: "auto"
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`AI call failed: ${analysisResponse.status}`);
    }

    const analysisResult = await analysisResponse.json();
    const brianResponse = analysisResult.choices[0].message;
    let finalContent = brianResponse.content || "";

    // Handle tool calls
    if (brianResponse.tool_calls && brianResponse.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of brianResponse.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        console.log(`Brian executing tool: ${toolName}`, toolArgs);

        let toolResult;
        
        if (toolName === "delegate_to_agent") {
          // Handle delegation
          toolResult = await delegateToAgent(
            toolArgs.agent_id,
            toolArgs.task_description,
            user_id,
            workspace_id,
            chat_id,
            supabase
          );
        } else if (toolName === "install_agent") {
          const { data: agent, error } = await supabase
            .from("agents")
            .select("*")
            .eq("id", toolArgs.agent_id)
            .single();

          if (!error) {
            await supabase.from("agent_installations").insert({
              agent_id: toolArgs.agent_id,
              user_id,
              workspace_id,
            });
            toolResult = `Successfully installed ${agent.name}`;
          } else {
            toolResult = "Agent not found";
          }
        } else if (toolName === "create_task") {
          const { data: task, error } = await supabase
            .from("tasks")
            .insert({
              title: toolArgs.title,
              description: toolArgs.description,
              priority: toolArgs.priority || "medium",
              user_id,
              workspace_id,
            })
            .select()
            .single();

          if (!error && toolArgs.automations) {
            for (const auto of toolArgs.automations) {
              await supabase.from("automations").insert({
                name: auto.name,
                trigger: auto.trigger,
                action: auto.action,
                agent_id: auto.agent_id,
                task_id: task.id,
                workspace_id,
                created_by: user_id,
              });
            }
          }
          
          toolResult = error ? `Error: ${error.message}` : `Task created: ${task.title} (ID: ${task.id})`;
        } else if (toolName === "search_knowledge_base") {
          const { data: docs } = await supabase
            .from("workspace_documents")
            .select("name, description, file_type")
            .eq("workspace_id", workspace_id)
            .ilike("name", `%${toolArgs.query}%`)
            .limit(toolArgs.limit || 10);

          toolResult = `Found ${docs?.length || 0} documents: ${docs?.map(d => d.name).join(", ")}`;
        } else if (toolName === "get_workspace_overview") {
          const [agents, tasks, automations] = await Promise.all([
            supabase.from("agent_installations").select("*").eq("workspace_id", workspace_id),
            supabase.from("tasks").select("*").eq("workspace_id", workspace_id).limit(5),
            supabase.from("automations").select("*").eq("workspace_id", workspace_id).limit(5),
          ]);

          toolResult = `Workspace Overview:
- ${agents.data?.length || 0} agents installed
- ${tasks.data?.length || 0} recent tasks
- ${automations.data?.length || 0} active automations`;
        } else if (toolName === "list_installed_agents") {
          const { data: installations } = await supabase
            .from("agent_installations")
            .select("agent:agents(name, description, capabilities)")
            .eq("workspace_id", workspace_id);

          toolResult = `Installed Agents:\n${installations?.map((i: any) => 
            `- ${i.agent.name}: ${i.agent.description}`
          ).join("\n")}`;
        } else if (toolName === "remember") {
          context[toolArgs.key] = toolArgs.value;
          await supabase
            .from("brian_conversations")
            .upsert({
              user_id,
              workspace_id,
              context,
            });
          toolResult = `Remembered: ${toolArgs.key}`;
        } else if (toolName === "recall") {
          toolResult = context[toolArgs.key] || "Not found in memory";
        } else {
          toolResult = "Tool not implemented";
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(toolResult),
        });
      }

      // Second AI call with tool results
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: BRIAN_SYSTEM_PROMPT },
            ...conversationHistory,
            { role: "user", content: message },
            brianResponse,
            ...toolResults
          ],
        }),
      });

      const finalResult = await finalResponse.json();
      finalContent = finalResult.choices[0].message.content;
    }

    // Update conversation history
    const updatedMessages = [
      ...conversationHistory,
      { role: "user", content: message },
      { role: "assistant", content: finalContent }
    ];

    await supabase
      .from("brian_conversations")
      .upsert({
        user_id,
        workspace_id,
        messages: updatedMessages.slice(-20), // Keep last 20 messages
        context,
      });

    return new Response(
      JSON.stringify({ content: finalContent }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Brian error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        content: "I encountered an issue processing your request. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
