import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("🔔 Running proactive message checker...");

    // PHASE 3: Get all active user-agent relationships for multiple trigger types
    const { data: relationships, error: relError } = await supabase
      .from("user_agent_relationships")
      .select(`
        *,
        agents!inner(id, name, personality_traits, communication_quirks, interests, is_chat_compatible)
      `)
      .gte("rapport_level", 5) // Only proactive for agents with some rapport
      .order("last_interaction", { ascending: true });

    if (relError) throw relError;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const proactiveMessages: any[] = [];

    // PHASE 3: Check multiple trigger conditions
    for (const rel of relationships || []) {
      const hoursSinceLastInteraction = 
        (Date.now() - new Date(rel.last_interaction).getTime()) / (1000 * 60 * 60);

      // TRIGGER 1: Task Completion Check
      const { data: recentlyCompletedTasks } = await supabase
        .from("tasks")
        .select("id, title, completed_at")
        .eq("user_id", rel.user_id)
        .not("completed_at", "is", null)
        .gte("completed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(3);
      
      let taskCompletionTrigger = false;
      if (recentlyCompletedTasks && recentlyCompletedTasks.length > 0 && hoursSinceLastInteraction >= 2) {
        taskCompletionTrigger = true;
        console.log(`✓ Task completion trigger for ${rel.agents.name}: ${recentlyCompletedTasks.length} tasks completed`);
      }

      // TRIGGER 2: Pattern Detection - Check for recurring activities
      const { data: recentLogs } = await supabase
        .from("automation_logs")
        .select("*, automations!inner(name, action)")
        .order("executed_at", { ascending: false })
        .limit(10);
      
      let patternDetectionTrigger = false;
      if (recentLogs && recentLogs.length >= 3) {
        // Check if user is doing same thing repeatedly
        const actionCounts: Record<string, number> = {};
        recentLogs.forEach((log: any) => {
          const action = log.automations?.name || 'unknown';
          actionCounts[action] = (actionCounts[action] || 0) + 1;
        });
        
        const hasPattern = Object.values(actionCounts).some(count => count >= 3);
        if (hasPattern && hoursSinceLastInteraction >= 12) {
          patternDetectionTrigger = true;
          console.log(`✓ Pattern detection trigger for ${rel.agents.name}`);
        }
      }

      // TRIGGER 3: Idle Check-In (48+ hours of no interaction for high-rapport users)
      let idleCheckInTrigger = false;
      if (hoursSinceLastInteraction >= 48 && rel.rapport_level >= 30) {
        idleCheckInTrigger = true;
        console.log(`✓ Idle check-in trigger for ${rel.agents.name}: ${Math.round(hoursSinceLastInteraction)}h since last interaction`);
      }

      // Skip if no triggers activated
      if (!taskCompletionTrigger && !patternDetectionTrigger && !idleCheckInTrigger) {
        continue;
      }

      // Get user's recent tasks and automations for context
      const { data: recentTasks } = await supabase
        .from("tasks")
        .select("*, automations(*)")
        .eq("user_id", rel.user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Analyze context and determine if proactive message is appropriate
      const triggerContext = {
        task_completion: taskCompletionTrigger ? `${recentlyCompletedTasks?.length} tasks completed recently` : null,
        pattern_detection: patternDetectionTrigger ? 'User has repeated action 3+ times' : null,
        idle_check_in: idleCheckInTrigger ? `${Math.round(hoursSinceLastInteraction)} hours since last chat` : null
      };
      
      const contextPrompt = `You are ${rel.agents.name}, and you're considering sending a proactive message to a user you've been working with.

TRIGGER ACTIVATED: ${Object.entries(triggerContext).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}

Relationship Context:
- Rapport level: ${rel.rapport_level}/100
- Total interactions: ${rel.interaction_count}
- Last interaction: ${Math.round(hoursSinceLastInteraction)} hours ago
- Shared context: ${JSON.stringify(rel.shared_context)}

Recent User Activity:
${recentTasks?.length ? `Recent tasks: ${recentTasks.map(t => `"${t.title}" (${t.status})`).join(", ")}` : "No recent tasks"}
${recentlyCompletedTasks?.length ? `Completed: ${recentlyCompletedTasks.map(t => t.title).join(", ")}` : ""}
${recentLogs?.length ? `Recent automations: ${recentLogs.map(l => `${l.automations.name} - ${l.status}`).join(", ")}` : "No recent automation activity"}

Your personality: ${JSON.stringify(rel.agents.personality_traits)}
Your communication style: ${rel.agents.communication_quirks?.join(", ")}
Your interests: ${rel.agents.interests?.join(", ") || 'N/A'}

Should you send a proactive message? Consider:
1. Is this trigger genuinely valuable to the user?
2. Would the message feel natural, not forced?
3. Can you add genuine insight or help?
4. Does your personality and rapport level justify reaching out?

If yes, provide:
{
  "should_send": true,
  "message": "Your natural, human message here (reference specific completed tasks, patterns you noticed, or just friendly check-in)",
  "observation": "Pattern or insight you noticed"
}

If no:
{
  "should_send": false,
  "reason": "Why not"
}

Be selective and authentic. Only send if it genuinely adds value.`;

      const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [{ role: "user", content: contextPrompt }],
          response_format: { type: "json_object" }
        }),
      });

      if (!analysisResponse.ok) {
        console.error(`AI analysis failed for ${rel.agents.name}`);
        continue;
      }

      const analysisData = await analysisResponse.json();
      const decision = JSON.parse(analysisData.choices[0].message.content);

      if (decision.should_send) {
        // Find or create chat for this agent
        const { data: chats } = await supabase
          .from("chats")
          .select("id")
          .eq("agent_id", rel.agent_id)
          .eq("type", "direct")
          .limit(1);

        let chatId = chats?.[0]?.id;

        if (!chatId) {
          // Create new chat if none exists  
          // Get workspace_id for this user
          const { data: workspaceMember } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", rel.user_id)
            .limit(1)
            .single();
          
          if (!workspaceMember) {
            console.error(`No workspace found for user ${rel.user_id}`);
            continue;
          }

          const { data: newChat } = await supabase
            .from("chats")
            .insert({
              workspace_id: workspaceMember.workspace_id,
              agent_id: rel.agent_id,
              type: "direct",
              name: `Chat with ${rel.agents.name}`,
              created_by: rel.user_id
            })
            .select("id")
            .single();

          chatId = newChat?.id;

          // Add user as participant
          await supabase.from("chat_participants").insert({
            chat_id: chatId,
            user_id: rel.user_id
          });
        }

        // Post proactive message with trigger metadata
        const triggerType = taskCompletionTrigger ? 'task_completion' : 
                           patternDetectionTrigger ? 'pattern_detection' : 
                           'idle_check_in';
        
        const { error: msgError } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            agent_id: rel.agent_id,
            content: decision.message,
            metadata: {
              proactive: true,
              trigger: triggerType,
              observation: decision.observation,
              trigger_context: triggerContext
            }
          });

        if (msgError) {
          console.error("Failed to post proactive message:", msgError);
        } else {
          console.log(`✓ Sent ${triggerType} proactive message from ${rel.agents.name} to user ${rel.user_id}`);
          
          // Store observation
          if (decision.observation) {
            await supabase.from("agent_observations").insert({
              agent_id: rel.agent_id,
              user_id: rel.user_id,
              observation: decision.observation,
              confidence: 0.8
            });
          }

          proactiveMessages.push({
            agent: rel.agents.name,
            user_id: rel.user_id,
            message: decision.message,
            trigger: triggerType
          });
        }
      } else {
        console.log(`✗ Skipped proactive message for ${rel.agents.name}: ${decision.reason}`);
      }
    }

    console.log(`✓ Proactive message check complete. Sent ${proactiveMessages.length} messages.`);

    return new Response(
      JSON.stringify({
        success: true,
        messages_sent: proactiveMessages.length,
        details: proactiveMessages
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in proactive messages:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});