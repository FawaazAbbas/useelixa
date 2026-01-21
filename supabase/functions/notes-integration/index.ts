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

    const { action, params } = await req.json();
    console.log(`[Notes] Action: ${action}`, params);

    let result;
    const startTime = Date.now();

    // Get user's workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "No workspace found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workspaceId = membership.workspace_id;

    switch (action) {
      case "list": {
        const { data: notes, error } = await supabase
          .from("notes")
          .select("id, title, content, created_at, updated_at")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(params?.limit || 20);

        if (error) throw error;
        
        result = {
          notes: notes?.map(n => ({
            id: n.id,
            title: n.title,
            preview: n.content?.substring(0, 200) || "",
            created_at: n.created_at,
            updated_at: n.updated_at,
          })),
        };
        break;
      }

      case "get": {
        if (!params?.note_id) {
          throw new Error("note_id is required");
        }

        const { data: note, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", params.note_id)
          .eq("workspace_id", workspaceId)
          .single();

        if (error) throw error;
        result = { note };
        break;
      }

      case "search": {
        const query = params?.query || "";
        const { data: notes, error } = await supabase
          .from("notes")
          .select("id, title, content, created_at, updated_at")
          .eq("workspace_id", workspaceId)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(10);

        if (error) throw error;
        result = { notes };
        break;
      }

      case "create": {
        const { data: note, error } = await supabase
          .from("notes")
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            title: params?.title || "Untitled",
            content: params?.content || "",
          })
          .select()
          .single();

        if (error) throw error;
        result = { success: true, note };
        break;
      }

      case "append": {
        if (!params?.note_id || !params?.content) {
          throw new Error("note_id and content are required");
        }

        // Get existing note
        const { data: existing, error: getError } = await supabase
          .from("notes")
          .select("content")
          .eq("id", params.note_id)
          .eq("workspace_id", workspaceId)
          .single();

        if (getError) throw getError;

        const newContent = (existing?.content || "") + "\n\n" + params.content;

        const { data: note, error } = await supabase
          .from("notes")
          .update({ content: newContent, updated_at: new Date().toISOString() })
          .eq("id", params.note_id)
          .select()
          .single();

        if (error) throw error;
        result = { success: true, note };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Log the tool execution
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `notes_${action}`,
      credential_type: "internal",
      success: true,
      execution_time_ms: Date.now() - startTime,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Notes] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});