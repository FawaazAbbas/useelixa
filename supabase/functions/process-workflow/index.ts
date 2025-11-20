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

    const { workflowJson, agentId } = await req.json();

    // 1. Validate workflow JSON
    if (!workflowJson || typeof workflowJson !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid workflow JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for basic n8n structure
    if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
      return new Response(
        JSON.stringify({ error: 'Workflow must contain nodes array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Detect real API keys (basic check)
    const workflowString = JSON.stringify(workflowJson);
    const keyPatterns = [
      /sk-[a-zA-Z0-9]{20,}/g,  // OpenAI
      /AIza[a-zA-Z0-9_-]{35}/g, // Google
      /xoxb-[a-zA-Z0-9-]+/g,    // Slack bot
      /xoxp-[a-zA-Z0-9-]+/g,    // Slack user
    ];

    for (const pattern of keyPatterns) {
      if (pattern.test(workflowString)) {
        return new Response(
          JSON.stringify({ error: 'Workflow contains real API keys. Please use placeholders like {{OPENAI_KEY}}' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. Extract required integrations from placeholders
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    const matches = workflowString.matchAll(placeholderRegex);
    const requiredIntegrations = [...new Set([...matches].map(m => m[1]))];

    // 4. Derive permissions from node types
    const permissions: string[] = [];
    for (const node of workflowJson.nodes) {
      const nodeType = node.type?.toLowerCase() || '';
      
      if (nodeType.includes('http')) permissions.push('EXTERNAL_REQUEST');
      if (nodeType.includes('openai') || nodeType.includes('anthropic')) permissions.push('LLM_ACCESS');
      if (nodeType.includes('google')) permissions.push('GOOGLE_API_ACCESS');
      if (nodeType.includes('slack')) permissions.push('SLACK_ACCESS');
      if (nodeType.includes('notion')) permissions.push('NOTION_ACCESS');
    }

    const uniquePermissions = [...new Set(permissions)];

    // 5. Update agent with workflow data
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        workflow_json: workflowJson,
        is_workflow_based: true,
        supported_features: ['text', 'streaming'],
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('Error updating agent:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agentId,
        requiredIntegrations,
        permissions: uniquePermissions,
        status: 'active'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing workflow:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
