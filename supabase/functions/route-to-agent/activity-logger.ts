import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

interface ActivityLogContext {
  user_id: string;
  agent_id: string;
  chat_id?: string;
  tool_name: string;
  nodeType: string;
}

interface ActivityLogResult {
  success: boolean;
  execution_time_ms: number;
  input?: any;
  output?: any;
  error?: string;
}

export async function logActivity(
  context: ActivityLogContext,
  result: ActivityLogResult
): Promise<void> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Generate human-readable action and entity type
  const { action, entityType, description } = generateActionMetadata(
    context.tool_name,
    context.nodeType,
    result
  );

  // Truncate large input/output for storage
  const inputSummary = truncateData(result.input, 200);
  const outputSummary = truncateData(result.output, 200);

  const logEntry = {
    user_id: context.user_id,
    agent_id: context.agent_id,
    chat_id: context.chat_id,
    action,
    entity_type: entityType,
    status: result.success ? 'success' : 'failed',
    metadata: {
      tool_name: context.tool_name,
      node_type: context.nodeType,
      execution_time_ms: result.execution_time_ms,
      input_summary: inputSummary,
      output_summary: outputSummary,
      description,
      error_message: result.error,
    },
  };

  const { error } = await supabase.from('activity_logs').insert(logEntry);

  if (error) {
    console.error('Failed to log activity:', error);
  } else {
    console.log(`✓ Activity logged: ${action} (${result.success ? 'success' : 'failed'})`);
  }
}

function generateActionMetadata(
  toolName: string,
  nodeType: string,
  result: ActivityLogResult
): { action: string; entityType: string; description: string } {
  const input = result.input || {};
  const output = result.output || {};

  // Gmail
  if (nodeType.includes('gmail')) {
    return {
      action: 'email_sent',
      entityType: 'email',
      description: `Sent email to ${input.to || 'recipient'}${input.subject ? `: "${input.subject}"` : ''}`,
    };
  }

  // Google Sheets
  if (nodeType.includes('googleSheets')) {
    const operation = input.operation || 'update';
    if (operation === 'append' || operation === 'appendOrUpdate') {
      return {
        action: 'sheet_row_added',
        entityType: 'spreadsheet',
        description: `Added ${input.values?.length || 1} row(s) to spreadsheet`,
      };
    } else if (operation === 'update') {
      return {
        action: 'sheet_updated',
        entityType: 'spreadsheet',
        description: `Updated spreadsheet range ${input.range || 'unknown'}`,
      };
    } else if (operation === 'get' || operation === 'read') {
      return {
        action: 'sheet_read',
        entityType: 'spreadsheet',
        description: `Read data from spreadsheet range ${input.range || 'unknown'}`,
      };
    }
  }

  // Notion
  if (nodeType.includes('notion')) {
    const operation = input.operation || 'query';
    if (operation === 'create') {
      return {
        action: 'notion_page_created',
        entityType: 'notion_page',
        description: 'Created new Notion page',
      };
    } else if (operation === 'query') {
      return {
        action: 'notion_database_queried',
        entityType: 'notion_database',
        description: `Queried Notion database${output.results ? ` (${output.results.length} results)` : ''}`,
      };
    }
  }

  // Slack
  if (nodeType.includes('slack')) {
    return {
      action: 'slack_message_sent',
      entityType: 'slack_message',
      description: `Posted message to #${input.channel || 'channel'}`,
    };
  }

  // Task Creation
  if (nodeType === 'task_creation') {
    return {
      action: 'task_created',
      entityType: 'task',
      description: `Created task: "${input.title || 'Untitled'}"`,
    };
  }

  // Automation Execution
  if (nodeType === 'execute_automation') {
    return {
      action: 'automation_executed',
      entityType: 'automation',
      description: `Executed automation chain`,
    };
  }

  // Create Automation
  if (nodeType === 'create_automation') {
    return {
      action: 'automation_created',
      entityType: 'automation',
      description: `Created automation: "${input.name || 'Untitled'}"`,
    };
  }

  // RSS Feed
  if (nodeType.includes('rssFeedRead')) {
    return {
      action: 'rss_feed_fetched',
      entityType: 'rss_feed',
      description: `Fetched RSS feed${output.items ? ` (${output.items.length} items)` : ''}`,
    };
  }

  // OpenAI
  if (nodeType.includes('openAi')) {
    if (input.resource === 'image' || output.image_url) {
      return {
        action: 'ai_image_generated',
        entityType: 'ai_output',
        description: 'Generated AI image',
      };
    }
    return {
      action: 'ai_text_generated',
      entityType: 'ai_output',
      description: 'Generated AI text response',
    };
  }

  // HTTP Request
  if (nodeType.includes('httpRequest')) {
    return {
      action: 'api_request_made',
      entityType: 'api_call',
      description: `Made ${input.method || 'GET'} request to API`,
    };
  }

  // Workspace Document
  if (nodeType === 'workspace_document') {
    return {
      action: 'document_read',
      entityType: 'document',
      description: `Read workspace document`,
    };
  }

  // Default fallback
  return {
    action: 'tool_executed',
    entityType: 'unknown',
    description: `Executed ${toolName}`,
  };
}

function truncateData(data: any, maxLength: number): string {
  if (!data) return '';
  
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength) + '...';
}
