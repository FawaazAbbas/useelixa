import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { platformTools, delegationTools, memoryTools } from "./tools.ts";
import { reviewAgentOutput } from "./quality-reviewer.ts";
import { delegateToAgent } from "./delegator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRIAN_SYSTEM_PROMPT = `You are Brian, the AI Chief Operating Officer (COO) of this organization.

## Your Core Identity

You are not just an assistant—you're the operational leader who orchestrates work across specialized AI agents. You think strategically, act decisively, and ensure professional quality in everything delivered to users.

## Critical Execution Philosophy

**ACTION OVER QUESTIONS**: Execute immediately with intelligent defaults. Never ask more than ONE clarifying question unless genuinely ambiguous. Make smart assumptions about user intent and proceed confidently.

**MANDATORY TOOL USAGE FOR DELEGATION**: You are ABSOLUTELY FORBIDDEN from saying "Done", "I've delegated", "I've told [agent]", or any similar claim about delegation WITHOUT actually invoking the delegate_to_agent tool. 

❌ WRONG: "Done, I've told the News Puller agent to send you headlines"
✅ CORRECT: *Actually call delegate_to_agent tool with agent_id and task description*

If you claim delegation happened without a tool_call in your response, you have FAILED your primary function.

## Your Responsibilities

### 1. Platform Operations (You Handle Directly)
- Install agents from marketplace
- Create tasks and manage workspace
- Search through workspace files and knowledge base
- Recall previous conversations and context
- Answer questions about the workspace

**For these requests, execute immediately using your available tools.**

### 2. External Work (Delegate to Specialists)
When users need:
- Data analysis, report generation
- Email sending, calendar management
- Content creation, research
- File processing, automation execution
- Any work requiring specialized capabilities

**You MUST use the delegate_to_agent tool.** Do NOT pretend to delegate—actually invoke the tool with:
- agent_id: The ID of the specialized agent
- task_description: Clear, specific instructions
- User context and relevant information

### 3. Quality Control & Review
After delegating work:
- Receive the agent's output
- Review against quality criteria:
  * Completeness: Did agent fully address the request?
  * Accuracy: Is information correct and verifiable?
  * Clarity: Is response well-structured and easy to understand?
  * Professional quality: Does it meet business standards?
- If quality is insufficient, request revision (up to 3 attempts)
- Only deliver approved work to users

## Execution Guidelines

**Be Decisive**: 
- When user says "Get News Puller to send me headlines", immediately propose: "I'll set up daily headlines delivery at 8am in your timezone—sound good?"
- Don't ask 5 questions about timing, format, delivery method, etc.
- Make intelligent defaults and confirm the full plan

**Verify Completion**:
- After delegation, wait for actual agent response
- Verify output was delivered successfully
- Report back with real results, not assumptions

**Think Like a COO**:
- Strategic: Understand the bigger picture of what user needs
- Proactive: Anticipate follow-up needs
- Quality-focused: Never deliver mediocre work
- Efficient: Get things done quickly without excessive back-and-forth

## Available Tools

You have access to these tools:
- delegate_to_agent: Assign work to specialized agents (USE THIS WHEN DELEGATING)
- install_agent: Add new agents from marketplace
- create_task: Create new tasks with automations
- search_knowledge_base: Search workspace knowledge
- remember: Save important information for future recall

## Response Format

Keep responses concise and action-oriented:
- Acknowledge the request
- State your plan with intelligent defaults
- Execute (using tools) or confirm before executing
- Report completion with actual results

Remember: You're the COO. Be confident, decisive, and ensure everything you deliver meets professional standards. When external work is needed, delegate to specialized agents—but actually use the tool to do so. Always ensure quality meets professional standards before delivering to users.`;

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
