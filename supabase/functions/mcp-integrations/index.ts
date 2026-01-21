import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify auth
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // LIST ALL INTEGRATIONS with user connection status
    if (req.method === 'GET' && action === 'list') {
      // Get all integrations
      const { data: integrations, error: intError } = await supabaseAdmin
        .from('integrations')
        .select('*')
        .order('display_order', { ascending: true });

      if (intError) {
        console.error('Error fetching integrations:', intError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch integrations' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's connected integrations
      const { data: userIntegrations, error: userIntError } = await supabaseAdmin
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (userIntError) {
        console.error('Error fetching user integrations:', userIntError);
      }

      // Merge connection status
      const integrationsWithStatus = integrations?.map(integration => {
        const userInt = userIntegrations?.find(ui => ui.integration_id === integration.id);
        return {
          ...integration,
          is_connected: userInt?.connected || false,
          connected_at: userInt?.connected_at || null,
          user_integration_id: userInt?.id || null,
        };
      });

      return new Response(
        JSON.stringify({ integrations: integrationsWithStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIST USER'S CONNECTED INTEGRATIONS
    if (req.method === 'GET' && action === 'connected') {
      const { data, error } = await supabaseAdmin
        .from('user_integrations')
        .select(`
          *,
          integrations (*)
        `)
        .eq('user_id', user.id)
        .eq('connected', true);

      if (error) {
        console.error('Error fetching connected integrations:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch connected integrations' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ integrations: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CONNECT INTEGRATION (mock for now)
    if (req.method === 'POST' && action === 'connect') {
      const { integrationId, slug } = await req.json();
      
      let targetIntegrationId = integrationId;

      // If slug provided, look up integration
      if (!targetIntegrationId && slug) {
        const { data: integration } = await supabaseAdmin
          .from('integrations')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (integration) {
          targetIntegrationId = integration.id;
        }
      }

      if (!targetIntegrationId) {
        return new Response(
          JSON.stringify({ error: 'Integration ID or slug is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert user integration
      const { data, error } = await supabaseAdmin
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_id: targetIntegrationId,
          connected: true,
          connected_at: new Date().toISOString(),
          metadata: { mock: true, connected_via: 'mcp-integrations' },
        }, {
          onConflict: 'user_id,integration_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error connecting integration:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to connect integration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, integration: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DISCONNECT INTEGRATION
    if (req.method === 'POST' && action === 'disconnect') {
      const { integrationId } = await req.json();
      
      if (!integrationId) {
        return new Response(
          JSON.stringify({ error: 'Integration ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseAdmin
        .from('user_integrations')
        .update({ 
          connected: false, 
          metadata: { disconnected_at: new Date().toISOString() } 
        })
        .eq('integration_id', integrationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting integration:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to disconnect integration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mcp-integrations function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
