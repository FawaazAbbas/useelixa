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

    // Get all active user-agent relationships
    const { data: relationships, error: relError } = await supabase
      .from("user_agent_relationships")
      .select(`
        *,
        agents!inner(id, name, personality_traits, communication_quirks, is_chat_compatible)
      `)
      .gte("rapport_level", 5) // Only proactive for agents with some rapport
      .order("last_interaction", { ascending: true });

    if (relError) throw relError;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const proactiveMessages: any[] = [];

    // Check each relationship for proactive message opportunities
    for (const rel of relationships || []) {
      const hoursSinceLastInteraction = 
        (Date.now() - new Date(rel.last_interaction).getTime()) / (1000 * 60 * 60);

      // Skip if interacted recently (less than 24 hours)
      if (hoursSinceLastInteraction < 24) continue;

      // Get user's recent tasks and automations
      const { data: recentTasks } = await supabase
        .from("tasks")
        .select("*, automations(*)")
        .eq("user_id", rel.user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent automation logs for pattern detection
      const { data: recentLogs } = await supabase
        .from("automation_logs")
        .select("*, automations!inner(name, action)")
        .eq("automations.workspace_id", rel.workspace_id)
        .order("executed_at", { ascending: false })
        .limit(10);

      // Analyze context and determine if proactive message is appropriate
      const contextPrompt = `You are ${rel.agents.name}, and you're considering sending a proactive message to a user you've been working with.

Relationship Context:
- Rapport level: ${rel.rapport_level}/10
- Total interactions: ${rel.interaction_count}
- Last interaction: ${Math.round(hoursSinceLastInteraction)} hours ago
- Shared context: ${JSON.stringify(rel.shared_context)}

Recent User Activity:
${recentTasks?.length ? `Recent tasks: ${recentTasks.map(t => `"${t.title}" (${t.status})`).join(", ")}` : "No recent tasks"}
${recentLogs?.length ? `Recent automations: ${recentLogs.map(l => `${l.automations.name} - ${l.status}`).join(", ")}` : "No recent automation activity"}

Your personality: ${JSON.stringify(rel.agents.personality_traits)}
Your communication style: ${rel.agents.communication_quirks?.join(", ")}

Should you send a proactive message? Consider:
1. Has enough time passed (24+ hours)?
2. Is there a pattern worth mentioning?
3. Is there an opportunity to help?
4. Would the message feel natural, not forced?

If yes, provide:
{
  "should_send": true,
  "message": "Your natural, human message here",
  "observation": "Pattern or insight you noticed"
}

If no:
{
  "should_send": false,
  "reason": "Why not"
}

Be selective. Only send if it genuinely adds value.`;

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
          .eq("workspace_id", rel.workspace_id)
          .eq("type", "direct")
          .limit(1);

        let chatId = chats?.[0]?.id;

        if (!chatId) {
          // Create new chat if none exists
          const { data: newChat } = await supabase
            .from("chats")
            .insert({
              workspace_id: rel.workspace_id,
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

        // Post proactive message
        const { error: msgError } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            agent_id: rel.agent_id,
            content: decision.message,
            metadata: {
              proactive: true,
              trigger: "pattern_detection",
              observation: decision.observation
            }
          });

        if (msgError) {
          console.error("Failed to post proactive message:", msgError);
        } else {
          console.log(`✓ Sent proactive message from ${rel.agents.name} to user ${rel.user_id}`);
          
          // Store observation
          if (decision.observation) {
            await supabase.from("agent_observations").insert({
              agent_id: rel.agent_id,
              user_id: rel.user_id,
              workspace_id: rel.workspace_id,
              observation: decision.observation,
              confidence: 0.8
            });
          }

          proactiveMessages.push({
            agent: rel.agents.name,
            user_id: rel.user_id,
            message: decision.message
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