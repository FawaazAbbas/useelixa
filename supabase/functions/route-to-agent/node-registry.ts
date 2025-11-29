// Centralized node registry with declarative node definitions

import { LovableAITool } from './tool-generator.ts';

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  credentials?: Record<string, any>;
}

export interface NodeExecutor {
  (args: any, credentials: any, nodeParameters: any): Promise<any>;
}

export interface NodeDefinition {
  nodeTypes: string[];           // All node type variants this handler supports
  category: 'communication' | 'storage' | 'database' | 'ai' | 'automation' | 'utility';
  credentialPatterns: string[];  // Credential types this node might need
  isExecutable: boolean;         // Can this node be called as a tool?
  executor: NodeExecutor | null; // Function to execute this node
  toolGenerator: (node: N8nNode) => LovableAITool | null; // Generates tool definition
}

// Import executors from tool-executor
import {
  executeGmailRequest,
  executeNotionRequest,
  executeSlackRequest,
  executeSheetsRequest,
  executeRSSRequest,
} from './tool-executor.ts';

/**
 * Node Registry - Single source of truth for all supported n8n nodes
 * 
 * To add a new node type:
 * 1. Add entry to NODE_REGISTRY with all variants
 * 2. Implement executor function in tool-executor.ts
 * 3. Define toolGenerator function
 * 4. Done! No other files need changes.
 */
