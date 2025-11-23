import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseN8nWorkflow } from "./workflow-parser.ts";
import { NodeRegistry } from "./node-registry.ts";
import { WorkflowValidator } from "./workflow-validator.ts";
import { CredentialResolver } from "./credential-resolver.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: Array<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    message: string;
    severity: 'critical' | 'error';
  }>;
  warnings: Array<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    message: string;
  }>;
  stats: {
    totalNodes: number;
    supportedNodes: number;
    executableNodes: number;
    orchestrationNodes: number;
    unsupportedNodes: number;
  };
  requiredCredentials: string[];
  isChatCompatible: boolean;
}

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

    // 1. Validate workflow JSON structure
    if (!workflowJson || typeof workflowJson !== 'object') {
      return new Response(
        JSON.stringify({ 
          success: false,
          validation: {
            isValid: false,
            canPublish: false,
            errors: [{
              type: 'INVALID_JSON',
              message: 'Invalid workflow JSON structure',
              severity: 'critical'
            }],
            warnings: [],
            stats: { totalNodes: 0, supportedNodes: 0, executableNodes: 0, orchestrationNodes: 0, unsupportedNodes: 0 },
            requiredCredentials: [],
            isChatCompatible: false
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for basic n8n structure
    if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          validation: {
            isValid: false,
            canPublish: false,
            errors: [{
              type: 'MISSING_NODES',
              message: 'Workflow must contain a nodes array',
              severity: 'critical'
            }],
            warnings: [],
            stats: { totalNodes: 0, supportedNodes: 0, executableNodes: 0, orchestrationNodes: 0, unsupportedNodes: 0 },
            requiredCredentials: [],
            isChatCompatible: false
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse workflow
    const parsedWorkflow = parseN8nWorkflow(workflowJson);
    
    // Perform comprehensive validation
    const validationResult = await workflowValidator.validateWorkflowStructure(parsedWorkflow);
    
    console.log('\n📊 Upload Validation Report:');
    console.log(workflowValidator.generateReport(validationResult));
    console.log('');

    // Build validation response
    const validation: PublishValidationResult = {
      isValid: validationResult.isValid,
      canPublish: validationResult.isValid && validationResult.errors.length === 0,
      errors: validationResult.errors.map(err => ({
        nodeId: err.nodeId,
        nodeName: err.nodeName,
        nodeType: err.nodeType,
        message: err.message,
        severity: err.nodeType.toLowerCase().includes('security') ? 'critical' : 'error'
      })),
      warnings: validationResult.warnings.map(warn => ({
        nodeId: warn.nodeId,
        nodeName: warn.nodeName,
        nodeType: warn.nodeType,
        message: warn.message
      })),
      stats: {
        totalNodes: validationResult.totalNodeCount,
        supportedNodes: validationResult.supportedNodeCount,
        executableNodes: validationResult.executableNodeCount,
        orchestrationNodes: validationResult.orchestrationNodeCount,
        unsupportedNodes: validationResult.unknownNodeCount
      },
      requiredCredentials: validationResult.requiredCredentialTypes,
      isChatCompatible: checkChatCompatibility(parsedWorkflow, validationResult)
    };

    // Block publication if validation fails
    if (!validation.canPublish) {
      return new Response(
        JSON.stringify({
          success: false,
          validation,
          report: workflowValidator.generateReport(validationResult)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Skip database update if this is a validation-only request
    if (agentId === 'validation-only') {
      return new Response(
        JSON.stringify({
          success: true,
          validation,
          report: workflowValidator.generateReport(validationResult)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update agent with workflow data (BLUEPRINT - stored as-is, never modified)
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        workflow_json: workflowJson, // Store original blueprint
        is_workflow_based: true,
        is_chat_compatible: validation.isChatCompatible,
        required_credentials: validation.requiredCredentials,
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
        validation,
        report: workflowValidator.generateReport(validationResult)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing workflow:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          canPublish: false,
          errors: [{
            type: 'PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            severity: 'critical'
          }],
          warnings: [],
          stats: { totalNodes: 0, supportedNodes: 0, executableNodes: 0, orchestrationNodes: 0, unsupportedNodes: 0 },
          requiredCredentials: [],
          isChatCompatible: false
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function checkChatCompatibility(workflow: any, validation: any): boolean {
  // Agent MUST have a chat trigger node to be chat-compatible
  // This is the core requirement for integration with the Elixa chatbot system
  
  const hasChatTrigger = workflow.nodes.some((node: any) => 
    node.type === '@n8n/n8n-nodes-langchain.chatTrigger'
  );
  
  if (!hasChatTrigger) {
    validation.errors.push({
      nodeId: 'chatbot',
      nodeName: 'Chat Trigger',
      nodeType: 'system',
      message: 'Agent is missing a Chat Trigger node. This agent cannot run as a chatbot in Elixa. Add a "When chat message received" trigger node to make it chat-compatible.',
      severity: 'critical'
    });
    return false;
  }
  
  // Must have at least one executable tool
  if (validation.executableNodeCount === 0) {
    validation.errors.push({
      nodeId: 'executable',
      nodeName: 'Tools',
      nodeType: 'system',
      message: 'Agent has no executable tools. Add at least one action node (Gmail, Sheets, HTTP, etc.) to make this agent functional.',
      severity: 'critical'
    });
    return false;
  }
  
  // Check for critical errors
  const hasCriticalErrors = validation.errors.some((err: any) => 
    err.severity === 'critical'
  );
  
  return !hasCriticalErrors;
}