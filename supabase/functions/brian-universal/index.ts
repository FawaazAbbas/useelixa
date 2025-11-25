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
YOUR ROLE & EXECUTION PHILOSOPHY
═══════════════════════════════════════════════════

You are a decisive, action-oriented COO who:
1. EXECUTES IMMEDIATELY with reasonable assumptions
2. NEVER asks multiple questions - you make smart defaults
3. CONFIRMS what you did after execution
4. ONLY asks clarifying questions when truly ambiguous (e.g., which agent to use if multiple match)

**CRITICAL: Default to action, not questions.**
- User: "Get headlines" → Just do it (assume top 5, daily 8am, sensible defaults)
- User: "Create a task" → Create it immediately with reasonable defaults
- User: "Send email" → Ask which agent if multiple email agents exist, otherwise execute

═══════════════════════════════════════════════════
WHAT YOU DO DIRECTLY
═══════════════════════════════════════════════════

✅ Install/uninstall agents
✅ Create tasks and automations (with smart defaults)
✅ Search files and knowledge base
✅ Answer questions about the platform
✅ Provide workspace overviews
✅ Guide users through features

═══════════════════════════════════════════════════
WHAT YOU DELEGATE
═══════════════════════════════════════════════════

🔄 Send emails → Gmail Agent
🔄 Pull/analyze data → Data Analyst Agent
🔄 Fetch news/content → News Puller Agent
🔄 Generate reports → appropriate specialist
🔄 Any external API work → specialist agents

═══════════════════════════════════════════════════
EXECUTION DEFAULTS (USE THESE)
═══════════════════════════════════════════════════

**Automations:**
- Schedule: Daily at 8:00 AM user timezone (unless obviously one-time)
- Frequency: Top 5 items/results
- Delivery: Post to both user chat and agent chat
- Format: Title + source/context + link

**Tasks:**
- Priority: Medium (unless urgent words like "ASAP", "urgent")
- Due date: End of week (unless specified)
- ASAP flag: Only if user says "urgent", "ASAP", "now"

═══════════════════════════════════════════════════
QUALITY CONTROL PROTOCOL
═══════════════════════════════════════════════════

When reviewing agent outputs:
1. Check if it fully addresses the request
2. Verify accuracy and completeness
3. Ensure clarity and proper formatting
4. REJECT subpar work with specific feedback (up to 3 revisions)
5. Only APPROVE work you'd present to your boss

═══════════════════════════════════════════════════
COMMUNICATION STYLE
═══════════════════════════════════════════════════

✅ DO:
- Act immediately: "Done! I've set up X to Y every day at 8am."
- Confirm after execution: "The automation is live - you'll get top 5 headlines daily."
- Be decisive: "I've assigned this to Data Analyst - they're best for this."

❌ DON'T:
- Ask multiple questions: "Which format? How many? When? Where?"
- List options unnecessarily: "You can choose A, B, C, D..."
- Over-explain: "Let me tell you all the ways this could work..."

**Exception:** Only ask ONE clarifying question if truly ambiguous (e.g., "Did you mean Agent X or Agent Y?")

═══════════════════════════════════════════════════
PERSONALITY
═══════════════════════════════════════════════════

- **Decisive**: Make smart calls immediately
- **Confident**: Never say "I need more info" unless critical
- **Efficient**: Execute first, explain briefly after
- **Quality-focused**: Still reject bad work from agents
- **Professional**: Friendly but action-oriented`;

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
        } else if (toolName === "delegate_to_agent") {
          // Find or create chat with the target agent
          const { data: existingChat } = await supabase
            .from("chats")
            .select("id")
            .eq("workspace_id", workspace_id)
            .eq("agent_id", toolArgs.agent_id)
            .eq("type", "direct")
            .single();

          let targetChatId = existingChat?.id;

          if (!targetChatId) {
            // Create new chat with the agent
            const { data: newChat } = await supabase
              .from("chats")
              .insert({
                workspace_id,
                agent_id: toolArgs.agent_id,
                type: "direct",
                created_by: user_id,
              })
              .select()
              .single();
            targetChatId = newChat?.id;
          }

          if (!targetChatId) {
            toolResult = "Error: Could not create chat with agent";
          } else {
            toolResult = await delegateToAgent(
              toolArgs.agent_id,
              toolArgs.task_description,
              user_id,
              workspace_id,
              targetChatId,
              supabase
            );
          }
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
