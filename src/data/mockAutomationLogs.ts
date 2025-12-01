export interface MockAutomationLog {
  id: string;
  automation_id: string;
  executed_at: string;
  status: "success" | "failed" | "partial" | "pending";
  output_data: any;
  error_message: string | null;
  execution_time_ms: number | null;
  task_id: string;
  automation: {
    name: string;
  };
}

export const mockAutomationLogs: MockAutomationLog[] = [
  {
    id: "log-1",
    automation_id: "auto-1",
    executed_at: "2024-12-01T10:30:00Z",
    status: "success",
    output_data: {
      emailSent: true,
      recipientCount: 1,
      subject: "Welcome to Our Service"
    },
    error_message: null,
    execution_time_ms: 1250,
    task_id: "task-1",
    automation: {
      name: "Send Initial Email"
    }
  },
  {
    id: "log-2",
    automation_id: "auto-1",
    executed_at: "2024-11-30T09:15:00Z",
    status: "failed",
    output_data: null,
    error_message: "SMTP connection timeout - mail server unreachable",
    execution_time_ms: 5000,
    task_id: "task-1",
    automation: {
      name: "Send Initial Email"
    }
  },
  {
    id: "log-3",
    automation_id: "auto-3",
    executed_at: "2024-11-30T15:00:00Z",
    status: "success",
    output_data: {
      recordsUpdated: 3,
      fieldsModified: ["status", "last_contact", "notes"]
    },
    error_message: null,
    execution_time_ms: 890,
    task_id: "task-2",
    automation: {
      name: "Update CRM"
    }
  },
  {
    id: "log-4",
    automation_id: "auto-2",
    executed_at: "2024-11-29T14:20:00Z",
    status: "partial",
    output_data: {
      meetingCreated: true,
      invitesSent: 2,
      invitesFailed: 1
    },
    error_message: "One attendee email address was invalid",
    execution_time_ms: 2100,
    task_id: "task-1",
    automation: {
      name: "Schedule Follow-up"
    }
  },
  {
    id: "log-5",
    automation_id: "auto-1",
    executed_at: "2024-11-28T11:00:00Z",
    status: "success",
    output_data: {
      emailSent: true,
      recipientCount: 1,
      subject: "Welcome to Our Service"
    },
    error_message: null,
    execution_time_ms: 1100,
    task_id: "task-3",
    automation: {
      name: "Send Initial Email"
    }
  }
];
