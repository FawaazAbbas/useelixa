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
    const { chat_id, user_id, workspace_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch automations for this chat ordered by chain_order
    const { data: automations, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('status', 'active')
      .order('chain_order', { ascending: true });

    if (fetchError || !automations || automations.length === 0) {
      throw new Error('No automations found for this chat');
    }

    const results = [];
    let previousOutput = null;

    // Execute each automation sequentially
    for (const automation of automations) {
      const startTime = Date.now();
      
      try {
        // Call route-to-agent for each automation
        const { data: agentResponse, error: agentError } = await supabase.functions.invoke('route-to-agent', {
          body: {
            message: automation.action + (previousOutput ? `\n\nPrevious step output: ${JSON.stringify(previousOutput)}` : ''),
            chat_id,
            agent_id: automation.agent_id,
            user_id,
            workspace_id,
            chat_type: 'direct',
          },
        });

        const executionTime = Date.now() - startTime;

        if (agentError) throw agentError;

        // Log success
        await supabase.from('automation_logs').insert({
          automation_id: automation.id,
          status: 'success',
          executed_at: new Date().toISOString(),
          execution_time_ms: executionTime,
          output_data: agentResponse,
        });

        previousOutput = agentResponse?.message?.content || agentResponse;
        results.push({
          automation_id: automation.id,
          name: automation.name,
          status: 'success',
          execution_time_ms: executionTime,
        });

        // Post summary to chat
        await supabase.from('messages').insert({
          chat_id,
          agent_id: automation.agent_id,
          content: `✅ Completed "${automation.name}" automation in ${executionTime}ms`,
          metadata: { automation_id: automation.id, is_automation_summary: true },
        });

      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log failure
        await supabase.from('automation_logs').insert({
          automation_id: automation.id,
          status: 'failed',
          executed_at: new Date().toISOString(),
          execution_time_ms: executionTime,
          error_message: errorMessage,
        });

        // Post error to chat
        await supabase.from('messages').insert({
          chat_id,
          agent_id: automation.agent_id,
          content: `❌ Failed "${automation.name}" automation: ${errorMessage}`,
          metadata: { automation_id: automation.id, is_automation_summary: true },
          error_message: errorMessage,
        });

        results.push({
          automation_id: automation.id,
          name: automation.name,
          status: 'failed',
          error: errorMessage,
          execution_time_ms: executionTime,
        });

        // Stop chain on failure
        break;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Automation chain completed',
        results,
        total_executed: results.length,
        total_success: results.filter(r => r.status === 'success').length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Execute chain error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
