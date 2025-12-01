export interface MockActivityLog {
  id: string;
  action: string;
  entity_type: string;
  status: string;
  created_at: string;
  metadata: {
    tool_name: string;
    execution_time_ms: number;
    description: string;
    error_message?: string;
  };
  agent?: {
    name: string;
    image_url: string;
  };
}

const getRecentTime = (minutesAgo: number) => {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
};

export const mockActivityLogs: MockActivityLog[] = [
  {
    id: "log-1",
    action: "send_email",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(5),
    metadata: {
      tool_name: "Gmail Send",
      execution_time_ms: 1240,
      description: "Sent follow-up email to 15 leads from webinar",
    },
    agent: {
      name: "Customer Support Pro",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-2",
    action: "create_document",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(15),
    metadata: {
      tool_name: "Google Docs Create",
      execution_time_ms: 890,
      description: "Created Q4 marketing report template",
    },
    agent: {
      name: "Content Creator AI",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-3",
    action: "analyze_data",
    entity_type: "task",
    status: "failed",
    created_at: getRecentTime(30),
    metadata: {
      tool_name: "Data Analysis",
      execution_time_ms: 5600,
      description: "Failed to analyze customer feedback data",
      error_message: "Invalid data format in uploaded CSV file",
    },
    agent: {
      name: "Data Analyst Pro",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-4",
    action: "schedule_meeting",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(45),
    metadata: {
      tool_name: "Calendly Schedule",
      execution_time_ms: 670,
      description: "Scheduled demo call with Enterprise prospect",
    },
    agent: {
      name: "Sales Assistant",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-5",
    action: "post_social_media",
    entity_type: "automation",
    status: "pending",
    created_at: getRecentTime(60),
    metadata: {
      tool_name: "Social Media Manager",
      execution_time_ms: 0,
      description: "Scheduled post for LinkedIn - Product update announcement",
    },
    agent: {
      name: "Social Media Manager",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-6",
    action: "generate_report",
    entity_type: "task",
    status: "success",
    created_at: getRecentTime(90),
    metadata: {
      tool_name: "Report Generator",
      execution_time_ms: 3450,
      description: "Generated weekly performance analytics report",
    },
    agent: {
      name: "Data Analyst Pro",
      image_url: "/elixa-logo.png",
    },
  },
  {
    id: "log-7",
    action: "send_notification",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(120),
    metadata: {
      tool_name: "Slack Notification",
      execution_time_ms: 320,
      description: "Notified team about new customer signup",
    },
    agent: {
      name: "Customer Support Pro",
      image_url: "/elixa-logo.png",
    },
  },
];
