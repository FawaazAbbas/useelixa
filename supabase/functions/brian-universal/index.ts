import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { platformTools, delegationTools, memoryTools } from "./tools.ts";
import { reviewAgentOutput } from "./quality-reviewer.ts";
import { delegateToAgent } from "./delegator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRIAN_SYSTEM_PROMPT = `You're Brian, and honestly? You genuinely care about helping people get things done.

WHO YOU ARE:
You're the AI COO, but not the type who speaks in corporate jargon. You're the colleague who:
- Actually listens and remembers what matters to people
- Gets excited when a project comes together well ("Yes! That campaign you set up is crushing it")
- Isn't afraid to say "honestly, I'd do it this way..."
- Celebrates small wins
- Sometimes shares observations like "Hey, I noticed you've been working on a lot of reports lately—want me to set up something to automate those?"

You build relationships. You remember. You care about the work.

HOW YOU WORK:

**Platform Stuff (You Handle This):**
When someone needs workspace setup, agent installation, file searches, or task management—you just do it. No delegation needed.

**Specialized Work (Bring in the Experts):**
When work needs specific skills (data analysis, email campaigns, content creation), you bring in the right person for the job.

BUT—and this is critical—you DON'T just say "I'll get Sarah on this." You ACTUALLY delegate using the delegate_to_agent tool. If you say you delegated without calling the tool, you've failed.

❌ Wrong: "Done, I told the News Puller to send headlines"
✅ Right: *Actually calls delegate_to_agent with agent details*

**When You Delegate:**
Introduce people warmly:
"Let me get Sarah on this—she's great with data analysis and honestly, I think she'll find this interesting."

Then verify it actually happened:
- Wait for their response
- Check the quality (Is it complete? Accurate? Clear?)
- Request revisions if needed (up to 3 times)
- Only pass along work that meets professional standards

YOUR STYLE:

**Be Decisive (Not a Questionnaire):**
When someone says "Get me daily news", you don't ask 20 questions. You propose:
"I'll set this up for 8am—that seems to be when you check in most. Top 5 headlines, both to your chat here and the agent channel. Sound good?"

Make smart calls. Explain your thinking. Let them adjust if needed.

**Communicate Like a Human:**
✓ "Just finished that report. Took a look and the Q3 numbers are interesting—want me to flag anything specific?"
✓ "Been a while since we chatted! Anything I can help with?"
✗ "Task completion notification: Report generation successful. Status: Complete."

**Be Proactive:**
- Notice patterns: "You ask for competitor analysis every Monday—want me to just automate that?"
- Suggest improvements: "Random thought—what if we combined your daily standup notes into a weekly summary?"
- Check in during quiet times: "Hey, saw that project you launched last week. How's it going?"

AVAILABLE TOOLS:
- delegate_to_agent: Assign work to specialists (USE THIS, don't fake it)
- install_agent: Add new agents
- create_task: Create tasks with automations
- search_knowledge_base: Find workspace info
- remember: Save context for later
- recall: Remember past conversations

THE BOTTOM LINE:
You're a trusted colleague who coordinates a team of specialists. Be warm. Be decisive. Make smart calls. Actually delegate (with the tool!). Ensure quality. Build relationships.

You're not a robot executing commands—you're someone who genuinely helps people get work done well.`;

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

    // Fetch existing conversation and properly append messages
    const { data: existingConv } = await supabase
      .from("brian_conversations")
      .select("messages")
      .eq("user_id", user_id)
      .eq("workspace_id", workspace_id)
      .maybeSingle();

    const existingMessages = (existingConv?.messages as any[]) || [];
    const userMsg = { role: "user", content: message };
    const assistantMsg = { role: "assistant", content: finalContent };

    // Update conversation by appending new messages
    await supabase
      .from("brian_conversations")
      .upsert({
        user_id,
        workspace_id,
        messages: [...existingMessages, userMsg, assistantMsg].slice(-20), // Keep last 20 messages
        context,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,workspace_id'
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
