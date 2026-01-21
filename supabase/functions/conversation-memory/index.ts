import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

interface Message {
  role: string;
  content: string;
}

/**
 * Generate embedding for text using Lovable AI
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${AI_GATEWAY_URL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) {
      console.error("Embedding API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    return null;
  }
}

/**
 * Generate a summary of the conversation using AI
 */
async function generateSummary(messages: Message[]): Promise<{ summary: string; topics: string[] } | null> {
  try {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a conversation summarizer. Given a conversation, extract:
1. A concise summary (2-3 sentences) capturing the key points and outcomes
2. Key topics discussed (3-5 keywords)

Respond with a JSON object: { "summary": "...", "topics": ["topic1", "topic2", ...] }`,
          },
          {
            role: "user",
            content: `Summarize this conversation:\n\n${conversationText}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Summary API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "",
        topics: parsed.topics || [],
      };
    }
    
    return null;
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { action, sessionId, query, limit } = await req.json();
    console.log(`[ConversationMemory] Action: ${action}, User: ${user.id}`);

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "summarize_session": {
        // Get all messages from the session
        const { data: messages, error: msgError } = await supabase
          .from("chat_messages_v2")
          .select("role, content")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (msgError || !messages || messages.length < 3) {
          result = { success: false, reason: "Not enough messages to summarize" };
          break;
        }

        // Generate summary
        const summaryResult = await generateSummary(messages);
        if (!summaryResult) {
          result = { success: false, reason: "Failed to generate summary" };
          break;
        }

        // Generate embedding for the summary
        const embedding = await generateEmbedding(summaryResult.summary);

        // Check if summary already exists for this session
        const { data: existing } = await serviceSupabase
          .from("conversation_summaries")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existing) {
          // Update existing summary
          const { error: updateError } = await serviceSupabase
            .from("conversation_summaries")
            .update({
              summary: summaryResult.summary,
              key_topics: summaryResult.topics,
              embedding: embedding,
              message_count: messages.length,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (updateError) throw updateError;
          result = { success: true, action: "updated", summary: summaryResult.summary };
        } else {
          // Insert new summary
          const { error: insertError } = await serviceSupabase
            .from("conversation_summaries")
            .insert({
              user_id: user.id,
              session_id: sessionId,
              summary: summaryResult.summary,
              key_topics: summaryResult.topics,
              embedding: embedding,
              message_count: messages.length,
            });

          if (insertError) throw insertError;
          result = { success: true, action: "created", summary: summaryResult.summary };
        }

        console.log(`✅ Summarized session ${sessionId}: ${summaryResult.topics.join(", ")}`);
        break;
      }

      case "recall_memories": {
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);
        if (!queryEmbedding) {
          result = { memories: [], reason: "Failed to generate query embedding" };
          break;
        }

        // Search for similar memories
        const { data: memories, error: searchError } = await serviceSupabase.rpc(
          "match_conversation_memories",
          {
            query_embedding: queryEmbedding,
            match_user_id: user.id,
            match_threshold: 0.5,
            match_count: limit || 5,
          }
        );

        if (searchError) {
          console.error("Memory search error:", searchError);
          result = { memories: [], error: searchError.message };
          break;
        }

        result = { memories: memories || [] };
        console.log(`📚 Recalled ${memories?.length || 0} memories for query`);
        break;
      }

      case "get_recent_context": {
        // Get recent summaries for context (no semantic search)
        const { data: recentSummaries, error: recentError } = await serviceSupabase
          .from("conversation_summaries")
          .select("summary, key_topics, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit || 3);

        if (recentError) throw recentError;
        result = { context: recentSummaries || [] };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ConversationMemory] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
