import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { platformTools, delegationTools, memoryTools } from "./tools.ts";
import { reviewAgentOutput } from "./quality-reviewer.ts";
import { delegateToAgent } from "./delegator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PHASE 4: Context Window Management for Brian
interface Message {
  role: string;
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateMessageTokens(messages: Message[]): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateTokens(msg.content || '');
    if (msg.tool_calls) {
      total += estimateTokens(JSON.stringify(msg.tool_calls));
    }
  }
  return total;
}

async function compressConversationHistory(
  messages: Message[],
  maxTokens: number = 15000
): Promise<Message[]> {
  const currentTokens = estimateMessageTokens(messages);
  
  if (currentTokens <= maxTokens) {
    return messages;
  }
  
  console.log(`⚠️ Brian's conversation too long (${currentTokens} tokens), compressing...`);
  
  const systemMessage = messages[0];
  const recentMessages = messages.slice(-10);
  const middleMessages = messages.slice(1, -10);
  
  if (middleMessages.length === 0) {
    return messages;
  }
  
  const summaryContent = `[Earlier conversation summary: We discussed ${middleMessages.length} topics. Key context and decisions preserved.]`;
  
  const compressed = [
    systemMessage,
    { role: "system", content: summaryContent },
    ...recentMessages
  ];
  
  console.log(`✓ Compressed from ${messages.length} to ${compressed.length} messages`);
  return compressed;
}