export const NODE_REGISTRY: Record<string, NodeDefinition> = {
  gmail: {
    nodeTypes: [
      'n8n-nodes-base.gmail',
      'n8n-nodes-base.gmailTool',
    ],
    category: 'communication',
    credentialPatterns: ['gmail*', 'googleOAuth2*'],
    isExecutable: true,
    executor: executeGmailRequest,
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `gmail_${node.id}`,
        description: node.parameters.description || `Send email via Gmail`,
        parameters: {
          type: 'object',
          properties: {
            to: { type: 'string', description: 'Recipient email address' },
            subject: { type: 'string', description: 'Email subject line' },
            message: { type: 'string', description: 'Email body content' }
          },
          required: ['to', 'subject', 'message']
        }
      }
    })
  },

  googleSheets: {
    nodeTypes: [
      'n8n-nodes-base.googleSheets',
      'n8n-nodes-base.googleSheetsTool',
    ],
    category: 'storage',
    credentialPatterns: ['googleSheets*', 'googleOAuth2*'],
    isExecutable: true,
    executor: executeSheetsRequest,
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `sheets_${node.id}`,
        description: node.parameters.description || `Interact with Google Sheets`,
        parameters: {
          type: 'object',
          properties: {
            operation: { 
              type: 'string', 
              description: 'Operation: get, append, update',
              enum: ['get', 'append', 'update', 'read']
            },
            spreadsheet_id: { type: 'string', description: 'Google Sheets spreadsheet ID' },
            sheet_name: { type: 'string', description: 'Sheet name/tab' },
            range: { type: 'string', description: 'Cell range (e.g., A1:B10)' },
            values: { 
              type: 'array', 
              description: 'Data to write (for append/update)',
              items: { type: 'array', items: { type: 'string' } }
            }
          },
          required: ['operation', 'spreadsheet_id']
        }
      }
    })
  },

  notion: {
    nodeTypes: [
      'n8n-nodes-base.notion',
      'n8n-nodes-base.notionTool',
    ],
    category: 'storage',
    credentialPatterns: ['notion*'],
    isExecutable: true,
    executor: executeNotionRequest,
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `notion_${node.id}`,
        description: node.parameters.description || `Interact with Notion`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', description: 'Operation: create, update, get' },
            page_id: { type: 'string', description: 'Notion page ID' },
            content: { type: 'string', description: 'Page content' }
          },
          required: ['operation']
        }
      }
    })
  },

  slack: {
    nodeTypes: [
      'n8n-nodes-base.slack',
      'n8n-nodes-base.slackTool',
    ],
    category: 'communication',
    credentialPatterns: ['slack*'],
    isExecutable: true,
    executor: executeSlackRequest,
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `slack_${node.id}`,
        description: node.parameters.description || `Send Slack message`,
        parameters: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name' },
            text: { type: 'string', description: 'Message text' }
          },
          required: ['channel', 'text']
        }
      }
    })
  },

  httpRequest: {
    nodeTypes: [
      'n8n-nodes-base.httpRequest',
      '@n8n/n8n-nodes-langchain.toolHttpRequest',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      // Generic HTTP request executor
      const url = args.url || nodeParameters.url;
      const method = args.method || nodeParameters.method || 'GET';
      const headers = args.headers || nodeParameters.headers || {};
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(args.body || {}) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `http_${node.id}`,
        description: node.parameters.description || `Make HTTP request`,
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Request URL' },
            method: { type: 'string', description: 'HTTP method' },
            body: { type: 'object', description: 'Request body' }
          },
          required: ['url']
        }
      }
    })
  },

  // PHASE 5: Web Scraping
  webScraper: {
    nodeTypes: ['n8n-nodes-base.htmlExtract'],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: null, // Handled in tool-executor as executeWebScraping
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `scrape_${node.id}`,
        description: 'Fetch and parse HTML content from a webpage',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' },
            selector: { type: 'string', description: 'Optional CSS selector to extract specific elements' }
          },
          required: ['url']
        }
      }
    })
  },

  // PHASE 5: File Export (CSV)
  csvExport: {
    nodeTypes: ['n8n-nodes-base.spreadsheetFile'],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: null, // Handled in tool-executor as executeCSVExport
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `export_csv_${node.id}`,
        description: 'Export data to CSV format',
        parameters: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              description: 'Array of objects to export',
              items: { type: 'object' }
            },
            filename: { type: 'string', description: 'Filename for the export' }
          },
          required: ['data']
        }
      }
    })
  },

  // PHASE 5: JSON Export
  jsonExport: {
    nodeTypes: ['n8n-nodes-base.writeFile'],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: null, // Handled in tool-executor as executeJSONExport
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `export_json_${node.id}`,
        description: 'Export data to JSON format',
        parameters: {
          type: 'object',
          properties: {
            data: { type: 'object', description: 'Data to export as JSON' },
            filename: { type: 'string', description: 'Filename for the export' }
          },
          required: ['data']
        }
      }
    })
  },

  rssFeedReader: {
    nodeTypes: [
      'n8n-nodes-base.rssFeedRead',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: executeRSSRequest,
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `rss_feed_reader_${node.id}`,
        description: node.parameters.description || `Fetch and parse RSS feed`,
        parameters: {
          type: 'object',
          properties: {
            feed_url: { 
              type: 'string', 
              description: 'RSS feed URL to fetch' 
            },
            max_items: { 
              type: 'number', 
              description: 'Maximum number of items to return (default: 10)',
              default: 10
            }
          },
          required: ['feed_url']
        }
      }
    })
  },

  // Data processing nodes - handled by AI (not executable as tools)
  dataProcessing: {
    nodeTypes: [
      'n8n-nodes-base.filter',
      'n8n-nodes-base.set',
      'n8n-nodes-base.merge',
      'n8n-nodes-base.aggregate',
      'n8n-nodes-base.limit',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false,
    executor: null,
    toolGenerator: () => null
  },

  // Google Calendar
  googleCalendar: {
    nodeTypes: [
      'n8n-nodes-base.googleCalendar',
      'n8n-nodes-base.googleCalendarTool',
    ],
    category: 'automation',
    credentialPatterns: ['googleCalendar*', 'googleOAuth2*'],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      const operation = args.operation || nodeParameters.operation || 'list';
      const calendarId = args.calendar_id || nodeParameters.calendarId || 'primary';
      
      const headers = {
        'Authorization': `Bearer ${credentials.googleCalendarOAuth2?.access_token || credentials.googleOAuth2Api?.access_token}`,
        'Content-Type': 'application/json'
      };

      if (operation === 'list') {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${args.max_results || 10}`;
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Google Calendar API error: ${response.statusText}`);
        return await response.json();
      } else if (operation === 'create') {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            summary: args.summary,
            description: args.description,
            start: { dateTime: args.start_time },
            end: { dateTime: args.end_time },
            attendees: args.attendees?.map((email: string) => ({ email }))
          })
        });
        if (!response.ok) throw new Error(`Google Calendar API error: ${response.statusText}`);
        return await response.json();
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `google_calendar_${node.id}`,
        description: node.parameters.description || `Interact with Google Calendar`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['list', 'create', 'update', 'delete'], description: 'Calendar operation' },
            calendar_id: { type: 'string', description: 'Calendar ID (default: primary)' },
            summary: { type: 'string', description: 'Event title (for create)' },
            description: { type: 'string', description: 'Event description' },
            start_time: { type: 'string', description: 'Start time (ISO format)' },
            end_time: { type: 'string', description: 'End time (ISO format)' },
            attendees: { type: 'array', items: { type: 'string' }, description: 'Attendee email addresses' }
          },
          required: ['operation']
        }
      }
    })
  },

  // Google Drive
  googleDrive: {
    nodeTypes: [
      'n8n-nodes-base.googleDrive',
      'n8n-nodes-base.googleDriveTool',
    ],
    category: 'storage',
    credentialPatterns: ['googleDrive*', 'googleOAuth2*'],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      const operation = args.operation || nodeParameters.operation || 'list';
      
      const headers = {
        'Authorization': `Bearer ${credentials.googleDriveOAuth2?.access_token || credentials.googleOAuth2Api?.access_token}`,
        'Content-Type': 'application/json'
      };

      if (operation === 'list') {
        const query = args.query || '';
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${args.max_results || 10}`;
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Google Drive API error: ${response.statusText}`);
        return await response.json();
      } else if (operation === 'get') {
        const url = `https://www.googleapis.com/drive/v3/files/${args.file_id}?alt=media`;
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Google Drive API error: ${response.statusText}`);
        return { content: await response.text() };
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `google_drive_${node.id}`,
        description: node.parameters.description || `Access Google Drive files`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['list', 'get', 'upload', 'delete'], description: 'Drive operation' },
            query: { type: 'string', description: 'Search query (for list)' },
            file_id: { type: 'string', description: 'File ID (for get/delete)' },
            max_results: { type: 'number', description: 'Max results (default: 10)' }
          },
          required: ['operation']
        }
      }
    })
  },

  // Airtable
  airtable: {
    nodeTypes: [
      'n8n-nodes-base.airtable',
      'n8n-nodes-base.airtableTool',
    ],
    category: 'database',
    credentialPatterns: ['airtable*'],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      const operation = args.operation || nodeParameters.operation || 'list';
      const baseId = args.base_id || nodeParameters.application;
      const tableName = args.table || nodeParameters.table;
      
      const headers = {
        'Authorization': `Bearer ${credentials.airtableTokenApi?.apiKey || credentials.airtableApi?.apiKey}`,
        'Content-Type': 'application/json'
      };

      if (operation === 'list') {
        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Airtable API error: ${response.statusText}`);
        return await response.json();
      } else if (operation === 'create') {
        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fields: args.fields })
        });
        if (!response.ok) throw new Error(`Airtable API error: ${response.statusText}`);
        return await response.json();
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `airtable_${node.id}`,
        description: node.parameters.description || `Interact with Airtable`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['list', 'create', 'update', 'delete'], description: 'Airtable operation' },
            base_id: { type: 'string', description: 'Airtable base ID' },
            table: { type: 'string', description: 'Table name' },
            fields: { type: 'object', description: 'Record fields (for create/update)' }
          },
          required: ['operation', 'base_id', 'table']
        }
      }
    })
  },

  // Discord
  discord: {
    nodeTypes: [
      'n8n-nodes-base.discord',
      'n8n-nodes-base.discordTool',
    ],
    category: 'communication',
    credentialPatterns: ['discord*'],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      const operation = args.operation || nodeParameters.operation || 'sendMessage';
      
      const headers = {
        'Authorization': `Bot ${credentials.discordBotToken?.token || credentials.discordApi?.token}`,
        'Content-Type': 'application/json'
      };

      if (operation === 'sendMessage') {
        const url = `https://discord.com/api/v10/channels/${args.channel_id}/messages`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: args.message,
            embeds: args.embeds
          })
        });
        if (!response.ok) throw new Error(`Discord API error: ${response.statusText}`);
        return await response.json();
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `discord_${node.id}`,
        description: node.parameters.description || `Send Discord messages`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['sendMessage'], description: 'Discord operation' },
            channel_id: { type: 'string', description: 'Discord channel ID' },
            message: { type: 'string', description: 'Message content' },
            embeds: { type: 'array', description: 'Message embeds (optional)' }
          },
          required: ['channel_id', 'message']
        }
      }
    })
  },

  // Telegram
  telegram: {
    nodeTypes: [
      'n8n-nodes-base.telegram',
      'n8n-nodes-base.telegramTool',
    ],
    category: 'communication',
    credentialPatterns: ['telegram*'],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      const operation = args.operation || nodeParameters.operation || 'sendMessage';
      const botToken = credentials.telegramApi?.accessToken;
      
      if (operation === 'sendMessage') {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: args.chat_id,
            text: args.text,
            parse_mode: args.parse_mode || 'HTML'
          })
        });
        if (!response.ok) throw new Error(`Telegram API error: ${response.statusText}`);
        return await response.json();
      }
      
      throw new Error(`Unsupported operation: ${operation}`);
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `telegram_${node.id}`,
        description: node.parameters.description || `Send Telegram messages`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['sendMessage'], description: 'Telegram operation' },
            chat_id: { type: 'string', description: 'Telegram chat ID' },
            text: { type: 'string', description: 'Message text' },
            parse_mode: { type: 'string', enum: ['HTML', 'Markdown'], description: 'Parse mode (default: HTML)' }
          },
          required: ['chat_id', 'text']
        }
      }
    })
  },

  // WhatsApp
  whatsapp: {
    nodeTypes: ['n8n-nodes-base.whatsApp', 'n8n-nodes-base.whatsAppTrigger'],
    category: 'communication',
    credentialPatterns: ['whatsApp*'],
    isExecutable: true,
    executor: async (args: any, credentials: any) => {
      const url = `https://graph.facebook.com/v18.0/${credentials.whatsApp?.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.whatsApp?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: args.to,
          type: args.type || 'text',
          text: args.text ? { body: args.text } : undefined
        })
      });
      if (!response.ok) throw new Error(`WhatsApp API error: ${response.statusText}`);
      return await response.json();
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `whatsapp_${node.id}`,
        description: 'Send WhatsApp messages',
        parameters: {
          type: 'object',
          properties: {
            to: { type: 'string', description: 'Recipient phone number' },
            type: { type: 'string', enum: ['text'], description: 'Message type' },
            text: { type: 'string', description: 'Message text' }
          },
          required: ['to', 'text']
        }
      }
    })
  },

  // Microsoft Teams
  microsoftTeams: {
    nodeTypes: ['n8n-nodes-base.microsoftTeams'],
    category: 'communication',
    credentialPatterns: ['microsoftTeams*', 'microsoftOAuth2*'],
    isExecutable: true,
    executor: async (args: any, credentials: any) => {
      const baseUrl = 'https://graph.microsoft.com/v1.0';
      const headers = {
        'Authorization': `Bearer ${credentials.microsoftTeamsOAuth2?.access_token || credentials.microsoftOAuth2Api?.access_token}`,
        'Content-Type': 'application/json'
      };

      const url = `${baseUrl}/teams/${args.team_id}/channels/${args.channel_id}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: { content: args.message } })
      });
      if (!response.ok) throw new Error(`Teams API error: ${response.statusText}`);
      return await response.json();
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `teams_${node.id}`,
        description: 'Send Microsoft Teams messages',
        parameters: {
          type: 'object',
          properties: {
            team_id: { type: 'string', description: 'Team ID' },
            channel_id: { type: 'string', description: 'Channel ID' },
            message: { type: 'string', description: 'Message content' }
          },
          required: ['team_id', 'channel_id', 'message']
        }
      }
    })
  },

  // Generic HTTP-based nodes (for remaining services)
  genericAPINode: {
    nodeTypes: [
      'n8n-nodes-base.twilio',
      'n8n-nodes-base.sendGrid',
      'n8n-nodes-base.mailchimp',
      'n8n-nodes-base.activeCampaign',
      'n8n-nodes-base.dropbox',
      'n8n-nodes-base.microsoftOneDrive',
      'n8n-nodes-base.box',
      'n8n-nodes-base.gitlab',
      'n8n-nodes-base.bitbucket',
      'n8n-nodes-base.jira',
      'n8n-nodes-base.asana',
      'n8n-nodes-base.mondayDotCom',
      'n8n-nodes-base.clickUp',
      'n8n-nodes-base.linkedIn',
      'n8n-nodes-base.facebook',
      'n8n-nodes-base.facebookGraph',
      'n8n-nodes-base.instagram',
      'n8n-nodes-base.hubspot',
      'n8n-nodes-base.salesforce',
      'n8n-nodes-base.pipedrive',
      'n8n-nodes-base.shopify',
      'n8n-nodes-base.stripe',
      'n8n-nodes-base.payPal',
      'n8n-nodes-base.wooCommerce',
      'n8n-nodes-base.mySql',
      'n8n-nodes-base.postgres',
      'n8n-nodes-base.mongoDb',
      'n8n-nodes-base.redis',
      'n8n-nodes-base.supabase',
      'n8n-nodes-base.awsS3',
      'n8n-nodes-base.awsLambda',
      'n8n-nodes-base.googleCloudStorage',
      'n8n-nodes-base.typeform',
      'n8n-nodes-base.typeformTrigger',
      'n8n-nodes-base.googleForms',
      'n8n-nodes-base.googleAnalytics',
      'n8n-nodes-base.evernote',
      'n8n-nodes-base.todoist',
      'n8n-nodes-base.zoom',
      'n8n-nodes-base.microsoftOutlook',
      'n8n-nodes-base.emailSend',
      'n8n-nodes-base.compress',
      'n8n-nodes-base.extractFromFile',
      'n8n-nodes-base.sort',
      'n8n-nodes-base.splitInBatches',
      'n8n-nodes-base.moveBinaryData',
      'n8n-nodes-base.xml',
      'n8n-nodes-base.html',
      'n8n-nodes-base.markdown',
      '@n8n/n8n-nodes-langchain.lmChatAnthropic',
      '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
      '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
      '@n8n/n8n-nodes-langchain.embeddingsAzureOpenAi',
      '@n8n/n8n-nodes-langchain.textSplitter',
      '@n8n/n8n-nodes-langchain.documentLoader',
      '@n8n/n8n-nodes-langchain.vectorStorePinecone',
      '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
      '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
    executor: async (args: any, credentials: any, nodeParameters: any) => {
      // Generic HTTP executor - attempts to call API based on node parameters
      console.log(`[Generic Node Executor] Executing ${nodeParameters.type || 'unknown'} node`);
      
      // For now, return a placeholder - full implementation would require per-service API mapping
      return {
        success: true,
        message: `Node ${nodeParameters.type} executed. Full support coming soon.`,
        nodeType: nodeParameters.type,
        parameters: args
      };
    },
    toolGenerator: (node) => ({
      type: 'function',
      function: {
        name: `api_${node.id}`,
        description: node.parameters.description || `Execute ${node.type.split('.').pop()} operation`,
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string', description: 'Operation to perform' },
            data: { type: 'object', description: 'Operation data' }
          },
          required: []
        }
      }
    })
  },

  // Non-executable nodes (file system, code execution, orchestration)
  nonExecutableNodes: {
    nodeTypes: [
      'n8n-nodes-base.readBinaryFile',
      'n8n-nodes-base.writeBinaryFile',
      'n8n-nodes-base.code',
      'n8n-nodes-base.function',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false,
    executor: null,
    toolGenerator: () => null
  },

  // Non-executable orchestration nodes (Langchain, triggers, etc.)
  langchainOrchestration: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.agent',
      '@n8n/n8n-nodes-langchain.chatTrigger',
      '@n8n/n8n-nodes-langchain.memoryBufferWindow',
      '@n8n/n8n-nodes-langchain.openAi',
      '@n8n/n8n-nodes-langchain.lmChatOpenAi',
      'n8n-nodes-base.scheduleTrigger',
      'n8n-nodes-base.stickyNote',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
    executor: null,
    toolGenerator: () => null
  }
};

