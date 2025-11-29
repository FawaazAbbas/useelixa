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

  whatsapp: {
    nodeTypes: [
      'n8n-nodes-base.whatsApp',
      'n8n-nodes-base.whatsAppTrigger',
    ],
    category: 'communication',
    credentialPatterns: ['whatsApp*'],
    isExecutable: true,
  },

  microsoftTeams: {
    nodeTypes: [
      'n8n-nodes-base.microsoftTeams',
    ],
    category: 'communication',
    credentialPatterns: ['microsoftTeams*', 'microsoftOAuth2*'],
    isExecutable: true,
  },

  twilio: {
    nodeTypes: [
      'n8n-nodes-base.twilio',
    ],
    category: 'communication',
    credentialPatterns: ['twilio*'],
    isExecutable: true,
  },

  sendgrid: {
    nodeTypes: [
      'n8n-nodes-base.sendGrid',
    ],
    category: 'communication',
    credentialPatterns: ['sendGrid*'],
    isExecutable: true,
  },

  mailchimp: {
    nodeTypes: [
      'n8n-nodes-base.mailchimp',
    ],
    category: 'communication',
    credentialPatterns: ['mailchimp*'],
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

  dropbox: {
    nodeTypes: [
      'n8n-nodes-base.dropbox',
    ],
    category: 'storage',
    credentialPatterns: ['dropbox*'],
    isExecutable: true,
  },

  oneDrive: {
    nodeTypes: [
      'n8n-nodes-base.microsoftOneDrive',
    ],
    category: 'storage',
    credentialPatterns: ['microsoftOneDrive*', 'microsoftOAuth2*'],
    isExecutable: true,
  },

  box: {
    nodeTypes: [
      'n8n-nodes-base.box',
    ],
    category: 'storage',
    credentialPatterns: ['box*'],
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

  gitlab: {
    nodeTypes: [
      'n8n-nodes-base.gitlab',
    ],
    category: 'automation',
    credentialPatterns: ['gitlab*'],
    isExecutable: true,
  },

  bitbucket: {
    nodeTypes: [
      'n8n-nodes-base.bitbucket',
    ],
    category: 'automation',
    credentialPatterns: ['bitbucket*'],
    isExecutable: true,
  },

  jira: {
    nodeTypes: [
      'n8n-nodes-base.jira',
    ],
    category: 'automation',
    credentialPatterns: ['jira*'],
    isExecutable: true,
  },

  asana: {
    nodeTypes: [
      'n8n-nodes-base.asana',
    ],
    category: 'automation',
    credentialPatterns: ['asana*'],
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

  monday: {
    nodeTypes: [
      'n8n-nodes-base.mondayDotCom',
    ],
    category: 'automation',
    credentialPatterns: ['monday*'],
    isExecutable: true,
  },

  clickup: {
    nodeTypes: [
      'n8n-nodes-base.clickUp',
    ],
    category: 'automation',
    credentialPatterns: ['clickUp*'],
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

  linkedin: {
    nodeTypes: [
      'n8n-nodes-base.linkedIn',
    ],
    category: 'communication',
    credentialPatterns: ['linkedIn*'],
    isExecutable: true,
  },

  facebook: {
    nodeTypes: [
      'n8n-nodes-base.facebook',
      'n8n-nodes-base.facebookGraph',
    ],
    category: 'communication',
    credentialPatterns: ['facebook*'],
    isExecutable: true,
  },

  instagram: {
    nodeTypes: [
      'n8n-nodes-base.instagram',
    ],
    category: 'communication',
    credentialPatterns: ['instagram*'],
    isExecutable: true,
  },

  hubspot: {
    nodeTypes: [
      'n8n-nodes-base.hubspot',
    ],
    category: 'automation',
    credentialPatterns: ['hubspot*'],
    isExecutable: true,
  },

  salesforce: {
    nodeTypes: [
      'n8n-nodes-base.salesforce',
    ],
    category: 'automation',
    credentialPatterns: ['salesforce*'],
    isExecutable: true,
  },

  pipedrive: {
    nodeTypes: [
      'n8n-nodes-base.pipedrive',
    ],
    category: 'automation',
    credentialPatterns: ['pipedrive*'],
    isExecutable: true,
  },

  shopify: {
    nodeTypes: [
      'n8n-nodes-base.shopify',
    ],
    category: 'automation',
    credentialPatterns: ['shopify*'],
    isExecutable: true,
  },

  stripe: {
    nodeTypes: [
      'n8n-nodes-base.stripe',
    ],
    category: 'automation',
    credentialPatterns: ['stripe*'],
    isExecutable: true,
  },

  paypal: {
    nodeTypes: [
      'n8n-nodes-base.payPal',
    ],
    category: 'automation',
    credentialPatterns: ['payPal*'],
    isExecutable: true,
  },

  woocommerce: {
    nodeTypes: [
      'n8n-nodes-base.wooCommerce',
    ],
    category: 'automation',
    credentialPatterns: ['wooCommerce*'],
    isExecutable: true,
  },

  mysql: {
    nodeTypes: [
      'n8n-nodes-base.mySql',
    ],
    category: 'database',
    credentialPatterns: ['mySql*'],
    isExecutable: true,
  },

  postgres: {
    nodeTypes: [
      'n8n-nodes-base.postgres',
    ],
    category: 'database',
    credentialPatterns: ['postgres*'],
    isExecutable: true,
  },

  mongodb: {
    nodeTypes: [
      'n8n-nodes-base.mongoDb',
    ],
    category: 'database',
    credentialPatterns: ['mongoDb*'],
    isExecutable: true,
  },

  redis: {
    nodeTypes: [
      'n8n-nodes-base.redis',
    ],
    category: 'database',
    credentialPatterns: ['redis*'],
    isExecutable: true,
  },

  supabase: {
    nodeTypes: [
      'n8n-nodes-base.supabase',
    ],
    category: 'database',
    credentialPatterns: ['supabase*'],
    isExecutable: true,
  },

  awsS3: {
    nodeTypes: [
      'n8n-nodes-base.awsS3',
    ],
    category: 'storage',
    credentialPatterns: ['aws*'],
    isExecutable: true,
  },

  awsLambda: {
    nodeTypes: [
      'n8n-nodes-base.awsLambda',
    ],
    category: 'automation',
    credentialPatterns: ['aws*'],
    isExecutable: true,
  },

  googleCloudStorage: {
    nodeTypes: [
      'n8n-nodes-base.googleCloudStorage',
    ],
    category: 'storage',
    credentialPatterns: ['googleCloud*', 'googleOAuth2*'],
    isExecutable: true,
  },

  typeform: {
    nodeTypes: [
      'n8n-nodes-base.typeform',
      'n8n-nodes-base.typeformTrigger',
    ],
    category: 'automation',
    credentialPatterns: ['typeform*'],
    isExecutable: true,
  },

  googleForms: {
    nodeTypes: [
      'n8n-nodes-base.googleForms',
    ],
    category: 'automation',
    credentialPatterns: ['googleForms*', 'googleOAuth2*'],
    isExecutable: true,
  },

  activecampaign: {
    nodeTypes: [
      'n8n-nodes-base.activeCampaign',
    ],
    category: 'communication',
    credentialPatterns: ['activeCampaign*'],
    isExecutable: true,
  },

  googleAnalytics: {
    nodeTypes: [
      'n8n-nodes-base.googleAnalytics',
    ],
    category: 'automation',
    credentialPatterns: ['googleAnalytics*', 'googleOAuth2*'],
    isExecutable: true,
  },

  evernote: {
    nodeTypes: [
      'n8n-nodes-base.evernote',
    ],
    category: 'storage',
    credentialPatterns: ['evernote*'],
    isExecutable: true,
  },

  todoist: {
    nodeTypes: [
      'n8n-nodes-base.todoist',
    ],
    category: 'automation',
    credentialPatterns: ['todoist*'],
    isExecutable: true,
  },

  zoom: {
    nodeTypes: [
      'n8n-nodes-base.zoom',
    ],
    category: 'communication',
    credentialPatterns: ['zoom*'],
    isExecutable: true,
  },

  outlookCalendar: {
    nodeTypes: [
      'n8n-nodes-base.microsoftOutlook',
    ],
    category: 'automation',
    credentialPatterns: ['microsoftOutlook*', 'microsoftOAuth2*'],
    isExecutable: true,
  },

  emailSend: {
    nodeTypes: [
      'n8n-nodes-base.emailSend',
    ],
    category: 'communication',
    credentialPatterns: ['smtp*'],
    isExecutable: true,
  },

  readBinaryFile: {
    nodeTypes: [
      'n8n-nodes-base.readBinaryFile',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false, // File system access not supported in cloud
  },

  writeBinaryFile: {
    nodeTypes: [
      'n8n-nodes-base.writeBinaryFile',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false, // File system access not supported in cloud
  },

  compress: {
    nodeTypes: [
      'n8n-nodes-base.compress',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  extract: {
    nodeTypes: [
      'n8n-nodes-base.extractFromFile',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  code: {
    nodeTypes: [
      'n8n-nodes-base.code',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false, // Arbitrary code execution not supported
  },

  function: {
    nodeTypes: [
      'n8n-nodes-base.function',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: false, // Arbitrary function execution not supported
  },

  sort: {
    nodeTypes: [
      'n8n-nodes-base.sort',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  split: {
    nodeTypes: [
      'n8n-nodes-base.splitInBatches',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  moveBinaryData: {
    nodeTypes: [
      'n8n-nodes-base.moveBinaryData',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  xml: {
    nodeTypes: [
      'n8n-nodes-base.xml',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  html: {
    nodeTypes: [
      'n8n-nodes-base.html',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  markdown: {
    nodeTypes: [
      'n8n-nodes-base.markdown',
    ],
    category: 'utility',
    credentialPatterns: [],
    isExecutable: true,
  },

  anthropic: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.lmChatAnthropic',
    ],
    category: 'ai',
    credentialPatterns: ['anthropic*'],
    isExecutable: true,
  },

  googleAI: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
    ],
    category: 'ai',
    credentialPatterns: ['googleAi*', 'googleOAuth2*'],
    isExecutable: true,
  },

  embeddings: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
      '@n8n/n8n-nodes-langchain.embeddingsAzureOpenAi',
    ],
    category: 'ai',
    credentialPatterns: ['openAi*', 'azureOpenAi*'],
    isExecutable: true,
  },

  textSplitter: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.textSplitter',
    ],
    category: 'ai',
    credentialPatterns: [],
    isExecutable: true,
  },

  documentLoader: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.documentLoader',
    ],
    category: 'ai',
    credentialPatterns: [],
    isExecutable: true,
  },

  vectorStore: {
    nodeTypes: [
      '@n8n/n8n-nodes-langchain.vectorStorePinecone',
      '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
      '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
    ],
    category: 'ai',
    credentialPatterns: ['pinecone*', 'supabase*'],
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
