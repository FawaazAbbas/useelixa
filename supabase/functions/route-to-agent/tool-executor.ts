import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { LovableAITool } from './node-mappings.ts';
import { logActivity } from './activity-logger.ts';

// PHASE 2: Retry wrapper with exponential backoff
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  toolName: string,
  maxRetries = 3
): Promise<T> {
  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s exponential backoff
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if error is retryable (network, rate limits, timeouts)
      const isRetryable = 
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('429') ||
        errorMessage.toLowerCase().includes('503') ||
        errorMessage.toLowerCase().includes('504');
      
      if (!isRetryable || isLastAttempt) {
        console.error(`❌ Tool ${toolName} failed after ${attempt + 1} attempt(s):`, errorMessage);
        throw error;
      }
      
      const delay = delays[attempt];
      console.log(`⚠️ Tool ${toolName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function executeToolCall(
  toolCall: any,
  toolDefinitions: LovableAITool[],
  context?: { user_id: string; agent_id: string; chat_id?: string; workspace_id?: string; agent_installation_id?: string }
): Promise<any> {
  const startTime = Date.now();
  const tool = toolDefinitions.find(t => t.function.name === toolCall.function.name);
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolCall.function.name}`);
  }
  
  const credentials = tool.function.credentials || {};
  const args = JSON.parse(toolCall.function.arguments);
  const nodeType = (tool.function as any).nodeType;
  const nodeParameters = (tool.function as any).nodeParameters;
  
  console.log(`🔧 Executing tool: ${toolCall.function.name}`, { nodeType, args });
  
  let result: any;
  let success = true;
  let error: string | undefined;

  try {
    // Wrap execution in retry logic
    result = await executeWithRetry(async () => {
      // Route to appropriate executor based on node type
      if (nodeType === 'n8n-nodes-base.httpRequest') {
        return await executeHttpRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.notion') {
        return await executeNotionRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.slack') {
        return await executeSlackRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.gmail' || nodeType === 'n8n-nodes-base.gmailTool') {
        return await executeGmailRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.googleSheets' || nodeType === 'n8n-nodes-base.googleSheetsTool') {
        return await executeSheetsRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.openAi') {
        return await executeOpenAIRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'n8n-nodes-base.rssFeedRead') {
        return await executeRSSRequest(args, credentials, nodeParameters);
      } else if (nodeType === 'workspace_document') {
        return await executeWorkspaceDocumentRead(args);
      } else if (nodeType === 'task_creation') {
        return await executeTaskCreation(args);
      } else if (nodeType === 'list_automations') {
        return await executeListAutomations(args);
      } else if (nodeType === 'execute_automation') {
        return await executeAutomationExecution(args);
      } else if (nodeType === 'create_automation') {
        return await executeCreateAutomation(args);
      } else if (nodeType === 'agent_memory') {
        return await executeAgentMemory(args, nodeParameters, context);
      } else {
        throw new Error(`Unsupported node type: ${nodeType}`);
      }
    }, toolCall.function.name);
    
    console.log(`✅ Tool ${toolCall.function.name} executed successfully`);
  } catch (err) {
    success = false;
    error = err instanceof Error ? err.message : 'Unknown error';
    
    // Graceful degradation: provide helpful error context
    const errorContext = {
      tool: toolCall.function.name,
      error: error,
      suggestion: getSuggestionForError(error, nodeType)
    };
    
    console.error('Tool execution failed:', errorContext);
    throw new Error(JSON.stringify(errorContext));
  } finally {
    // Log activity if context is provided
    if (context) {
      const executionTime = Date.now() - startTime;
      await logActivity(
        {
          user_id: context.user_id,
          agent_id: context.agent_id,
          chat_id: context.chat_id,
          tool_name: toolCall.function.name,
          nodeType,
        },
        {
          success,
          execution_time_ms: executionTime,
          input: args,
          output: result,
          error,
        }
      );
    }
  }

  return result;
}

// Helper function to provide actionable suggestions for common errors
function getSuggestionForError(error: string, nodeType: string): string {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('credentials') || errorLower.includes('authentication') || errorLower.includes('401')) {
    return 'Please reconnect your account in the Connections page';
  }
  
  if (errorLower.includes('rate limit') || errorLower.includes('429')) {
    return 'Service rate limit reached. Please try again in a few minutes';
  }
  
  if (errorLower.includes('not found') || errorLower.includes('404')) {
    return 'The requested resource was not found. Please verify the ID or URL';
  }
  
  if (errorLower.includes('permission') || errorLower.includes('forbidden') || errorLower.includes('403')) {
    return 'Permission denied. Please check your account has access to this resource';
  }
  
  if (errorLower.includes('network') || errorLower.includes('timeout')) {
    return 'Network connection issue. Please check your internet connection and try again';
  }
  
  return 'Please try again or contact support if the issue persists';
}

