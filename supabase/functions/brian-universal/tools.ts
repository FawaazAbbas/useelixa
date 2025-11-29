export const platformTools = [
  {
    type: "function",
    function: {
      name: "get_agent_tasks",
      description: "Get all tasks assigned to a specific agent, or all tasks if no agent_id provided",
      parameters: {
        type: "object",
        properties: {
          agent_id: {
            type: "string",
            description: "The agent ID to get tasks for (optional - omit to get all tasks)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_agent_workload",
      description: "Get task workload summary for all agents showing how many tasks each agent has",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
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
  },
  {
    type: "function",
    function: {
      name: "read_knowledge_document",
      description: "Read the full content of a document or file from the workspace knowledge base. Use this when you need to see the actual content of uploaded files.",
      parameters: {
        type: "object",
        properties: {
          document_name: {
            type: "string",
            description: "The exact name of the document to read (e.g., 'report.pdf', 'data.xlsx')"
          }
        },
        required: ["document_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_knowledge_documents",
      description: "List all documents and files available in the workspace knowledge base",
      parameters: {
        type: "object",
        properties: {
          folder: {
            type: "string",
            description: "Optional: filter by folder name"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_chat_file",
      description: "Read the content of a file that was uploaded in this chat conversation",
      parameters: {
        type: "object",
        properties: {
          file_name: {
            type: "string",
            description: "The name of the file uploaded in this chat"
          }
        },
        required: ["file_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_chat_files",
      description: "List all files that have been uploaded in this chat conversation",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "save_to_knowledge_base",
      description: "Save a file or content to the workspace knowledge base for future reference",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content to save (text, JSON, etc.)"
          },
          name: {
            type: "string",
            description: "Name for the saved document"
          },
          description: {
            type: "string",
            description: "Optional description of what this document contains"
          },
          folder: {
            type: "string",
            description: "Optional folder to organize the document"
          }
        },
        required: ["content", "name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_knowledge_article",
      description: "Create a searchable knowledge article in the workspace",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the knowledge article"
          },
          content: {
            type: "string",
            description: "The article content"
          },
          category: {
            type: "string",
            description: "Optional category (e.g., 'processes', 'guidelines')"
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Optional tags for searchability"
          }
        },
        required: ["title", "content"]
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
      description: "Store user preferences, work style, goals, or important context with categories and scopes. Use workspace scope for company-wide information, chat scope for conversation-specific details.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["work_style", "preferences", "goals", "context", "custom"],
            description: "Category of memory (work_style: how they work, preferences: what they like, goals: what they want to achieve, context: background info, custom: other)"
          },
          key: {
            type: "string",
            description: "Short descriptive key (e.g., 'report_format', 'meeting_preference')"
          },
          value: {
            type: "string",
            description: "The information to remember"
          },
          scope: {
            type: "string",
            enum: ["workspace", "chat"],
            description: "workspace: available across all chats, chat: only in this conversation"
          }
        },
        required: ["category", "key", "value", "scope"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "recall",
      description: "Retrieve stored memories by category and scope",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["work_style", "preferences", "goals", "context", "custom", "all"],
            description: "Category to recall from (use 'all' to retrieve everything)"
          },
          scope: {
            type: "string",
            enum: ["workspace", "chat", "all"],
            description: "Scope to recall from"
          }
        },
        required: ["category", "scope"]
      }
    }
  }
];

export const connectionTools = [
  {
    type: "function",
    function: {
      name: "list_connected_services",
      description: "Show all services the user has connected (Google, Notion, Calendly, etc.) and their connection status. Use this to check what integrations are available.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "verify_credential",
      description: "Test if a specific service connection is working properly. Useful for debugging why something isn't working.",
      parameters: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "Service name (e.g., 'Google', 'Notion', 'Calendly')"
          }
        },
        required: ["service"]
      }
    }
  }
];
