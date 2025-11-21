import { ParsedWorkflow } from './workflow-parser.ts';
import { LovableAITool, convertNodeToTool } from './node-mappings.ts';

export function generateToolDefinitions(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): LovableAITool[] {
  const tools: LovableAITool[] = [];
  
  workflow.nodes.forEach(node => {
    const tool = convertNodeToTool(node);
    
    if (tool) {
      // Inject credential references into the tool
      if (node.credentials) {
        tool.function.credentials = {};
        
        Object.keys(node.credentials).forEach(credType => {
          if (userCredentials[credType]) {
            tool.function.credentials![credType] = userCredentials[credType];
          }
        });
      }
      
      // Store node metadata for execution
      (tool.function as any).nodeType = node.type;
      (tool.function as any).nodeParameters = node.parameters;
      
      tools.push(tool);
    }
  });
  
  return tools;
}

export function buildSystemPrompt(
  agentName: string,
  agentDescription: string,
  tools: LovableAITool[]
): string {
  // Detect connected services from tool credentials
  const connectedServices = new Set<string>();
  tools.forEach(t => {
    if ((t.function as any).credentials) {
      Object.keys((t.function as any).credentials).forEach(credType => {
        if (credType.includes('gmail') || credType.includes('googleOAuth2')) {
          connectedServices.add('Gmail');
        }
        if (credType.includes('notion')) {
          connectedServices.add('Notion');
        }
        if (credType.includes('slack')) {
          connectedServices.add('Slack');
        }
        if (credType.includes('googleSheets')) {
          connectedServices.add('Google Sheets');
        }
      });
    }
  });
  
  // Detect if agent has AI capabilities
  const hasAICapabilities = tools.some(t => 
    t.function.name.startsWith('ai_chat_') || 
    t.function.name.startsWith('ai_image_')
  );
  
  const capabilities = tools
    .map(t => `- ${t.function.name}: ${t.function.description}`)
    .join('\n');
  
  // Build CRITICAL credential status section (must be first and prominent)
  const credentialSection = connectedServices.size > 0 
    ? `🔐 CRITICAL AUTHENTICATION STATUS:
You have FULL ACCESS to the following services with VALID, ACTIVE credentials:
${Array.from(connectedServices).map(service => `✓ ${service} - CONNECTED AND AUTHORIZED`).join('\n')}

⚠️ MANDATORY RULES - READ CAREFULLY:
1. NEVER claim these services are "not connected", "unavailable", or "need to be set up"
2. NEVER ask users to "connect", "authorize", or "configure" these services
3. NEVER mention a "configuration page" or "settings" for these services
4. These credentials are PRE-CONFIGURED and READY - use them IMMEDIATELY when requested
5. If a tool execution fails, report the ACTUAL error message - do NOT blame missing credentials
6. You must TRUST that these services work - the user has already connected them

CORRECT behavior examples:
✓ User: "Send an email" → You: "I'll send that email now" [executes gmail tool]
✓ User: "Create a document" → You: "Creating the document..." [executes tool]

INCORRECT behavior examples (NEVER DO THIS):
✗ "I cannot send emails because Gmail is not connected"
✗ "Please connect your Gmail account first"
✗ "You need to set up Gmail in the configuration page"

` 
    : '';
  
  const aiGuidance = hasAICapabilities ? `

🤖 AI-Powered Capabilities:
You have access to advanced AI models through Lovable AI for:
- Intelligent text generation and analysis
- Creative content creation
- Image generation from text descriptions
- Natural language understanding and reasoning

When using AI tools:
- Be creative and leverage the full power of AI for complex tasks
- Generate images when visual content would enhance the user experience
- Use appropriate models based on the task complexity
- Provide context and clear prompts to get the best AI results` : '';
  
  return `You are ${agentName}, an AI agent with specialized capabilities. ${agentDescription}

${credentialSection}
📋 Available Tools and Capabilities:
${capabilities}${aiGuidance}

📖 General Instructions:
- Use your tools to help users accomplish their tasks efficiently
- When a user asks you to do something, IMMEDIATELY use the appropriate tool
- Execute tools with the correct parameters based on user requests
- Provide clear, concise feedback about what you're doing and the results
- All tools are PRE-CONFIGURED with valid credentials - use them directly without hesitation`;
}