async function executeHttpRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  const url = nodeParameters.url || args.url;
  const method = nodeParameters.method || 'GET';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...nodeParameters.headerParameters?.parameters
  };
  
  // Inject authentication
  if (credentials.httpAuth) {
    headers['Authorization'] = `Bearer ${credentials.httpAuth.access_token}`;
  } else if (nodeParameters.authentication === 'predefinedCredentialType') {
    // Handle other auth types
    if (credentials.oauth2) {
      headers['Authorization'] = `Bearer ${credentials.oauth2.access_token}`;
    }
  }
  
  const requestOptions: RequestInit = {
    method,
    headers
  };
  
  if (method !== 'GET' && args.body) {
    requestOptions.body = JSON.stringify(args.body);
  }
  
  let finalUrl = url;
  if (args.query_params) {
    const params = new URLSearchParams(args.query_params);
    finalUrl = `${url}?${params}`;
  }
  
  console.log(`HTTP Request: ${method} ${finalUrl}`);
  
  const response = await fetch(finalUrl, requestOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

export async function executeNotionRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  const operation = nodeParameters.operation || 'query';
  const resource = nodeParameters.resource || 'database';
  
  if (!credentials.notionApi?.access_token) {
    throw new Error('Notion credentials not configured');
  }
  
  let url = 'https://api.notion.com/v1';
  let method = 'POST';
  let body: any = {};
  
  if (resource === 'database' && operation === 'query') {
    url += `/databases/${args.database_id}/query`;
    body = {
      filter: args.filter || {},
      page_size: args.page_size || 100
    };
  } else if (resource === 'page' && operation === 'create') {
    url += '/pages';
    body = args.page_data;
  }
  
  console.log(`Notion Request: ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${credentials.notionApi.access_token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion API ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

export async function executeSlackRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  const operation = nodeParameters.operation || 'postMessage';
  
  if (!credentials.slackOAuth2Api?.access_token) {
    throw new Error('Slack credentials not configured');
  }
  
  let url = 'https://slack.com/api/';
  let body: any = {};
  
  if (operation === 'postMessage') {
    url += 'chat.postMessage';
    body = {
      channel: args.channel,
      text: args.text,
      attachments: args.attachments
    };
  }
  
  console.log(`Slack Request: POST ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.slackOAuth2Api.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }
  
  return data;
}

export async function executeGmailRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  if (!credentials.googleOAuth2Api?.access_token && !credentials.gmailOAuth2?.access_token) {
    throw new Error('Gmail credentials not configured');
  }
  
  const accessToken = credentials.googleOAuth2Api?.access_token || credentials.gmailOAuth2?.access_token;
  const operation = nodeParameters.operation || 'send';
  
  if (operation === 'send') {
    console.log('Sending email via Gmail API:', {
      to: args.to,
      subject: args.subject,
      hasMessage: !!args.message
    });

    // Create email in RFC 2822 format
    const email = [
      `To: ${args.to}`,
      args.cc ? `Cc: ${args.cc}` : '',
      args.bcc ? `Bcc: ${args.bcc}` : '',
      `Subject: ${args.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      args.message
    ].filter(Boolean).join('\r\n');
    
    // Encode email in base64url format with UTF-8 support (for emojis, international chars)
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const base64 = btoa(String.fromCharCode(...emailBytes));
    const encodedEmail = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail API error:', response.status, errorText);
      throw new Error(`Gmail API ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✓ Email sent successfully via Gmail API:', result.id);
    
    return {
      success: true,
      messageId: result.id,
      result: `Email sent successfully to ${args.to}`
    };
  }
  
  throw new Error(`Unsupported Gmail operation: ${operation}`);
}

