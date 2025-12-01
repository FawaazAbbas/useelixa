export interface MockAutomation {
  id: string;
  name: string;
  action: string;
  status: string;
  trigger: string;
  progress: number;
  last_run: string | null;
  task_id: string;
  chain_order: number;
  agent_id: string | null;
  next_run_at: string | null;
  schedule_type: string | null;
  agent?: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  };
}

export const mockAutomations: MockAutomation[] = [
  {
    id: "auto-1",
    name: "Send Initial Email",
    action: "Compose and send a welcome email to new clients",
    status: "active",
    trigger: "manual",
    progress: 100,
    last_run: "2024-12-01T10:30:00Z",
    task_id: "task-1",
    chain_order: 1,
    agent_id: "agent-1",
    next_run_at: null,
    schedule_type: null,
    agent: {
      id: "agent-1",
      name: "Email Assistant",
      description: "Handles email communications",
      capabilities: ["email", "scheduling"]
    }
  },
  {
    id: "auto-2",
    name: "Schedule Follow-up",
    action: "Schedule a follow-up meeting in 2 days",
    status: "active",
    trigger: "manual",
    progress: 0,
    last_run: null,
    task_id: "task-1",
    chain_order: 2,
    agent_id: "agent-2",
    next_run_at: null,
    schedule_type: null,
    agent: {
      id: "agent-2",
      name: "Calendar Manager",
      description: "Manages calendar and scheduling",
      capabilities: ["calendar", "scheduling"]
    }
  },
  {
    id: "auto-3",
    name: "Update CRM",
    action: "Update client status in CRM system",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: "2024-11-30T15:00:00Z",
    task_id: "task-2",
    chain_order: 1,
    agent_id: "agent-3",
    next_run_at: null,
    schedule_type: null,
    agent: {
      id: "agent-3",
      name: "CRM Specialist",
      description: "Manages CRM operations",
      capabilities: ["crm", "data-entry"]
    }
  }
];