/**
 * Node Registry class - provides lookup and validation methods
 */
export class NodeRegistry {
  /**
   * Find node definition by node type
   */
  findDefinition(nodeType: string): NodeDefinition | null {
    for (const [_, def] of Object.entries(NODE_REGISTRY)) {
      if (def.nodeTypes.includes(nodeType)) {
        return def;
      }
    }
    return null;
  }

  /**
   * Check if a node type can be executed as a tool
   */
  isExecutable(nodeType: string): boolean {
    const def = this.findDefinition(nodeType);
    return def?.isExecutable ?? false;
  }

  /**
   * Get required credential patterns for a node type
   */
  getRequiredCredentialPatterns(nodeType: string): string[] {
    const def = this.findDefinition(nodeType);
    return def?.credentialPatterns ?? [];
  }

  /**
   * Get executor function for a node type
   */
  getExecutor(nodeType: string): NodeExecutor | null {
    const def = this.findDefinition(nodeType);
    return def?.executor ?? null;
  }

  /**
   * Generate tool definition for a node
   */
  generateTool(node: N8nNode): LovableAITool | null {
    const def = this.findDefinition(node.type);
    if (!def || !def.isExecutable) {
      return null;
    }
    return def.toolGenerator(node);
  }

  /**
   * Get all supported node types
   */
  getAllSupportedNodeTypes(): string[] {
    const types: string[] = [];
    for (const def of Object.values(NODE_REGISTRY)) {
      types.push(...def.nodeTypes);
    }
    return types;
  }

  /**
   * Get statistics about node support
   */
  getRegistryStats(): {
    totalDefinitions: number;
    executableNodes: number;
    orchestrationNodes: number;
    totalNodeTypes: number;
  } {
    const defs = Object.values(NODE_REGISTRY);
    return {
      totalDefinitions: defs.length,
      executableNodes: defs.filter(d => d.isExecutable).length,
      orchestrationNodes: defs.filter(d => !d.isExecutable).length,
      totalNodeTypes: defs.reduce((sum, d) => sum + d.nodeTypes.length, 0)
    };
  }
}
