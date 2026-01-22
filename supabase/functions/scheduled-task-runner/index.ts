import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse cron expression and check if it should run now
function shouldRunNow(cronExpression: string, lastRun: Date | null): boolean {
  // Simple cron parser for common patterns
  // Format: minute hour dayOfMonth month dayOfWeek
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const now = new Date();
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Check if each part matches
  const matches = (part: string, value: number, max: number): boolean => {
    if (part === '*') return true;
    if (part.includes('/')) {
      const [, step] = part.split('/');
      return value % parseInt(step) === 0;
    }
    if (part.includes(',')) {
      return part.split(',').map(Number).includes(value);
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      return value >= start && value <= end;
    }
    return parseInt(part) === value;
  };

  const minuteMatch = matches(minute, now.getMinutes(), 59);
  const hourMatch = matches(hour, now.getHours(), 23);
  const dayOfMonthMatch = matches(dayOfMonth, now.getDate(), 31);
  const monthMatch = matches(month, now.getMonth() + 1, 12);
  const dayOfWeekMatch = matches(dayOfWeek, now.getDay(), 6);

  // All time parts must match
  if (!minuteMatch || !hourMatch || !dayOfMonthMatch || !monthMatch || !dayOfWeekMatch) {
    return false;
  }

  // Prevent running more than once per schedule window (within 1 minute)
  if (lastRun) {
    const timeSinceLastRun = now.getTime() - lastRun.getTime();
    if (timeSinceLastRun < 60000) { // 1 minute
      return false;
    }
  }

  return true;
}

// Calculate next run time from cron expression
function getNextRunTime(cronExpression: string): Date {
  // Simplified: just add 1 minute for now, actual cron calculation is complex
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[ScheduledTaskRunner] Starting scheduled task check...');

    // Find all AI-assigned tasks with a schedule
    const { data: scheduledTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, description, schedule, last_scheduled_run, user_id, workspace_id')
      .eq('assigned_to', 'ai')
      .not('schedule', 'is', null)
      .not('schedule', 'eq', '');

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled tasks: ${fetchError.message}`);
    }

    console.log(`[ScheduledTaskRunner] Found ${scheduledTasks?.length || 0} scheduled tasks`);

    const tasksToRun: any[] = [];

    for (const task of scheduledTasks || []) {
      const lastRun = task.last_scheduled_run ? new Date(task.last_scheduled_run) : null;
      
      if (shouldRunNow(task.schedule, lastRun)) {
        tasksToRun.push(task);
      }
    }

    console.log(`[ScheduledTaskRunner] ${tasksToRun.length} tasks due to run`);

    const results = [];

    for (const task of tasksToRun) {
      console.log(`[ScheduledTaskRunner] Executing task: ${task.title}`);

      try {
        // Update last_scheduled_run and next_scheduled_run
        const nextRun = getNextRunTime(task.schedule);
        
        await supabase
          .from('tasks')
          .update({
            last_scheduled_run: new Date().toISOString(),
            next_scheduled_run: nextRun.toISOString(),
            status: 'in_progress',
          })
          .eq('id', task.id);

        // Trigger the AI task runner for this specific task
        const { error: invokeError } = await supabase.functions.invoke('ai-task-runner', {
          body: { taskId: task.id },
        });

        if (invokeError) {
          throw invokeError;
        }

        results.push({
          taskId: task.id,
          title: task.title,
          status: 'triggered',
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: task.user_id,
          title: 'Scheduled task started',
          message: `Your scheduled task "${task.title}" has started running.`,
          type: 'task_scheduled',
          data: { task_id: task.id },
        });

      } catch (taskError) {
        console.error(`[ScheduledTaskRunner] Error executing task ${task.id}:`, taskError);
        
        results.push({
          taskId: task.id,
          title: task.title,
          status: 'error',
          error: taskError instanceof Error ? taskError.message : 'Unknown error',
        });

        // Revert task status on error
        await supabase
          .from('tasks')
          .update({ status: 'todo' })
          .eq('id', task.id);
      }
    }

    console.log(`[ScheduledTaskRunner] Completed. Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        tasksChecked: scheduledTasks?.length || 0,
        tasksExecuted: tasksToRun.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ScheduledTaskRunner] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