export async function executeSheetsRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  // Support both direct googleOAuth2Api and aliased credentials
  const accessToken = 
    credentials.googleOAuth2Api?.access_token || 
    credentials.googleSheetsOAuth2?.access_token ||
    credentials.googleSheetsOAuth2Api?.access_token;

  if (!accessToken) {
    throw new Error('Google Sheets credentials not configured');
  }
  
  const operation = args.operation || nodeParameters.operation || 'append';
  const spreadsheetId = args.spreadsheet_id || nodeParameters.spreadsheetId;
  const sheetName = args.sheet_name || nodeParameters.sheetName || 'Sheet1';
  const range = args.range || nodeParameters.range || `${sheetName}!A1`;
  
  console.log(`Google Sheets ${operation}:`, { spreadsheetId, range });
  
  // Handle different operations
  if (operation === 'append' || operation === 'appendOrUpdate') {
    const values = args.values || nodeParameters.values || [];
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      throw new Error(`Google Sheets API ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✓ Data appended to Google Sheets:', result.updates);
    return result;
  } else if (operation === 'update') {
    const values = args.values || nodeParameters.values || [];
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Sheets API ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } else if (operation === 'get' || operation === 'read') {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Sheets API ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  }
  
  throw new Error(`Unsupported Sheets operation: ${operation}`);
}

async function executeOpenAIRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('Lovable AI is not configured');
  }
  
  const resource = nodeParameters.resource || 'text';
  const operation = nodeParameters.operation || 'complete';
  
  console.log(`Executing OpenAI request via Lovable AI: ${resource} ${operation}`);
  
  // Handle image generation
  if (resource === 'image') {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: args.prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lovable AI Image Generation ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    return {
      success: true,
      image_url: imageUrl,
      message: data.choices?.[0]?.message?.content
    };
  }
  
  // Handle chat/text completion
  // Map n8n model parameter to Lovable AI model
  let model = 'google/gemini-2.5-flash'; // Default
  const n8nModel = nodeParameters.model?.toLowerCase() || '';
  
  if (n8nModel.includes('gpt-4') || n8nModel.includes('gpt4')) {
    model = 'openai/gpt-5';
  } else if (n8nModel.includes('gpt-3.5') || n8nModel.includes('gpt3')) {
    model = 'openai/gpt-5-mini';
  }
  
  const messages = [];
  
  if (args.system_message || nodeParameters.systemMessage) {
    messages.push({
      role: 'system',
      content: args.system_message || nodeParameters.systemMessage
    });
  }
  
  messages.push({
    role: 'user',
    content: args.prompt || args.input
  });
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_completion_tokens: args.max_tokens || nodeParameters.maxTokens || 1000,
      // Note: temperature not supported for newer models
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable AI Chat ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  
  return {
    success: true,
    response: data.choices?.[0]?.message?.content,
    model_used: model,
    usage: data.usage
  };
}

export async function executeRSSRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  const feedUrl = args.feed_url || nodeParameters.url;
  const maxItems = args.max_items || nodeParameters.maxItems || 10;
  
  if (!feedUrl) {
    throw new Error('RSS feed URL is required');
  }
  
  console.log(`Fetching RSS feed: ${feedUrl} (max ${maxItems} items)`);
  
  try {
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    
    // Parse RSS XML using DOMParser (available in Deno)
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse RSS feed XML');
    }
    
    // Check for RSS or Atom feed
    const items = doc.querySelectorAll('item');
    const entries = doc.querySelectorAll('entry'); // Atom feeds
    
    const feedItems = items.length > 0 ? items : entries;
    const isAtom = entries.length > 0;
    
    const parsedItems = [];
    const limit = Math.min(feedItems.length, maxItems);
    
    for (let i = 0; i < limit; i++) {
      const item = feedItems[i] as any;
      
      if (isAtom) {
        // Atom feed format
        parsedItems.push({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.getAttribute('href') || '',
          description: item.querySelector('summary')?.textContent || item.querySelector('content')?.textContent || '',
          pubDate: item.querySelector('published')?.textContent || item.querySelector('updated')?.textContent || '',
          author: item.querySelector('author name')?.textContent || '',
        });
      } else {
        // RSS feed format
        parsedItems.push({
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          author: item.querySelector('author')?.textContent || item.querySelector('dc\\:creator')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || '',
        });
      }
    }
    
    console.log(`✓ Parsed ${parsedItems.length} items from RSS feed`);
    
    return {
      success: true,
      feed_url: feedUrl,
      items: parsedItems,
      total_fetched: parsedItems.length
    };
  } catch (error) {
    console.error('RSS feed error:', error);
    throw new Error(`Failed to fetch/parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute workspace document read request
 */
async function executeWorkspaceDocumentRead(args: any): Promise<any> {
  const { document_name } = args;

  if (!document_name) {
    throw new Error("document_name is required");
  }

  console.log(`Reading workspace document: ${document_name}`);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }

  // Import createClient dynamically
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.81.1");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the document
  const { data: documents, error: searchError } = await supabase
    .from('workspace_documents')
    .select('*')
    .ilike('name', document_name)
    .limit(1);

  if (searchError) {
    throw new Error(`Failed to search for document: ${searchError.message}`);
  }

  if (!documents || documents.length === 0) {
    throw new Error(`Document "${document_name}" not found in workspace knowledge base`);
  }

  const document = documents[0];

  // If we have extracted content, return it
  if (document.extracted_content) {
    return {
      success: true,
      document_name: document.name,
      file_type: document.file_type,
      description: document.description,
      content: document.extracted_content,
      tags: document.tags,
      folder: document.folder
    };
  }

  // Otherwise, try to download and read the file directly
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('workspace-files')
    .download(document.file_path);

  if (downloadError) {
    throw new Error(`Failed to download file: ${downloadError.message}`);
  }

  let content = '';

  // Handle different file types
  if (document.file_type === 'application/json' || document.file_type === 'text/json') {
    const text = await fileData.text();
    const json = JSON.parse(text);
    content = JSON.stringify(json, null, 2);
  } else if (document.file_type.startsWith('text/')) {
    content = await fileData.text();
  } else if (document.file_type.startsWith('image/')) {
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    content = `Image data (base64): ${base64.substring(0, 100)}... [truncated for brevity, ${base64.length} characters total]`;
  } else {
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    content = `Binary file content (${bytes.length} bytes). File type: ${document.file_type}. Consider requesting specific information about this file.`;
  }

  return {
    success: true,
    document_name: document.name,
    file_type: document.file_type,
    description: document.description,
    content: content,
    tags: document.tags,
    folder: document.folder
  };
}

/**
 * Execute task creation request (Phase 3)
 */
async function executeTaskCreation(args: any): Promise<any> {
  const { title, description, priority, due_date, is_asap, automations } = args;

  if (!title) {
    throw new Error("Task title is required");
  }

  console.log(`Creating task: ${title}`);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.81.1");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user_id and workspace_id from context (should be passed via metadata)
  // For now, we'll need to pass these in the tool call arguments
  const user_id = args.user_id || args.userId;
  const workspace_id = args.workspace_id || args.workspaceId;

  if (!user_id) {
    throw new Error("User ID required for task creation");
  }

  // Create the task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      due_date: due_date || null,
      is_asap: is_asap || false,
      user_id,
      workspace_id: workspace_id || null,
      status: 'pending'
    })
    .select()
    .single();

  if (taskError) {
    throw new Error(`Failed to create task: ${taskError.message}`);
  }

  console.log(`✓ Task created: ${task.id}`);

  // Create associated automations if provided
  if (automations && Array.isArray(automations) && automations.length > 0) {
    const automationInserts = automations.map((auto: any, index: number) => ({
      name: auto.name,
      action: auto.action,
      trigger: auto.trigger || 'manual',
      task_id: task.id,
      workspace_id: workspace_id || null,
      created_by: user_id,
      chain_order: index,
      status: 'active'
    }));

    const { error: autoError } = await supabase
      .from('automations')
      .insert(automationInserts);

    if (autoError) {
      console.error('Failed to create automations:', autoError);
      // Don't fail the whole task creation, just log the error
    } else {
      console.log(`✓ Created ${automations.length} automations for task`);
    }
  }

  return {
    success: true,
    task_id: task.id,
    task_title: task.title,
    automation_count: automations?.length || 0
  };
}

