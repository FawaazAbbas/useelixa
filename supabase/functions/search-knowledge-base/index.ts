import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, limit = 5 } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query string is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SearchKnowledgeBase] Searching for: "${query}"`);

    // Get user's workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "No workspace found for user", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workspaceId = membership.workspace_id;

    // First, try to use vector similarity search if embeddings exist
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      try {
        // Generate embedding for the query
        const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: query,
          }),
        });

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const queryEmbedding = embeddingData.data?.[0]?.embedding;

          if (queryEmbedding) {
            // Try semantic search using the match_documents function
            const serviceSupabase = createClient(
              Deno.env.get("SUPABASE_URL")!,
              Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            const { data: semanticResults, error: rpcError } = await serviceSupabase.rpc(
              "match_documents",
              {
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: limit,
                p_workspace_id: workspaceId,
              }
            );

            if (!rpcError && semanticResults && semanticResults.length > 0) {
              console.log(`[SearchKnowledgeBase] Found ${semanticResults.length} semantic matches`);
              
              return new Response(
                JSON.stringify({
                  results: semanticResults.map((doc: any) => ({
                    id: doc.id,
                    title: doc.title,
                    content: doc.content?.substring(0, 1000) || "",
                    similarity: doc.similarity,
                  })),
                  searchType: "semantic",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      } catch (embeddingError) {
        console.log("[SearchKnowledgeBase] Semantic search failed, falling back to text search:", embeddingError);
      }
    }

    // Fallback to text-based search
    console.log("[SearchKnowledgeBase] Using text-based search");
    
    // Try full-text search first
    const { data: ftsResults, error: ftsError } = await supabase
      .from("workspace_documents")
      .select("id, title, extracted_content, created_at")
      .eq("workspace_id", workspaceId)
      .textSearch("extracted_content", query)
      .limit(limit);

    if (!ftsError && ftsResults && ftsResults.length > 0) {
      return new Response(
        JSON.stringify({
          results: ftsResults.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            content: doc.extracted_content?.substring(0, 1000) || "",
            created_at: doc.created_at,
          })),
          searchType: "fulltext",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Final fallback to ILIKE search
    const { data: ilikeResults } = await supabase
      .from("workspace_documents")
      .select("id, title, extracted_content, created_at")
      .eq("workspace_id", workspaceId)
      .or(`title.ilike.%${query}%,extracted_content.ilike.%${query}%`)
      .limit(limit);

    return new Response(
      JSON.stringify({
        results: (ilikeResults || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          content: doc.extracted_content?.substring(0, 1000) || "",
          created_at: doc.created_at,
        })),
        searchType: "keyword",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[SearchKnowledgeBase] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
