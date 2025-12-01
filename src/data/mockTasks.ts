export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  automation_count: number;
  completed_automation_count: number;
  is_asap: boolean;
}

export const mockTasks: MockTask[] = [
  {
    id: "task-1",
    title: "Review Q4 marketing strategy",
    description: "Analyze performance metrics and prepare recommendations for next quarter",
    priority: "high",
    status: "pending",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    automation_count: 5,
    completed_automation_count: 3,
    is_asap: true,
  },
  {
    id: "task-2",
    title: "Send follow-up emails to leads",
    description: "Contact all leads from the webinar last week",
    priority: "medium",
    status: "pending",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
  },
  {
    id: "task-3",
    title: "Update product documentation",
    description: "Add new features to the user guide and API docs",
    priority: "low",
    status: "completed",
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
  },
  {
    id: "task-4",
    title: "Prepare investor presentation",
    description: "Create deck for Series A pitch meeting",
    priority: "high",
    status: "pending",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    automation_count: 0,
    completed_automation_count: 0,
    is_asap: false,
  },
  {
    id: "task-5",
    title: "Customer feedback analysis",
    description: "Review all feedback from last month and identify trends",
    priority: "medium",
    status: "pending",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: false,
  },
];
