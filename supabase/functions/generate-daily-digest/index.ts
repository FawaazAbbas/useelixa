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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    const { forceGenerate } = await req.json().catch(() => ({}));

    // Get user from auth header or generate for all users
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const today = new Date().toISOString().split("T")[0];

    // Build digest content
    const digestContent: {
      date: string;
      summary: string;
      sections: {
        tasks: { due_today: { id: string; title: string; priority: string }[]; overdue: { id: string; title: string; days_overdue: number }[]; completed_yesterday: { id: string; title: string }[] };
        calendar: { today_events: { title: string; time: string }[]; upcoming: { title: string; date: string }[] };
        emails: { unread_count: number; important: { subject: string; from: string; snippet: string }[]; actionable: { subject: string; from: string; action_needed: string }[] };
        metrics: Record<string, unknown>;
        ai_suggestions: string[];
      };
    } = {
      date: today,
      summary: "Your daily summary is ready.",
      sections: {
        tasks: { due_today: [], overdue: [], completed_yesterday: [] },
        calendar: { today_events: [], upcoming: [] },
        emails: { unread_count: 0, important: [], actionable: [] },
        metrics: {},
        ai_suggestions: ["Check your pending tasks", "Review calendar for tomorrow"],
      },
    };

    // Fetch user's tasks
    if (userId) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, priority, status, due_date")
        .eq("user_id", userId);

      if (tasks) {
        digestContent.sections.tasks.due_today = tasks
          .filter((t) => t.due_date === today && t.status !== "done")
          .map((t) => ({ id: t.id, title: t.title, priority: t.priority || "medium" }));
        
        digestContent.sections.tasks.overdue = tasks
          .filter((t) => t.due_date && t.due_date < today && t.status !== "done")
          .map((t) => ({ id: t.id, title: t.title, days_overdue: Math.floor((Date.now() - new Date(t.due_date).getTime()) / 86400000) }));
      }
    }

    // Save digest
    if (userId) {
      await supabase.from("daily_digests").upsert({
        user_id: userId,
        digest_date: today,
        content: digestContent,
        summary: `You have ${digestContent.sections.tasks.due_today.length} tasks due today.`,
      }, { onConflict: "user_id,digest_date" });
    }

    return new Response(JSON.stringify({ success: true, digest: digestContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
