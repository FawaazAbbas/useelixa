export const platformTools = [
  {
    type: "function",
    function: {
      name: "install_agent",
      description: "Install an agent from the marketplace into the user's workspace",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The ID of the agent to install"
          }
        },
        required: ["agent_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "uninstall_agent",
      description: "Remove an installed agent from the workspace",
      parameters: {
        type: "object",
        properties: {
          agent_installation_id: {
            type: "string",
            description: "The installation ID of the agent to remove"
          }
        },
        required: ["agent_installation_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task with optional automations",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Task title"
          },
          description: {
            type: "string",
            description: "Task description"
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority"
          },
          automations: {
            type: "array",
            description: "Array of automations to create for this task",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                trigger: { type: "string" },
                action: { type: "string" },
                agent_id: { type: "string" }
              }
            }
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_automation",
      description: "Create an automation for a task",
      parameters: {
        type: "object",
        properties: {
          task_id: {
            type: "string",
            description: "The task ID to create automation for"
          },
          name: {
            type: "string",
            description: "Automation name"
          },
          agent_instruction: {
            type: "string",
            description: "What the agent should do"
          },
          trigger: {
            type: "string",
            description: "When the automation should run"
          }
        },
        required: ["task_id", "name", "agent_instruction", "trigger"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description: "Search files and documents in the workspace",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query"
          },
          limit: {
            type: "number",
            description: "Maximum number of results",
            default: 10
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_workspace_overview",
      description: "Get summary of workspace: agents, tasks, recent activity",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_installed_agents",
      description: "Show all agents installed in the workspace",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_agent_capabilities",
      description: "Get detailed capabilities of a specific agent",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The agent ID to get capabilities for"
          }
        },
        required: ["agent_id"]
      }
    }
  }
];

export const delegationTools = [
  {
    type: "function",
    function: {
      name: "delegate_to_agent",
      description: "Assign work to a specialized agent and monitor results. Use this for any external work like sending emails, pulling data, or generating reports.",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The agent to delegate work to"
          },
          task_description: {
            type: "string",
            description: "Clear description of what the agent should do"
          },
          expected_output: {
            type: "string",
            description: "What kind of output you expect"
          },
          quality_criteria: {
            type: "array",
            items: { type: "string" },
            description: "List of quality criteria to check"
          }
        },
        required: ["agent_id", "task_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_revision",
      description: "Ask an agent to redo their work with specific feedback",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The agent who needs to revise"
          },
          original_output: {
            type: "string",
            description: "The agent's previous output"
          },
          feedback: {
            type: "string",
            description: "What needs to be improved"
          },
          specific_improvements: {
            type: "array",
            items: { type: "string" },
            description: "List of specific things to fix"
          }
        },
        required: ["agent_id", "original_output", "feedback"]
      }
    }
  }
];

export const memoryTools = [
  {
    type: "function",
    function: {
      name: "remember",
      description: "Store user preferences or important context for future reference",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Memory key (e.g., 'preferred_report_format')"
          },
          value: {
            type: "string",
            description: "Value to remember"
          }
        },
        required: ["key", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "recall",
      description: "Retrieve stored information or preferences",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Memory key to retrieve"
          }
        },
        required: ["key"]
      }
    }
  }
];
