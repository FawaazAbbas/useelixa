import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[Scheduler] Checking for due automations...');

    // Query automations that are due to run
    const { data: dueAutomations, error: fetchError } = await supabase
      .from('automations')
      .select('*, agents(*)')
      .lte('next_run_at', new Date().toISOString())
      .eq('is_enabled', true)
      .neq('schedule_type', 'manual');

    if (fetchError) {
      console.error('[Scheduler] Error fetching automations:', fetchError);
      throw fetchError;
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      console.log('[Scheduler] No automations due to run');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No automations due' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Scheduler] Found ${dueAutomations.length} due automations`);

    // Group automations by chat_id
    const groupedByChat = dueAutomations.reduce((acc: any, automation: any) => {
      const chatId = automation.chat_id || automation.task_id;
      if (!acc[chatId]) {
        acc[chatId] = [];
      }
      acc[chatId].push(automation);
      return acc;
    }, {});

    const results = [];

    // Execute each chat's automation chain
    for (const [chatId, automations] of Object.entries(groupedByChat)) {
      const automationList = automations as any[];
      
      console.log(`[Scheduler] Executing chain for chat/task: ${chatId}`);

      try {
        const { data, error } = await supabase.functions.invoke('execute-automation-chain', {
          body: {
            chat_id: chatId,
            user_id: automationList[0].created_by,
            workspace_id: automationList[0].workspace_id,
            scheduled_run: true,
          },
        });

        if (error) {
          console.error(`[Scheduler] Error executing chain for ${chatId}:`, error);
          results.push({ chat_id: chatId, status: 'failed', error: error.message });
        } else {
          console.log(`[Scheduler] Successfully executed chain for ${chatId}`);
          results.push({ chat_id: chatId, status: 'success', data });
        }
      } catch (error) {
        console.error(`[Scheduler] Exception executing chain for ${chatId}:`, error);
        results.push({ 
          chat_id: chatId, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Update next_run_at for all executed automations
    for (const automation of dueAutomations) {
      const nextRun = calculateNextRunTime(automation);
      
      console.log(`[Scheduler] Updating automation ${automation.id}, next run: ${nextRun}`);

      await supabase
        .from('automations')
        .update({ 
          next_run_at: nextRun,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', automation.id);
    }

    return new Response(
      JSON.stringify({
        processed: dueAutomations.length,
        results,
        message: `Processed ${dueAutomations.length} automations`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Scheduler] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateNextRunTime(automation: any): string | null {
  const now = new Date();
  
  switch (automation.schedule_type) {
    case 'interval':
      if (!automation.schedule_interval_minutes) return null;
      const nextInterval = new Date(now.getTime() + automation.schedule_interval_minutes * 60000);
      return nextInterval.toISOString();
    
    case 'daily':
      // Parse time from schedule_time (HH:MM:SS format)
      const [hours, minutes] = automation.schedule_time.split(':').map(Number);
      const nextDaily = new Date();
      nextDaily.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, move to tomorrow
      if (nextDaily <= now) {
        nextDaily.setDate(nextDaily.getDate() + 1);
      }
      return nextDaily.toISOString();
    
    case 'weekly':
      if (!automation.schedule_days || automation.schedule_days.length === 0) return null;
      
      const [weekHours, weekMinutes] = automation.schedule_time.split(':').map(Number);
      const currentDay = now.getDay();
      
      // Find next scheduled day
      for (let i = 0; i <= 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (automation.schedule_days.includes(checkDay)) {
          const nextWeekly = new Date(now);
          nextWeekly.setDate(now.getDate() + i);
          nextWeekly.setHours(weekHours, weekMinutes, 0, 0);
          
          // Skip if it's today but time has passed
          if (i === 0 && nextWeekly <= now) continue;
          
          return nextWeekly.toISOString();
        }
      }
      return null;
    
    default:
      return null;
  }
}