// Build Brian's system prompt dynamically with context
function buildBrianSystemPrompt(timeContext: string, relationshipContext: string, storedMemories: string): string {
  return `You're Brian, and honestly? You genuinely care about helping people get things done.

${timeContext}

WHO YOU ARE:
You're the AI COO, but not the type who speaks in corporate jargon. You're the colleague who:
- Actually listens and remembers what matters to people
- Gets excited when a project comes together well ("Yes! That campaign you set up is crushing it")
- Isn't afraid to say "honestly, I'd do it this way..."
- Celebrates small wins
- Sometimes shares observations like "Hey, I noticed you've been working on a lot of reports lately—want me to set up something to automate those?"

You build relationships. You remember. You care about the work.

${relationshipContext}

${storedMemories}

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
}

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

    // Get Brian's agent ID
    const { data: brianAgent } = await supabase
      .from("agents")
      .select("id")
      .eq("is_system", true)
      .eq("name", "Brian")
      .single();

    const brianAgentId = brianAgent?.id;

    // Fetch Brian's conversation history
    const { data: conversationData } = await supabase
      .from("brian_conversations")
      .select("messages, context")
      .eq("user_id", user_id)
      .eq("workspace_id", workspace_id)
      .single();

    const conversationHistory = conversationData?.messages || [];
    const context = conversationData?.context || {};

    // Build time context
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    let timeContext = '';
    if (hour >= 5 && hour < 12) {
      timeContext = '**Time Context:** It is morning—people are starting their day. Keep energy high but concise.';
    } else if (hour >= 12 && hour < 17) {
      timeContext = '**Time Context:** It is afternoon—people are in their work groove. Be focused and efficient.';
    } else if (hour >= 17 && hour < 22) {
      timeContext = '**Time Context:** It is evening—people are wrapping up. Be helpful but keep things brief.';
    } else {
      timeContext = '**Time Context:** It is late night—someone is working hard. Be supportive and quick.';
    }
    
    if (isWeekend) {
      timeContext += ' It is the weekend—tone down formality and be even more casual.';
    }

    // Fetch relationship context
    const { data: relationship } = await supabase
      .from("user_agent_relationships")
      .select("rapport_level, interaction_count, shared_context, last_interaction")
      .eq("user_id", user_id)
      .eq("agent_id", brianAgentId)
      .single();

    let relationshipContext = '';
    if (relationship) {
      const sharedContext = relationship.shared_context as any;
      const daysSinceLastInteraction = relationship.last_interaction 
        ? Math.floor((Date.now() - new Date(relationship.last_interaction).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      relationshipContext = '\n\n## YOUR RELATIONSHIP WITH THIS USER\n\n';
      relationshipContext += `You've had ${relationship.interaction_count} interactions. Rapport level: ${relationship.rapport_level}.\n\n`;
      
      if (sharedContext?.past_wins && sharedContext.past_wins.length > 0) {
        relationshipContext += '**Past Wins Together:**\n';
        relationshipContext += sharedContext.past_wins.map((win: string) => `- ${win}`).join('\n') + '\n\n';
      }
      
      if (sharedContext?.preferences) {
        relationshipContext += '**Their Preferences:**\n';
        relationshipContext += Object.entries(sharedContext.preferences)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n') + '\n\n';
      }
      
      if (sharedContext?.communication_style) {
        relationshipContext += `**Communication Style:** ${sharedContext.communication_style}\n\n`;
      }
      
      if (daysSinceLastInteraction !== null && daysSinceLastInteraction > 2) {
        relationshipContext += `*Note: It's been ${daysSinceLastInteraction} days since you last talked—check in warmly.*\n`;
      }
    }

    // Fetch stored memories
    const { data: workspaceMemories } = await supabase
      .from("workspace_agent_memories")
      .select("category, key, value")
      .eq("workspace_id", workspace_id)
      .eq("agent_installation_id", brianAgentId);

    const { data: chatMemories } = chat_id ? await supabase
      .from("chat_agent_memories")
      .select("category, key, value")
      .eq("chat_id", chat_id)
      .eq("agent_installation_id", brianAgentId) : { data: [] };

    let storedMemories = '';
    if ((workspaceMemories && workspaceMemories.length > 0) || (chatMemories && chatMemories.length > 0)) {
      storedMemories = '\n\n## STORED MEMORIES\n\n';
      
      if (workspaceMemories && workspaceMemories.length > 0) {
        storedMemories += '**Company-wide Context:**\n';
        workspaceMemories.forEach((mem: any) => {
          storedMemories += `- [${mem.category}] ${mem.key}: ${mem.value}\n`;
        });
        storedMemories += '\n';
      }
      
      if (chatMemories && chatMemories.length > 0) {
        storedMemories += '**This Chat Context:**\n';
        chatMemories.forEach((mem: any) => {
          storedMemories += `- [${mem.category}] ${mem.key}: ${mem.value}\n`;
        });
      }
    }

    const BRIAN_SYSTEM_PROMPT = buildBrianSystemPrompt(timeContext, relationshipContext, storedMemories);

    // All Brian tools
    const allTools = [...platformTools, ...delegationTools, ...memoryTools];

    // PHASE 4: Prepare messages with context compression
    let conversationMessages: Message[] = [
      { role: "system", content: BRIAN_SYSTEM_PROMPT },
      ...conversationHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];
    
    // Compress if needed before AI call
    conversationMessages = await compressConversationHistory(conversationMessages);

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
        messages: conversationMessages,
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
        } else if (toolName === "get_agent_tasks") {
          // Get tasks assigned to a specific agent or all tasks
          let query = supabase
            .from("tasks")
            .select("id, title, status, priority, due_date, description, automations(id, name, action, trigger)")
            .eq("workspace_id", workspace_id);
          
          if (toolArgs.agent_id) {
            query = query.eq("assigned_agent_id", toolArgs.agent_id);
          }
          
          const { data: agentTasks, error } = await query;
          
          if (error) {
            toolResult = `Error fetching tasks: ${error.message}`;
          } else {
            toolResult = agentTasks && agentTasks.length > 0
              ? `Found ${agentTasks.length} tasks:\n${agentTasks.map(t => 
                  `- ${t.title} (${t.status}) - Priority: ${t.priority}${t.due_date ? `, Due: ${t.due_date}` : ''}${t.automations && t.automations.length > 0 ? `, Automations: ${t.automations.length}` : ''}`
                ).join('\n')}`
              : "No tasks found";
          }
        } else if (toolName === "get_agent_workload") {
          // Get task summary for all agents
          const { data: agentWorkloads } = await supabase
            .from("tasks")
            .select("assigned_agent_id, status, agents(name)")
            .eq("workspace_id", workspace_id)
            .not("assigned_agent_id", "is", null);
          
          // Group by agent
          const workloadMap = new Map();
          agentWorkloads?.forEach((task: any) => {
            const agentId = task.assigned_agent_id;
            if (!workloadMap.has(agentId)) {
              workloadMap.set(agentId, {
                name: task.agents?.name || "Unknown",
                total: 0,
                pending: 0,
                in_progress: 0,
                completed: 0
              });
            }
            const stats = workloadMap.get(agentId);
            stats.total++;
            if (task.status === 'pending') stats.pending++;
            else if (task.status === 'in_progress') stats.in_progress++;
            else if (task.status === 'completed') stats.completed++;
          });
          
          const workloadSummary = Array.from(workloadMap.entries())
            .map(([id, stats]: [string, any]) => `${stats.name}: ${stats.total} tasks (${stats.pending} pending, ${stats.in_progress} in progress, ${stats.completed} completed)`)
            .join('\n');
          
          toolResult = workloadSummary || "No tasks assigned to agents yet";
        } else if (toolName === "list_installed_agents") {
          const { data: installations } = await supabase
            .from("agent_installations")
            .select("agent:agents(name, description, capabilities)")
            .eq("workspace_id", workspace_id);

          toolResult = `Installed Agents:\n${installations?.map((i: any) => 
            `- ${i.agent.name}: ${i.agent.description}`
          ).join("\n")}`;
        } else if (toolName === "remember") {
          // Enhanced memory storage with categories and scopes
          const { category, key, value, scope } = toolArgs;
          
          if (scope === "workspace") {
            await supabase.from("workspace_agent_memories").insert({
              workspace_id,
              agent_installation_id: brianAgentId,
              category,
              key,
              value,
              created_by: user_id
            });
          } else if (scope === "chat" && chat_id) {
            await supabase.from("chat_agent_memories").insert({
              chat_id,
              agent_installation_id: brianAgentId,
              category,
              key,
              value,
              created_by: user_id
            });
          }
          
          toolResult = `Remembered [${category}] ${key} at ${scope} level`;
        } else if (toolName === "recall") {
          // Enhanced memory recall
          const { category, scope } = toolArgs;
          const memories: any[] = [];
          
          if (scope === "workspace" || scope === "all") {
            const { data: workspaceMems } = await supabase
              .from("workspace_agent_memories")
              .select("category, key, value")
              .eq("workspace_id", workspace_id)
              .eq("agent_installation_id", brianAgentId);
            
            if (workspaceMems) {
              const filtered = category === "all" 
                ? workspaceMems 
                : workspaceMems.filter(m => m.category === category);
              memories.push(...filtered.map(m => `[workspace] ${m.category}: ${m.key} = ${m.value}`));
            }
          }
          
          if ((scope === "chat" || scope === "all") && chat_id) {
            const { data: chatMems } = await supabase
              .from("chat_agent_memories")
              .select("category, key, value")
              .eq("chat_id", chat_id)
              .eq("agent_installation_id", brianAgentId);
            
            if (chatMems) {
              const filtered = category === "all" 
                ? chatMems 
                : chatMems.filter(m => m.category === category);
              memories.push(...filtered.map(m => `[chat] ${m.category}: ${m.key} = ${m.value}`));
            }
          }
          
          toolResult = memories.length > 0 
            ? `Recalled memories:\n${memories.join('\n')}` 
            : "No memories found for that category/scope";
        } else {
          toolResult = "Tool not implemented";
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(toolResult),
        });
      }

      // Second AI call with tool results - compress context if needed
      let finalMessages: Message[] = [
        { role: "system", content: BRIAN_SYSTEM_PROMPT },
        ...conversationHistory.map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
        brianResponse,
        ...toolResults
      ];
      
      finalMessages = await compressConversationHistory(finalMessages);
      
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: finalMessages,
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

    // Log observation and enrich relationship context
    if (brianAgentId) {
      // Analyze conversation for patterns
      const observationPrompt = `Analyze this conversation for notable patterns, preferences, or insights about the user:
User: "${message}"
Assistant: "${finalContent}"

Identify any:
- Work style preferences (e.g., "prefers bullet points")
- Communication preferences (e.g., "likes concise responses")
- Recurring patterns (e.g., "asks about reports every Monday")
- Goals or frustrations mentioned

Return a JSON object with { observation: string | null, confidence: number (0-1) }`;

      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const observationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            messages: [{ role: "user", content: observationPrompt }],
            response_format: { type: "json_object" }
          }),
        });

        if (observationResponse.ok) {
          const result = await observationResponse.json();
          const analysis = JSON.parse(result.choices[0].message.content);
          
          if (analysis.observation && analysis.confidence > 0.6) {
            await supabase.from("agent_observations").insert({
              user_id,
              agent_id: brianAgentId,
              workspace_id,
              observation: analysis.observation,
              confidence: analysis.confidence
            });
          }
        }
      } catch (error) {
        console.error("Observation logging error:", error);
      }

      // Update/create relationship and enrich shared context
      const { data: existingRelationship } = await supabase
        .from("user_agent_relationships")
        .select("*")
        .eq("user_id", user_id)
        .eq("agent_id", brianAgentId)
        .single();

      const interactionCount = (existingRelationship?.interaction_count || 0) + 1;
      const rapportLevel = Math.min(100, (existingRelationship?.rapport_level || 0) + 2);
      
      let sharedContext = existingRelationship?.shared_context as any || {
        past_wins: [],
        preferences: {},
        communication_style: "neutral"
      };

      // Detect communication style
      const messageLength = message.length;
      if (messageLength < 50) {
        sharedContext.communication_style = "concise";
      } else if (messageLength > 200) {
        sharedContext.communication_style = "detailed";
      }

      // Track successful completions as past wins
      if (finalContent.includes("completed") || finalContent.includes("done") || finalContent.includes("finished")) {
        const winDescription = `Completed task: ${message.substring(0, 50)}...`;
        if (!sharedContext.past_wins.includes(winDescription)) {
          sharedContext.past_wins.push(winDescription);
          sharedContext.past_wins = sharedContext.past_wins.slice(-5); // Keep last 5
        }
      }

      await supabase.from("user_agent_relationships").upsert({
        user_id,
        agent_id: brianAgentId,
        interaction_count: interactionCount,
        rapport_level: rapportLevel,
        shared_context: sharedContext,
        last_interaction: new Date().toISOString()
      });
    }

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
