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

    // Fetch agent details including webhook URL and workflow
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('webhook_url, api_authentication_type, response_timeout, name, configuration_schema, is_workflow_based, workflow_json')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('Agent not found:', agentError);
      throw new Error('Agent not found');
    }

    // Check if agent is workflow-based or webhook-based
    if (!agent.is_workflow_based && !agent.webhook_url) {
      throw new Error('Agent not properly configured');
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

    const startTime = Date.now();
    let content = '';
    let processingTime = 0;

    // Handle workflow-based agents with Lovable AI
    if (agent.is_workflow_based && agent.workflow_json) {
      console.log('Executing workflow-based agent with Lovable AI');
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (!LOVABLE_API_KEY) {
        throw new Error('Lovable AI not configured');
      }

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are an AI agent named "${agent.name}". Your workflow configuration defines your capabilities and behavior. Previous conversation context: ${previousMessages?.map((m: any) => `${m.user_id ? 'User' : 'Agent'}: ${m.content}`).join('\n')}`
              },
              { role: 'user', content: message }
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`Lovable AI error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        content = aiData.choices?.[0]?.message?.content || 'No response generated';
        processingTime = Date.now() - startTime;

      } catch (error: any) {
        processingTime = Date.now() - startTime;
        console.error('AI execution error:', error);
        
        await supabase.from('messages').insert({
          chat_id,
          agent_id,
          content: `Error: ${error.message}`,
          error_message: error.message,
          processing_time_ms: processingTime,
        });

        throw error;
      }

    } else if (agent.webhook_url) {
      // Handle webhook-based agents
      console.log('Sending payload to webhook:', agent.webhook_url);
      
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
        processingTime = Date.now() - startTime;
        
        if (error.name === 'AbortError') {
          throw new Error(`Agent response timeout after ${agent.response_timeout}s`);
        }
        throw error;
      }

      processingTime = Date.now() - startTime;

      if (!agentResponse.ok) {
        const errorText = await agentResponse.text();
        console.error('Agent webhook error:', errorText);
        
        await supabase.from('messages').insert({
          chat_id,
          agent_id,
          content: `Error: Agent returned status ${agentResponse.status}`,
          error_message: errorText,
          processing_time_ms: processingTime,
        });

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

      const responseData = await agentResponse.json();
      content = responseData.content || responseData.response || responseData.message || JSON.stringify(responseData);
    }

    console.log('Agent response received:', { content, processingTime });

    // Save agent's response to messages table
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        chat_id,
        agent_id,
        content,
        processing_time_ms: processingTime,
        response_metadata: null,
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