// Execute list automations tool
async function executeListAutomations(args: any): Promise<any> {
  const { task_id, status } = args;
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let query = supabase
    .from('automations')
    .select('id, name, action, trigger, status, last_executed_at, next_run_at, created_at');

  if (task_id) {
    query = query.eq('task_id', task_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data: automations, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list automations: ${error.message}`);
  }

  return {
    success: true,
    automations: automations || [],
    count: automations?.length || 0
  };
}

// Execute automation execution tool
async function executeAutomationExecution(args: any): Promise<any> {
  const { automation_id } = args;
  
  if (!automation_id) {
    throw new Error("automation_id is required");
  }
  
  console.log(`Executing automation: ${automation_id}`);
  
  try {
    // Call the execute-automation-chain edge function
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/execute-automation-chain`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          automation_ids: [automation_id]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Automation execution failed: ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      automation_id,
      result: result
    };
  } catch (error) {
    console.error('Automation execution error:', error);
    return {
      success: false,
      automation_id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute create automation tool
async function executeCreateAutomation(args: any): Promise<any> {
  const { 
    name, 
    action, 
    trigger, 
    task_id, 
    schedule_type, 
    schedule_time,
    schedule_days,
    schedule_interval_minutes,
    user_id, 
    workspace_id 
  } = args;
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const insertData: any = {
    name: name.trim(),
    action: action.trim(),
    trigger: trigger || 'manual',
    workspace_id,
    created_by: user_id,
    status: 'active',
    schedule_type: schedule_type || 'manual'
  };

  if (task_id) {
    insertData.task_id = task_id;
  }

  if (schedule_time) {
    insertData.schedule_time = schedule_time;
  }

  if (schedule_days && Array.isArray(schedule_days)) {
    insertData.schedule_days = schedule_days;
  }

  if (schedule_interval_minutes) {
    insertData.schedule_interval_minutes = schedule_interval_minutes;
  }

  const { data: automation, error } = await supabase
    .from('automations')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create automation: ${error.message}`);
  }

  return {
    success: true,
    automation_id: automation.id,
    automation_name: automation.name,
    next_run_at: automation.next_run_at
  };
}

/**
 * Execute agent memory operations (remember/recall)
 */
async function executeAgentMemory(
  args: any,
  nodeParameters: any,
  context?: { user_id: string; agent_id: string; chat_id?: string; workspace_id?: string; agent_installation_id?: string }
): Promise<any> {
  const action = nodeParameters.action; // 'remember' or 'recall'
  
  if (!context) {
    throw new Error("Context required for memory operations");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (action === 'remember') {
    const { category, key, value, scope } = args;
    
    if (!category || !key || !value || !scope) {
      throw new Error("Category, key, value, and scope are required for remember operation");
    }

    console.log(`Storing memory: ${scope}/${category}/${key}`);

    const memoryData = {
      category,
      key,
      value,
      created_by: context.user_id,
      agent_installation_id: context.agent_installation_id || null
    };

    if (scope === 'workspace') {
      if (!context.workspace_id) {
        throw new Error("Workspace ID required for workspace-scoped memories");
      }

      const { data, error } = await supabase
        .from('workspace_agent_memories')
        .upsert({
          ...memoryData,
          workspace_id: context.workspace_id
        }, {
          onConflict: 'workspace_id,agent_installation_id,category,key'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store workspace memory: ${error.message}`);
      }

      return {
        success: true,
        scope: 'workspace',
        category,
        key,
        message: `Stored workspace memory: ${key}`
      };
    } else if (scope === 'chat') {
      if (!context.chat_id) {
        throw new Error("Chat ID required for chat-scoped memories");
      }

      const { data, error } = await supabase
        .from('chat_agent_memories')
        .upsert({
          ...memoryData,
          chat_id: context.chat_id
        }, {
          onConflict: 'chat_id,agent_installation_id,category,key'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store chat memory: ${error.message}`);
      }

      return {
        success: true,
        scope: 'chat',
        category,
        key,
        message: `Stored chat memory: ${key}`
      };
    }

    throw new Error(`Invalid scope: ${scope}`);
  } else if (action === 'recall') {
    const { category } = args;
    
    console.log(`Recalling memories: category=${category || 'all'}`);

    const memories: any[] = [];

    // Fetch workspace memories
    if (context.workspace_id) {
      let workspaceQuery = supabase
        .from('workspace_agent_memories')
        .select('*')
        .eq('workspace_id', context.workspace_id);

      if (context.agent_installation_id) {
        workspaceQuery = workspaceQuery.or(`agent_installation_id.eq.${context.agent_installation_id},agent_installation_id.is.null`);
      }

      if (category && category !== 'all') {
        workspaceQuery = workspaceQuery.eq('category', category);
      }

      const { data: workspaceMemories } = await workspaceQuery;
      if (workspaceMemories) {
        memories.push(...workspaceMemories.map((m: any) => ({ ...m, scope: 'workspace' })));
      }
    }

    // Fetch chat memories
    if (context.chat_id) {
      let chatQuery = supabase
        .from('chat_agent_memories')
        .select('*')
        .eq('chat_id', context.chat_id);

      if (context.agent_installation_id) {
        chatQuery = chatQuery.or(`agent_installation_id.eq.${context.agent_installation_id},agent_installation_id.is.null`);
      }

      if (category && category !== 'all') {
        chatQuery = chatQuery.eq('category', category);
      }

      const { data: chatMemories } = await chatQuery;
      if (chatMemories) {
        memories.push(...chatMemories.map((m: any) => ({ ...m, scope: 'chat' })));
      }
    }

    return {
      success: true,
      memories: memories,
      count: memories.length,
      message: `Retrieved ${memories.length} ${category !== 'all' ? category : ''} memories`
    };
  }

  throw new Error(`Invalid action: ${action}`);
}
