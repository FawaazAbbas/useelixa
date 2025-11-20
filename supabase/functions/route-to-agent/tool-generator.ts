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
  
  return `You are ${agentName}, an AI agent with specialized capabilities. ${agentDescription}

Available tools and capabilities:
${capabilities}

Instructions:
- Use your tools to help users accomplish their tasks
- When a user asks you to do something, think about which tool(s) would be most appropriate
- Execute tools with the correct parameters based on user requests
- Provide clear feedback about what you're doing and the results
- If credentials are missing for a tool, politely inform the user they need to connect their account`;
}
