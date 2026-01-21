import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hash function for token validation
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Tool definitions for connected integrations
const TOOL_DEFINITIONS: Record<string, { domain: string; actions: string[] }> = {
  'slack': { domain: 'messaging', actions: ['send_message', 'list_channels', 'get_user'] },
  'google_drive': { domain: 'files', actions: ['list_files', 'get_file', 'upload_file'] },
  'google_sheets': { domain: 'spreadsheets', actions: ['read_sheet', 'write_cells', 'create_sheet'] },
  'google_calendar': { domain: 'calendar', actions: ['list_events', 'create_event', 'update_event'] },
  'gmail': { domain: 'email', actions: ['send_email', 'list_emails', 'get_email'] },
  'notion': { domain: 'docs', actions: ['search_pages', 'get_page', 'create_page'] },
  'linear': { domain: 'issues', actions: ['list_issues', 'create_issue', 'update_issue'] },
  'github': { domain: 'code', actions: ['list_repos', 'get_file', 'create_issue'] },
  'shopify': { domain: 'orders', actions: ['list_orders', 'get_order', 'list_products'] },
  'stripe': { domain: 'payments', actions: ['list_charges', 'create_invoice', 'get_customer'] },
  'hubspot': { domain: 'crm', actions: ['list_contacts', 'create_contact', 'get_deal'] },
  'salesforce': { domain: 'crm', actions: ['query_records', 'create_record', 'update_record'] },
  'zendesk': { domain: 'support', actions: ['list_tickets', 'create_ticket', 'update_ticket'] },
  'jira': { domain: 'issues', actions: ['list_issues', 'create_issue', 'update_issue'] },
  'asana': { domain: 'tasks', actions: ['list_tasks', 'create_task', 'update_task'] },
  'trello': { domain: 'boards', actions: ['list_cards', 'create_card', 'move_card'] },
  'airtable': { domain: 'tables', actions: ['list_records', 'create_record', 'update_record'] },
  'mailchimp': { domain: 'email', actions: ['list_campaigns', 'create_campaign', 'list_subscribers'] },
  'twilio': { domain: 'sms', actions: ['send_sms', 'list_messages', 'get_message'] },
  'openai': { domain: 'ai', actions: ['chat_completion', 'create_embedding', 'generate_image'] },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validate MCP token format
    if (!token.startsWith('elixa_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = await hashToken(token);

    // Look up token in database
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('mcp_tokens')
      .select('id, user_id, revoked_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      console.log('Token lookup failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.revoked_at) {
      return new Response(
        JSON.stringify({ error: 'Token has been revoked' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_used_at
    await supabaseAdmin
      .from('mcp_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    const userId = tokenData.user_id;
    const url = new URL(req.url);
    const path = url.pathname.replace('/mcp', '');

    // GET /tools - List available tools based on connected integrations
    if (req.method === 'GET' && (path === '/tools' || path === '')) {
      const { data: userIntegrations, error } = await supabaseAdmin
        .from('user_integrations')
        .select(`
          integration_id,
          integrations (id, name, slug, category)
        `)
        .eq('user_id', userId)
        .eq('connected', true);

      if (error) {
        console.error('Error fetching user integrations:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch tools' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tools: { name: string; description: string; integration: string; category: string }[] = [];

      userIntegrations?.forEach((ui: any) => {
        const integration = ui.integrations;
        if (!integration?.slug) return;

        const toolDef = TOOL_DEFINITIONS[integration.slug];
        if (toolDef) {
          toolDef.actions.forEach(action => {
            tools.push({
              name: `${integration.slug}.${toolDef.domain}.${action}`,
              description: `${action.replace(/_/g, ' ')} via ${integration.name}`,
              integration: integration.slug,
              category: integration.category,
            });
          });
        }
      });

      return new Response(
        JSON.stringify({ 
          tools,
          server: 'elixa-mcp',
          version: '1.0.0',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /call - Execute a tool call (mock for Phase 1)
    if (req.method === 'POST' && path === '/call') {
      const { tool, input } = await req.json();

      if (!tool) {
        return new Response(
          JSON.stringify({ error: 'Tool name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse tool name: integration_slug.domain.action
      const [integrationSlug, domain, action] = tool.split('.');

      if (!integrationSlug || !action) {
        return new Response(
          JSON.stringify({ error: 'Invalid tool name format. Expected: integration.domain.action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user has this integration connected
      const { data: userInt } = await supabaseAdmin
        .from('user_integrations')
        .select('id, integrations!inner(slug)')
        .eq('user_id', userId)
        .eq('connected', true)
        .eq('integrations.slug', integrationSlug)
        .single();

      if (!userInt) {
        return new Response(
          JSON.stringify({ error: `Integration ${integrationSlug} is not connected` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const startTime = Date.now();

      // Mock response for Phase 1
      const mockOutput = {
        success: true,
        message: `Mock execution of ${tool}`,
        data: { mock: true, input },
        timestamp: new Date().toISOString(),
      };

      const executionTime = Date.now() - startTime;

      // Log the tool call
      await supabaseAdmin
        .from('tool_calls')
        .insert({
          user_id: userId,
          integration_slug: integrationSlug,
          tool_name: tool,
          input: input || {},
          output: mockOutput,
          status: 'success',
          execution_time_ms: executionTime,
        });

      return new Response(
        JSON.stringify({ 
          result: mockOutput,
          execution_time_ms: executionTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in MCP function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
