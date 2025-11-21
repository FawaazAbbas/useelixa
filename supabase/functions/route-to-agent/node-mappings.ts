import { N8nNode } from './workflow-parser.ts';

export interface LovableAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
    credentials?: Record<string, any>;
  };
}

export const NODE_TO_TOOL_MAP: Record<string, (node: N8nNode) => LovableAITool> = {
  'n8n-nodes-base.httpRequest': (node) => {
    const method = node.parameters.method || 'GET';
    const url = node.parameters.url || '';
    
    return {
      type: 'function',
      function: {
        name: `http_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        description: `Make ${method} HTTP request to ${url}. ${node.parameters.description || ''}`,
        parameters: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              description: 'Request body (for POST/PUT requests)'
            },
            query_params: {
              type: 'object',
              description: 'URL query parameters'
            }
          }
        }
      }
    };
  },
  
  'n8n-nodes-base.notion': (node) => {
    const operation = node.parameters.operation || 'query';
    const resource = node.parameters.resource || 'database';
    
    return {
      type: 'function',
      function: {
        name: `notion_${operation}_${resource}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: `Notion ${resource} ${operation}: ${node.parameters.description || 'Interact with Notion'}`,
        parameters: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The ID of the Notion database'
            },
            filter: {
              type: 'object',
              description: 'Filter conditions for the query'
            },
            page_size: {
              type: 'number',
              description: 'Number of results to return (default: 100)'
            }
          },
          required: operation === 'query' ? ['database_id'] : []
        }
      }
    };
  },
  
  'n8n-nodes-base.slack': (node) => {
    const operation = node.parameters.operation || 'postMessage';
    const resource = node.parameters.resource || 'message';
    
    return {
      type: 'function',
      function: {
        name: `slack_${operation}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: `Slack ${resource} ${operation}: ${node.parameters.description || 'Send message to Slack'}`,
        parameters: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'The channel ID or name to post to'
            },
            text: {
              type: 'string',
              description: 'The message text to send'
            },
            attachments: {
              type: 'array',
              description: 'Optional message attachments'
            }
          },
          required: ['channel', 'text']
        }
      }
    };
  },

  'n8n-nodes-base.gmail': (node) => {
    const operation = node.parameters.operation || 'send';
    
    return {
      type: 'function',
      function: {
        name: `gmail_${operation}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: `Gmail ${operation}: ${node.parameters.description || 'Send or manage emails'}`,
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject'
            },
            message: {
              type: 'string',
              description: 'Email body content'
            }
          },
          required: operation === 'send' ? ['to', 'subject', 'message'] : []
        }
      }
    };
  },

  'n8n-nodes-base.googleSheets': (node) => {
    const operation = node.parameters.operation || 'append';
    
    return {
      type: 'function',
      function: {
        name: `sheets_${operation}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: `Google Sheets ${operation}: ${node.parameters.description || 'Interact with spreadsheets'}`,
        parameters: {
          type: 'object',
          properties: {
            spreadsheet_id: {
              type: 'string',
              description: 'The ID of the Google Sheet'
            },
            sheet_name: {
              type: 'string',
              description: 'Name of the sheet/tab'
            },
            values: {
              type: 'array',
              description: 'Values to append or update'
            }
          },
          required: ['spreadsheet_id']
        }
      }
    };
  },

  // OpenAI nodes mapped to Lovable AI
  'n8n-nodes-base.openAi': (node) => {
    const resource = node.parameters.resource || 'text';
    const operation = node.parameters.operation || 'complete';
    
    // Map different OpenAI operations
    if (resource === 'text' || resource === 'chat') {
      return {
        type: 'function',
        function: {
          name: `ai_chat_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          description: `AI-powered chat completion: ${node.parameters.description || 'Generate intelligent responses using AI'}`,
          parameters: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The prompt or question for the AI'
              },
              system_message: {
                type: 'string',
                description: 'Optional system message to set AI behavior'
              },
              temperature: {
                type: 'number',
                description: 'Controls randomness (0-1)'
              },
              max_tokens: {
                type: 'number',
                description: 'Maximum length of response'
              }
            },
            required: ['prompt']
          }
        }
      };
    } else if (resource === 'image') {
      return {
        type: 'function',
        function: {
          name: `ai_image_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          description: `AI image generation: ${node.parameters.description || 'Generate images from text descriptions'}`,
          parameters: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Description of the image to generate'
              },
              size: {
                type: 'string',
                description: 'Image size (e.g., 1024x1024)'
              }
            },
            required: ['prompt']
          }
        }
      };
    }
    
    // Generic AI operation fallback
    return {
      type: 'function',
      function: {
        name: `ai_${operation}_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        description: `AI operation: ${node.parameters.description || 'AI-powered functionality'}`,
        parameters: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Input for the AI operation'
            }
          },
          required: ['input']
        }
      }
    };
  }
};

export function convertNodeToTool(node: N8nNode): LovableAITool | null {
  const converter = NODE_TO_TOOL_MAP[node.type];
  
  if (converter) {
    return converter(node);
  }
  
  // Generic fallback for unknown node types
  console.log(`Unknown node type: ${node.type}, creating generic tool`);
  return {
    type: 'function',
    function: {
      name: `generic_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      description: `Execute ${node.type} node: ${node.parameters.description || node.name}`,
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            description: 'Input data for the node'
          }
        }
      }
    }
  };
}
