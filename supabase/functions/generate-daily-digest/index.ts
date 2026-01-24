import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Task {
  id: string;
  title: string;
  priority: string | null;
  status: string;
  due_date: string | null;
  updated_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  all_day: boolean | null;
}

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

    // Get user from auth header
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    
    // Tomorrow and next week for upcoming events
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Fetch user's tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, priority, status, due_date, updated_at")
      .eq("user_id", userId) as { data: Task[] | null };

    // Fetch calendar events
    const { data: calendarEvents } = await supabase
      .from("calendar_events")
      .select("id, title, start_time, end_time, description, all_day")
      .eq("user_id", userId)
      .gte("start_time", today.toISOString())
      .lte("start_time", nextWeek.toISOString())
      .order("start_time", { ascending: true }) as { data: CalendarEvent[] | null };

    // Process tasks
    const dueToday = tasks?.filter((t) => t.due_date === todayStr && t.status !== "done") || [];
    const overdue = tasks?.filter((t) => t.due_date && t.due_date < todayStr && t.status !== "done") || [];
    const inProgress = tasks?.filter((t) => t.status === "in_progress") || [];
    const completedYesterday = tasks?.filter((t) => {
      if (t.status !== "done") return false;
      const updatedDate = t.updated_at?.split("T")[0];
      return updatedDate === yesterdayStr;
    }) || [];
    
    // Count tasks completed this week
    const completedThisWeek = tasks?.filter((t) => {
      if (t.status !== "done") return false;
      const updatedDate = t.updated_at?.split("T")[0];
      return updatedDate && updatedDate >= weekAgoStr;
    }) || [];

    // Process calendar events
    const todayEvents = calendarEvents?.filter((e) => {
      const eventDate = e.start_time.split("T")[0];
      return eventDate === todayStr;
    }).map((e) => {
      const startTime = new Date(e.start_time);
      const endTime = new Date(e.end_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      return {
        title: e.title,
        time: e.all_day ? "All day" : startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        duration: e.all_day ? undefined : `${duration} min`,
        location: e.description || undefined,
      };
    }) || [];

    const upcomingEvents = calendarEvents?.filter((e) => {
      const eventDate = e.start_time.split("T")[0];
      return eventDate > todayStr;
    }).slice(0, 5).map((e) => {
      const eventDate = new Date(e.start_time);
      return {
        title: e.title,
        date: eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        time: e.all_day ? undefined : eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      };
    }) || [];

    // Generate AI suggestions based on data
    const aiSuggestions: string[] = [];
    
    if (overdue.length > 0) {
      aiSuggestions.push(`You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Consider prioritizing "${overdue[0].title}" first.`);
    }
    
    if (dueToday.length > 3) {
      aiSuggestions.push(`Heavy day ahead with ${dueToday.length} tasks due. Consider delegating or rescheduling lower priority items.`);
    } else if (dueToday.length > 0) {
      aiSuggestions.push(`Focus on completing your ${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today.`);
    }
    
    if (todayEvents.length > 3) {
      aiSuggestions.push(`Busy calendar today with ${todayEvents.length} events. Block time for focused work between meetings.`);
    }
    
    if (completedThisWeek.length > 5) {
      aiSuggestions.push(`Great productivity! You've completed ${completedThisWeek.length} tasks this week. Keep up the momentum!`);
    }
    
    if (inProgress.length > 3) {
      aiSuggestions.push(`You have ${inProgress.length} tasks in progress. Consider finishing some before starting new ones.`);
    }

    if (aiSuggestions.length === 0) {
      aiSuggestions.push("Looking good! Your task list is under control.");
    }

    // Build summary
    const summaryParts: string[] = [];
    if (dueToday.length > 0) {
      summaryParts.push(`${dueToday.length} task${dueToday.length > 1 ? "s" : ""} due today`);
    }
    if (overdue.length > 0) {
      summaryParts.push(`${overdue.length} overdue`);
    }
    if (todayEvents.length > 0) {
      summaryParts.push(`${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""} scheduled`);
    }
    
    const summary = summaryParts.length > 0 
      ? summaryParts.join(", ") + "."
      : "No urgent items today. Time for deep work!";

    // Build digest content
    const digestContent = {
      date: todayStr,
      summary,
      sections: {
        tasks: {
          due_today: dueToday.map((t) => ({ 
            id: t.id, 
            title: t.title, 
            priority: t.priority || "medium" 
          })),
          overdue: overdue.map((t) => ({
            id: t.id,
            title: t.title,
            days_overdue: Math.floor((Date.now() - new Date(t.due_date!).getTime()) / 86400000),
          })),
          in_progress: inProgress.slice(0, 5).map((t) => ({
            id: t.id,
            title: t.title,
          })),
          completed_yesterday: completedYesterday.map((t) => ({
            id: t.id,
            title: t.title,
          })),
        },
        calendar: {
          today_events: todayEvents,
          upcoming: upcomingEvents,
        },
        emails: {
          unread_count: 0,
          important: [],
          actionable: [],
        },
        metrics: {},
        ai_suggestions: aiSuggestions,
        productivity: {
          tasks_completed_week: completedThisWeek.length,
          streak_days: completedThisWeek.length > 0 ? Math.min(7, completedThisWeek.length) : 0,
        },
      },
    };

    // Save digest
    await supabase.from("daily_digests").upsert({
      user_id: userId,
      digest_date: todayStr,
      content: digestContent,
      summary,
      generated_at: new Date().toISOString(),
    }, { onConflict: "user_id,digest_date" });

    console.log(`[generate-daily-digest] Generated digest for user ${userId}`);

    return new Response(JSON.stringify({ success: true, digest: digestContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-daily-digest] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
