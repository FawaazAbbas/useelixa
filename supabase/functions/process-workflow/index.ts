import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseN8nWorkflow } from "./workflow-parser.ts";
import { NodeRegistry } from "./node-registry.ts";
import { WorkflowValidator } from "./workflow-validator.ts";
import { CredentialResolver } from "./credential-resolver.ts";
import { WorkflowScorer } from "./workflow-scorer.ts";

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
    
    // Initialize validation components
    const nodeRegistry = new NodeRegistry();
    const credentialResolver = new CredentialResolver();
    const workflowValidator = new WorkflowValidator(nodeRegistry, credentialResolver);
    const scorer = new WorkflowScorer(nodeRegistry);

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

    // Parse workflow for validation
    const parsedWorkflow = parseN8nWorkflow(workflowJson);
    
    // Score and validate workflow comprehensively
    const scoreResult = scorer.scoreWorkflow(parsedWorkflow);
    
    console.log('\n📊 Validation & Scoring Report:');
    console.log(scorer.generateReport(scoreResult));
    console.log('');

    // Block publication if validation fails
    if (!scoreResult.canPublish) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Workflow validation failed',
          validation: scoreResult,
          report: scorer.generateReport(scoreResult)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 2. Extract required integrations from placeholders
    const placeholderRegex = /\{\{([A-Z_]+)\}\}/g;
    const workflowString = JSON.stringify(workflowJson);
    const matches = workflowString.matchAll(placeholderRegex);
    const requiredIntegrations = [...new Set([...matches].map(m => m[1]))];

    // 3. Derive permissions from node types
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

    // 4. Update agent with workflow data (skip if validation-only mode)
    // Skip database update if this is a validation-only request
    if (agentId === 'validation-only') {
      return new Response(
        JSON.stringify({
          success: true,
          validation: scoreResult,
          report: scorer.generateReport(scoreResult)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        requiredCredentials: parsedWorkflow.requiredCredentials,
        permissions: uniquePermissions,
        status: 'active',
        validation: scoreResult,
        report: scorer.generateReport(scoreResult)
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
