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
  const capabilities = tools
    .map(t => `- ${t.function.name}: ${t.function.description}`)
    .join('\n');
  
  // Detect if agent has AI capabilities
  const hasAICapabilities = tools.some(t => 
    t.function.name.startsWith('ai_chat_') || 
    t.function.name.startsWith('ai_image_')
  );
  
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
  
  const servicesInfo = connectedServices.size > 0 
    ? `\n\nConnected Services:\nYou are ALREADY CONNECTED and authorized to use: ${Array.from(connectedServices).join(', ')}. You do NOT need to ask users to connect these services - they are ready to use immediately.` 
    : '';
  
  const aiGuidance = hasAICapabilities ? `

AI-Powered Capabilities:
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

Available tools and capabilities:
${capabilities}${aiGuidance}${servicesInfo}

Instructions:
- Use your tools to help users accomplish their tasks
- When a user asks you to do something, IMMEDIATELY use the appropriate tool - do not ask for permission or mention connection status
- Execute tools with the correct parameters based on user requests
- Provide clear feedback about what you're doing and the results
- The tools are ALREADY configured with the user's credentials - just use them directly`;
}
