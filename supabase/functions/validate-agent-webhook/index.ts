import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url, auth_type = 'none', test_credentials = {} } = await req.json();

    console.log('Validating webhook:', webhook_url);

    // Validate URL format
    let url;
    try {
      url = new URL(webhook_url);
      if (url.protocol !== 'https:') {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Webhook URL must use HTTPS for security',
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid URL format',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Prepare test payload
    const testPayload = {
      message: "This is a test message from the AI Agent Marketplace. Please respond with a simple greeting.",
      user_id: "test-user-id",
      chat_id: "test-chat-id",
      agent_id: "test-agent-id",
      configuration: {},
      context: {
        previous_messages: [],
        test: true,
      }
    };

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if provided
    if (auth_type === 'bearer' && test_credentials.bearer_token) {
      headers['Authorization'] = `Bearer ${test_credentials.bearer_token}`;
    } else if (auth_type === 'api_key' && test_credentials.api_key) {
      headers['X-API-Key'] = test_credentials.api_key;
    }

    // Send test request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for validation

    let response;
    let startTime = Date.now();
    
    try {
      response = await fetch(webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Webhook timeout after 10 seconds. Please ensure your endpoint responds quickly.',
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Failed to connect to webhook: ${error.message}`,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const latency = Date.now() - startTime;

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Webhook returned status ${response.status}: ${errorText}`,
          latency,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Try to parse response
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Webhook must return valid JSON',
          latency,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check for required response fields
    const hasContent = responseData.content || responseData.response || responseData.message;
    
    if (!hasContent) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Webhook response must include "content", "response", or "message" field',
          latency,
          sample_response: responseData,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Validation successful
    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'Webhook validation successful',
        latency,
        sample_response: responseData,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in validate-agent-webhook:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message || 'Internal server error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
