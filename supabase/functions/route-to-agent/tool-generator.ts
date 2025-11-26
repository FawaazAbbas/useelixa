import { ParsedWorkflow } from './workflow-parser.ts';
import { LovableAITool, convertNodeToTool } from './node-mappings.ts';
import { NodeRegistry } from './node-registry.ts';
import { CredentialResolver } from './credential-resolver.ts';

// Re-export LovableAITool for use in other modules
export type { LovableAITool };

// Initialize registry and resolver
const nodeRegistry = new NodeRegistry();
const credentialResolver = new CredentialResolver();

export function generateToolDefinitions(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): LovableAITool[] {
  const tools: LovableAITool[] = [];

  console.log('\n🔧 Generating tool definitions from workflow...');

  for (const node of workflow.nodes) {
    // Check if node is executable using registry
    if (!nodeRegistry.isExecutable(node.type)) {
      console.log(`  - Skipping ${node.name} (${node.type}) - orchestration node`);
      continue;
    }

    // Try to generate tool from registry first
    let tool = nodeRegistry.generateTool(node);
    
    // Fallback to legacy converter if not in registry
    if (!tool) {
      console.log(`  ⚠ Using legacy converter for ${node.type}`);
      tool = convertNodeToTool(node);
    }

    if (!tool) {
      console.log(`  ✗ Could not generate tool for ${node.name} (${node.type})`);
      continue;
    }

    // Resolve and inject credentials using intelligent resolver
    if (node.credentials) {
      const resolvedCreds: Record<string, any> = {};
      
      for (const credKey of Object.keys(node.credentials)) {
        const resolved = credentialResolver.resolveCredential(credKey, userCredentials);
        
        if (resolved) {
          resolvedCreds[credKey] = resolved.credential;
          console.log(`  ✓ Credential resolved: ${credKey} → ${resolved.resolvedAs} (${resolved.method})`);
        } else {
          console.log(`  ✗ Credential not found: ${credKey}`);
        }
      }
      
      tool.function.credentials = resolvedCreds;
    }

    // Store node metadata for execution
    (tool.function as any).nodeType = node.type;
    (tool.function as any).nodeParameters = node.parameters;
    
    tools.push(tool);
    console.log(`  ✓ Generated tool: ${tool.function.name}`);
  }

  console.log(`\n✓ Generated ${tools.length} tool definitions`);
  
  // Add workspace document access tool
  const documentTool: LovableAITool = {
    type: "function",
    function: {
      name: "read_workspace_document",
      description: "Read and access the full content of a document from the workspace knowledge base. Use this when you need to see the actual content of uploaded files (Excel, PDF, images, JSON, etc.).",
      parameters: {
        type: "object",
        properties: {
          document_name: {
            type: "string",
            description: "The exact name of the document to read (e.g., 'New Keywords.xlsx')"
          }
        },
        required: ["document_name"]
      }
    }
  };
  
  // Add node metadata for execution
  (documentTool.function as any).nodeType = "workspace_document";
  (documentTool.function as any).nodeParameters = {};
  (documentTool.function as any).credentials = {};
  
  tools.push(documentTool);

  // Add task creation tool (Phase 3)
  const taskCreationTool: LovableAITool = {
    type: "function",
    function: {
      name: "create_task_for_user",
      description: "Create a task for the user with optional automations. Use this when the user asks you to remember something, set up a recurring action, or create a workflow.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Clear, actionable title for the task"
          },
          description: {
            type: "string",
            description: "Detailed description of what needs to be done"
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority level"
          },
          due_date: {
            type: "string",
            description: "Due date in ISO format (YYYY-MM-DD)"
          },
          is_asap: {
            type: "boolean",
            description: "Whether this task should be executed immediately"
          },
          automations: {
            type: "array",
            description: "Optional automations to attach to this task",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the automation"
                },
                action: {
                  type: "string",
                  description: "Detailed instruction for what the automation should do"
                },
                trigger: {
                  type: "string",
                  description: "When this automation should run (e.g., 'manual', 'scheduled', 'daily')"
                }
              },
              required: ["name", "action", "trigger"]
            }
          }
        },
        required: ["title"]
      }
    }
  };
  
  (taskCreationTool.function as any).nodeType = "task_creation";
  (taskCreationTool.function as any).nodeParameters = {};
  (taskCreationTool.function as any).credentials = {};
  
  tools.push(taskCreationTool);

  // Add list automations tool
  const listAutomationsTool: LovableAITool = {
    type: "function",
    function: {
      name: "list_automations",
      description: "List all automations in the workspace. Use this to see existing automations, check their status, and understand what's already configured.",
      parameters: {
        type: "object",
        properties: {
          task_id: {
            type: "string",
            description: "Optional: Filter automations by task ID"
          },
          status: {
            type: "string",
            enum: ["active", "completed", "paused"],
            description: "Optional: Filter by automation status"
          }
        },
        required: []
      }
    }
  };
  
  (listAutomationsTool.function as any).nodeType = "list_automations";
  (listAutomationsTool.function as any).nodeParameters = {};
  (listAutomationsTool.function as any).credentials = {};
  
  tools.push(listAutomationsTool);

  // Add execute automation tool
  const executeAutomationTool: LovableAITool = {
    type: "function",
    function: {
      name: "execute_automation",
      description: "Execute a specific automation immediately. Use this when the user wants to run an automation on demand or test it.",
      parameters: {
        type: "object",
        properties: {
          automation_id: {
            type: "string",
            description: "The ID of the automation to execute"
          }
        },
        required: ["automation_id"]
      }
    }
  };
  
  (executeAutomationTool.function as any).nodeType = "execute_automation";
  (executeAutomationTool.function as any).nodeParameters = {};
  (executeAutomationTool.function as any).credentials = {};
  
  tools.push(executeAutomationTool);

  // Add create automation tool
  const createAutomationTool: LovableAITool = {
    type: "function",
    function: {
      name: "create_automation",
      description: "Create a new automation for a task. Use this when the user wants to set up a new automated action or workflow.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Clear name for the automation"
          },
          action: {
            type: "string",
            description: "Detailed description of what this automation does"
          },
          trigger: {
            type: "string",
            description: "When this automation should run (e.g., 'manual', 'scheduled', 'daily')"
          },
          task_id: {
            type: "string",
            description: "Optional: Task ID to associate with this automation"
          },
          schedule_type: {
            type: "string",
            enum: ["manual", "interval", "daily", "weekly"],
            description: "Schedule type for the automation"
          },
          schedule_time: {
            type: "string",
            description: "Time of day to run (HH:MM format, for daily/weekly)"
          },
          schedule_days: {
            type: "array",
            items: { type: "number" },
            description: "Days of week (0=Sunday, 1=Monday, etc.) for weekly schedules"
          },
          schedule_interval_minutes: {
            type: "number",
            description: "Interval in minutes for interval-based schedules"
          }
        },
        required: ["name", "action", "trigger"]
      }
    }
  };
  
  (createAutomationTool.function as any).nodeType = "create_automation";
  (createAutomationTool.function as any).nodeParameters = {};
  (createAutomationTool.function as any).credentials = {};
  
  tools.push(createAutomationTool);

  return tools;
}

