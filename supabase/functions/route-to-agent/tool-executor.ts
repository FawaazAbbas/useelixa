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
  } else if (nodeType === 'n8n-nodes-base.openAi') {
    return await executeOpenAIRequest(args, credentials, nodeParameters);
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
    
    // Encode email in base64url format
    const encodedEmail = btoa(email)
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
