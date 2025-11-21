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
