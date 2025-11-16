import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chat_id, agent_id, user_id } = await req.json();
    
    console.log('Routing message to agent:', { agent_id, chat_id, user_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch agent details including webhook URL
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('webhook_url, api_authentication_type, response_timeout, name, configuration_schema')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('Agent not found:', agentError);
      throw new Error('Agent not found');
    }

    if (!agent.webhook_url) {
      throw new Error('Agent webhook URL not configured');
    }

    // Get agent installation and configuration
    const { data: installation } = await supabase
      .from('agent_installations')
      .select('id')
      .eq('agent_id', agent_id)
      .eq('user_id', user_id)
      .single();

    let userConfiguration: Record<string, any> = {};
    if (installation) {
      const { data: config } = await supabase
        .from('agent_configurations')
        .select('configuration')
        .eq('agent_installation_id', installation.id)
        .single();
      
      if (config) {
        userConfiguration = config.configuration || {};
      }
    }

    // Get previous messages for context (last 5 messages)
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('content, user_id, agent_id, created_at')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Prepare payload for agent webhook
    const payload = {
      message,
      user_id,
      chat_id,
      agent_id,
      configuration: userConfiguration,
      context: {
        previous_messages: previousMessages?.reverse() || [],
      }
    };

    console.log('Sending payload to webhook:', agent.webhook_url);

    // Call agent's webhook
    const startTime = Date.now();
    const timeout = (agent.response_timeout || 30) * 1000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let agentResponse;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication if needed
      if (agent.api_authentication_type === 'bearer' && userConfiguration.bearer_token) {
        headers['Authorization'] = `Bearer ${userConfiguration.bearer_token}`;
      } else if (agent.api_authentication_type === 'api_key' && userConfiguration.api_key) {
        headers['X-API-Key'] = userConfiguration.api_key;
      }

      agentResponse = await fetch(agent.webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Agent response timeout after ${agent.response_timeout}s`);
      }
      throw error;
    }

    const processingTime = Date.now() - startTime;

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Agent webhook error:', errorText);
      
      // Save error message to database
      await supabase.from('messages').insert({
        chat_id,
        agent_id,
        content: `Error: Agent returned status ${agentResponse.status}`,
        error_message: errorText,
        processing_time_ms: processingTime,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'agent_message_error',
        entity_type: 'agent',
        entity_id: agent_id,
        agent_id,
        user_id,
        status: 'error',
        metadata: {
          error: errorText,
          status_code: agentResponse.status,
          processing_time_ms: processingTime,
        }
      });

      throw new Error(`Agent returned status ${agentResponse.status}`);
    }

    // Parse agent response
    const responseData = await agentResponse.json();
    const content = responseData.content || responseData.response || responseData.message || JSON.stringify(responseData);

    console.log('Agent response received:', { content, processingTime });

    // Save agent's response to messages table
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        chat_id,
        agent_id,
        content,
        processing_time_ms: processingTime,
        response_metadata: responseData.metadata || null,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message:', saveError);
      throw saveError;
    }

    // Update chat last_activity
    await supabase
      .from('chats')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', chat_id);

    // Log successful activity
    await supabase.from('activity_logs').insert({
      action: 'agent_message_received',
      entity_type: 'agent',
      entity_id: agent_id,
      agent_id,
      user_id,
      status: 'success',
      metadata: {
        processing_time_ms: processingTime,
        chat_id,
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: savedMessage,
        processing_time_ms: processingTime,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in route-to-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