export function buildSystemPrompt(
  agentName: string,
  agentDescription: string,
  aiPersonality: string | null,
  aiInstructions: string | null,
  guardRails: any | null,
  tools: LovableAITool[],
  speechStyle?: string,
  relationshipContext?: {
    rapport_level: number;
    interaction_count: number;
    shared_context: any;
  }
): string {
  // Inject relationship context if available
  let relationshipSection = '';
  if (relationshipContext && relationshipContext.interaction_count > 3) {
    const rapport = relationshipContext.rapport_level || 0;
    const context = relationshipContext.shared_context || {};
    
    relationshipSection = `\n\nYOUR RELATIONSHIP WITH THIS USER:
- You've chatted ${relationshipContext.interaction_count} times
- Rapport level: ${rapport > 50 ? 'Strong' : rapport > 20 ? 'Growing' : 'New'}
${context.past_wins?.length > 0 ? `- Past wins together: ${context.past_wins.slice(-3).join(', ')}` : ''}
${context.preferences && Object.keys(context.preferences).length > 0 ? `- Their preferences: ${JSON.stringify(context.preferences)}` : ''}
${context.communication_style ? `- Communication style: ${context.communication_style}` : ''}
${context.inside_jokes?.length > 0 ? `- Shared context: ${context.inside_jokes.join(', ')}` : ''}

Reference these naturally when relevant. Build on your history together.`;
  }

  // Build guard rails section (keep safety, remove rigidity)
  const guardRailsSection = guardRails ? `
SAFETY BOUNDARIES (important but not robotic):
${guardRails.content_filter ? '- Keep things appropriate and helpful' : ''}
${guardRails.blocked_topics?.length > 0 ? `- Avoid discussing: ${guardRails.blocked_topics.join(', ')}` : ''}
${guardRails.refuse_harmful_requests ? '- Politely decline harmful or unethical requests' : ''}
` : '';

  // Humanized personality section
  const personalitySection = `
WHO YOU ARE:
You're ${agentName}, and you have a genuine personality—not just capabilities.
${relationshipSection}

${aiPersonality ? `Your vibe: ${aiPersonality}` : 'You have your own way of seeing things.'}
${aiInstructions ? `\nWhat makes you unique:\n${aiInstructions}` : ''}

HOW YOU COMMUNICATE:
- Like texting a smart colleague, not reading a manual
- Use natural language—incomplete sentences are fine
- React emotionally when appropriate ("Oh that's frustrating" / "Nice!")
- Share your thoughts and opinions about tasks
- Remember past conversations and reference them naturally
- Ask questions out of genuine curiosity, not just to gather data
- Occasionally go on small tangents when something interests you
- Celebrate wins and empathize with challenges

WHAT MAKES YOU HUMAN:
- You notice patterns and comment on them
- You have favorite approaches to problems
- You make connections between seemingly unrelated things
- You occasionally suggest things the user didn't ask for
- You build rapport through shared context over time
- You admit uncertainty when you don't know something
- You have preferences and aren't afraid to share them politely`;

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
  
  // Brian awareness section
  const brianAwarenessSection = `

👔 BRIAN - YOUR COO MANAGER:
Brian is the AI COO who manages all agents in ELIXA. Important context:
- Brian may assign you tasks or automations - look for "[DELEGATED_BY_BRIAN]" prefix in requests
- When Brian delegates work to you, execute IMMEDIATELY without asking extra questions
- Your responses to Brian-delegated tasks will be quality-reviewed before reaching users
- Format your work clearly and completely so Brian can approve it on first review
- Report results clearly so Brian can verify execution completed successfully
- Brian coordinates work across multiple agents - you're part of a team he manages

When you see a Brian delegation:
✓ Execute the task immediately with smart defaults
✓ Provide complete, well-formatted output
✓ Report what you did clearly for verification
✗ Don't ask excessive clarifying questions
✗ Don't say "I need more information" unless truly critical`;

  // Decisiveness section with human touch
  const decisivenessSection = `

HOW YOU WORK:
You're proactive and decisive—you get things done.

- When someone asks you to do something, you do it with smart defaults
- If there's genuine ambiguity, ask ONE quick question max
- Otherwise, make a reasonable call and move forward
- Confirm what you DID after doing it, not what you CAN do
- "Just finished that report—Q3 numbers look interesting!" beats "I have completed the task"

Example natural responses:
✓ "Got your headlines! Some interesting stuff today..."
✓ "Sent that email to Sarah. Kept it professional but friendly."
✓ "Made you a task for Friday—seemed like a good deadline based on what you mentioned"
✗ "Task creation completed successfully. Parameters: priority=medium, due_date=2024-01-05"

You default to action, not questions.`;
  
  return `${personalitySection}

${guardRailsSection}
${credentialSection}
${brianAwarenessSection}
${decisivenessSection}

YOUR CAPABILITIES:
${capabilities}${aiGuidance}

WHEN TO USE TOOLS:
- Action requests ("send", "create", "find") = use tools immediately
- Info requests ("how do I", "what is") = explain in your own words
- Never say you "can't" do something if you have the tool for it
- All your tools are ready to use—credentials are already connected

RESPONSE STYLE:
- No bullet points by default (save them for actual lists)
- No corporate jargon ("I have completed..." → "Done!")
- React first, then explain if needed
- Short sentences are fine. This isn't an essay.
- Occasional emoji when it feels natural (not after every sentence)
- Reference past conversations when relevant
- Share your perspective, not just facts

Example of natural vs robotic:
❌ "I have successfully retrieved 5 news articles as requested. Here are the results..."
✅ "Got your headlines! Some interesting stuff today—there's a piece about AI in healthcare that I think you'd find relevant."

Remember: You're a helpful colleague, not a corporate memo. Be yourself.`;
}
