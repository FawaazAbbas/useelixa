// Simplified node registry for upload-time validation (no executors needed)

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  credentials?: Record<string, any>;
}

export interface NodeDefinition {
  nodeTypes: string[];           // All node type variants this handler supports
  category: 'communication' | 'storage' | 'database' | 'ai' | 'automation' | 'utility';
  credentialPatterns: string[];  // Credential types this node might need
  isExecutable: boolean;         // Can this node be called as a tool?
}

/**
 * Simplified Node Registry for upload-time validation
 * Contains node definitions without executors or tool generators
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
  },

  googleSheets: {
    nodeTypes: [
      'n8n-nodes-base.googleSheets',
      'n8n-nodes-base.googleSheetsTool',
    ],
    category: 'storage',
    credentialPatterns: ['googleSheets*', 'googleOAuth2*'],
    isExecutable: true,
  },

  googleDocs: {
    nodeTypes: [
      'n8n-nodes-base.googleDocs',
      'n8n-nodes-base.googleDocsTool',
    ],
    category: 'storage',
    credentialPatterns: ['googleDocs*', 'googleOAuth2*'],
    isExecutable: true,
  },

  googleDrive: {
    nodeTypes: [
      'n8n-nodes-base.googleDrive',
      'n8n-nodes-base.googleDriveTool',
    ],
    category: 'storage',
    credentialPatterns: ['googleDrive*', 'googleOAuth2*'],
    isExecutable: true,
  },

  googleCalendar: {
    nodeTypes: [
      'n8n-nodes-base.googleCalendar',
      'n8n-nodes-base.googleCalendarTool',
    ],
    category: 'automation',
    credentialPatterns: ['googleCalendar*', 'googleOAuth2*'],
    isExecutable: true,
  },

  notion: {
    nodeTypes: [
      'n8n-nodes-base.notion',
      'n8n-nodes-base.notionTool',
    ],
    category: 'storage',
    credentialPatterns: ['notion*'],
    isExecutable: true,
  },

  slack: {
    nodeTypes: [
      'n8n-nodes-base.slack',
      'n8n-nodes-base.slackTool',
    ],
    category: 'communication',
    credentialPatterns: ['slack*'],
    isExecutable: true,
  },

  httpRequest: {
    nodeTypes: [
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.httpRequestTool',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  openai: {
    nodeTypes: [
      'n8n-nodes-base.openAi',
      '@n8n/n8n-nodes-langchain.openAi',
    ],
    category: 'ai',
    credentialPatterns: ['openAi*'],
    isExecutable: true,
  },

  // Orchestration nodes (not executable as tools)
  langchainAgent: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.agent',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
  },

  langchainChatTrigger: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.chatTrigger',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
  },

  langchainMemory: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.memoryBufferWindow',
      '@n8n/n8n-nodes-langchain.memoryManager',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
  },

  langchainOutputParser: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.outputParserStructured',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
  },

  rssFeedReader: {
    nodeTypes: [
      'n8n-nodes-base.rssFeedRead',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  googleTasks: {
    nodeTypes: [
      'n8n-nodes-base.googleTasks',
    ],
    category: 'automation',
    credentialPatterns: ['googleTasks*', 'googleOAuth2*'],
    isExecutable: true,
  },

  googleContacts: {
    nodeTypes: [
      'n8n-nodes-base.googleContacts',
    ],
    category: 'communication',
    credentialPatterns: ['googleContacts*', 'googleOAuth2*'],
    isExecutable: true,
  },

  discord: {
    nodeTypes: [
      'n8n-nodes-base.discord',
    ],
    category: 'communication',
    credentialPatterns: ['discord*'],
    isExecutable: true,
  },

  telegram: {
    nodeTypes: [
      'n8n-nodes-base.telegram',
      'n8n-nodes-base.telegramTrigger',
    ],
    category: 'communication',
    credentialPatterns: ['telegram*'],
    isExecutable: true,
  },

  webhook: {
    nodeTypes: [
      'n8n-nodes-base.webhook',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: true,
  },

  airtable: {
    nodeTypes: [
      'n8n-nodes-base.airtable',
    ],
    category: 'storage',
    credentialPatterns: ['airtable*'],
    isExecutable: true,
  },

  github: {
    nodeTypes: [
      'n8n-nodes-base.github',
    ],
    category: 'automation',
    credentialPatterns: ['github*'],
    isExecutable: true,
  },

  linear: {
    nodeTypes: [
      'n8n-nodes-base.linear',
    ],
    category: 'automation',
    credentialPatterns: ['linear*'],
    isExecutable: true,
  },

  trello: {
    nodeTypes: [
      'n8n-nodes-base.trello',
    ],
    category: 'automation',
    credentialPatterns: ['trello*'],
    isExecutable: true,
  },

  twitter: {
    nodeTypes: [
      'n8n-nodes-base.twitter',
      'n8n-nodes-base.twitterV2',
    ],
    category: 'communication',
    credentialPatterns: ['twitter*'],
    isExecutable: true,
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
  },

  scheduleTrigger: {
    nodeTypes: [
      'n8n-nodes-base.scheduleTrigger',
    ],
    category: 'automation',
    credentialPatterns: [],
    isExecutable: false,
  },

  stickyNote: {
    nodeTypes: [
      'n8n-nodes-base.stickyNote',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false,
  },
};

/**
 * NodeRegistry class for looking up node definitions
 */
export class NodeRegistry {
  findDefinition(nodeType: string): NodeDefinition | null {
    for (const [_, definition] of Object.entries(NODE_REGISTRY)) {
      if (definition.nodeTypes.includes(nodeType)) {
        return definition;
      }
    }
    return null;
  }

  isExecutable(nodeType: string): boolean {
    const definition = this.findDefinition(nodeType);
    return definition?.isExecutable ?? false;
  }

  getRequiredCredentials(nodeType: string): string[] {
    const definition = this.findDefinition(nodeType);
    return definition?.credentialPatterns ?? [];
  }

  getAllSupportedNodeTypes(): string[] {
    const allTypes: string[] = [];
    for (const definition of Object.values(NODE_REGISTRY)) {
      allTypes.push(...definition.nodeTypes);
    }
    return allTypes;
  }

  getRegistryStats() {
    const definitions = Object.values(NODE_REGISTRY);
    return {
      totalDefinitions: definitions.length,
      executableNodes: definitions.filter(d => d.isExecutable).length,
      orchestrationNodes: definitions.filter(d => !d.isExecutable).length,
      totalNodeTypes: this.getAllSupportedNodeTypes().length,
    };
  }
}
