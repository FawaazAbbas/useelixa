import { LovableAITool } from './node-mappings.ts';

export async function executeToolCall(
  toolCall: any,
  toolDefinitions: LovableAITool[]
): Promise<any> {
  const tool = toolDefinitions.find(t => t.function.name === toolCall.function.name);
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolCall.function.name}`);
  }
  
  const credentials = tool.function.credentials || {};
  const args = JSON.parse(toolCall.function.arguments);
  const nodeType = (tool.function as any).nodeType;
  const nodeParameters = (tool.function as any).nodeParameters;
  
  console.log(`Executing tool: ${toolCall.function.name}`, { nodeType, args });
  
  // Route to appropriate executor based on node type
  if (nodeType === 'n8n-nodes-base.httpRequest') {
    return await executeHttpRequest(args, credentials, nodeParameters);
  } else if (nodeType === 'n8n-nodes-base.notion') {
    return await executeNotionRequest(args, credentials, nodeParameters);
  } else if (nodeType === 'n8n-nodes-base.slack') {
    return await executeSlackRequest(args, credentials, nodeParameters);
  } else if (nodeType === 'n8n-nodes-base.gmail') {
    return await executeGmailRequest(args, credentials, nodeParameters);
  } else if (nodeType === 'n8n-nodes-base.googleSheets') {
    return await executeSheetsRequest(args, credentials, nodeParameters);
  }
  
  throw new Error(`Unsupported node type: ${nodeType}`);
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

async function executeNotionRequest(
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

async function executeSlackRequest(
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

async function executeGmailRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  if (!credentials.googleOAuth2Api?.access_token) {
    throw new Error('Gmail credentials not configured');
  }
  
  const operation = nodeParameters.operation || 'send';
  
  if (operation === 'send') {
    const email = [
      `To: ${args.to}`,
      `Subject: ${args.subject}`,
      '',
      args.message
    ].join('\n');
    
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.googleOAuth2Api.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gmail API ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  }
  
  throw new Error(`Unsupported Gmail operation: ${operation}`);
}

async function executeSheetsRequest(
  args: any,
  credentials: any,
  nodeParameters: any
): Promise<any> {
  if (!credentials.googleOAuth2Api?.access_token) {
    throw new Error('Google Sheets credentials not configured');
  }
  
  const operation = nodeParameters.operation || 'append';
  const spreadsheetId = args.spreadsheet_id;
  const range = args.sheet_name ? `${args.sheet_name}!A1` : 'Sheet1!A1';
  
  if (operation === 'append') {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.googleOAuth2Api.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: args.values || []
        })
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
