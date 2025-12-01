export interface ExecutionStep {
  name: string;
  duration_ms: number;
  status: string;
  timestamp?: string;
}

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
  trigger_source: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  steps?: ExecutionStep[];
  related_entities?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
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
    trigger_source: "Scheduled automation",
    input_data: {
      recipients: "15 webinar attendees",
      subject: "Thanks for attending our product demo!",
      template: "webinar_followup_v2",
      from: "support@company.com",
    },
    output_data: {
      emails_sent: 15,
      emails_delivered: 15,
      emails_opened: 8,
      bounce_rate: "0%",
      click_rate: "34%",
    },
    steps: [
      { name: "Fetching recipient list from CRM", duration_ms: 120, status: "success" },
      { name: "Loading email template", duration_ms: 45, status: "success" },
      { name: "Personalizing content for each recipient", duration_ms: 340, status: "success" },
      { name: "Sending via Gmail API", duration_ms: 735, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-123", name: "Webinar Follow-up Campaign" },
      { type: "task", id: "task-456", name: "Post-webinar outreach" },
    ],
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
    trigger_source: "User request",
    input_data: {
      document_title: "Q4 2024 Marketing Performance Report",
      template_type: "marketing_report",
      sections: ["Executive Summary", "Campaign Performance", "ROI Analysis", "Recommendations"],
      folder: "Reports/2024/Q4",
    },
    output_data: {
      document_id: "1A2B3C4D5E6F",
      document_url: "https://docs.google.com/document/d/1A2B3C4D5E6F",
      pages: 12,
      word_count: 2847,
      shared_with: ["marketing@company.com", "executives@company.com"],
    },
    steps: [
      { name: "Creating new Google Doc", duration_ms: 180, status: "success" },
      { name: "Applying template structure", duration_ms: 95, status: "success" },
      { name: "Generating content sections", duration_ms: 450, status: "success" },
      { name: "Formatting and styling", duration_ms: 165, status: "success" },
    ],
    related_entities: [
      { type: "task", id: "task-789", name: "Q4 Marketing Review" },
    ],
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
      error_message: "Invalid data format in uploaded CSV file. Expected columns: 'date', 'customer_id', 'rating', 'feedback' but received: 'Date', 'CustomerID', 'Score', 'Comments'",
    },
    agent: {
      name: "Data Analyst Pro",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "Manual task",
    input_data: {
      file_name: "customer_feedback_nov.csv",
      file_size: "2.4 MB",
      rows_expected: 1247,
      analysis_type: "sentiment_analysis",
    },
    output_data: {
      rows_processed: 0,
      errors_found: 4,
      error_details: "Column name mismatch",
    },
    steps: [
      { name: "Loading CSV file", duration_ms: 1200, status: "success" },
      { name: "Validating data structure", duration_ms: 450, status: "failed" },
      { name: "Parsing rows", duration_ms: 0, status: "skipped" },
      { name: "Running sentiment analysis", duration_ms: 0, status: "skipped" },
    ],
    related_entities: [
      { type: "task", id: "task-991", name: "Monthly Feedback Analysis" },
      { type: "document", id: "doc-445", name: "customer_feedback_nov.csv" },
    ],
  },
  {
    id: "log-4",
    action: "schedule_meeting",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(45),
    metadata: {
      tool_name: "Google Calendar",
      execution_time_ms: 670,
      description: "Scheduled demo call with Enterprise prospect",
    },
    agent: {
      name: "Sales Assistant",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "Webhook from CRM",
    input_data: {
      prospect_name: "Acme Corp - Sarah Johnson",
      prospect_email: "sarah.johnson@acmecorp.com",
      meeting_type: "Enterprise Demo",
      duration: "45 minutes",
      preferred_times: ["Dec 15 2-3pm", "Dec 16 10-11am"],
    },
    output_data: {
      meeting_scheduled: true,
      meeting_time: "December 15, 2024 at 2:00 PM EST",
      calendar_link: "https://calendar.google.com/event/abc123",
      zoom_link: "https://zoom.us/j/9876543210",
      attendees: ["sarah.johnson@acmecorp.com", "sales@company.com"],
    },
    steps: [
      { name: "Checking calendar availability", duration_ms: 180, status: "success" },
      { name: "Creating calendar event", duration_ms: 245, status: "success" },
      { name: "Generating Zoom meeting", duration_ms: 155, status: "success" },
      { name: "Sending confirmation email", duration_ms: 90, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-567", name: "Enterprise Lead Scheduling" },
    ],
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
    trigger_source: "Scheduled automation",
    input_data: {
      platform: "LinkedIn",
      post_type: "announcement",
      content: "🚀 Exciting news! We've just launched our new AI-powered analytics dashboard...",
      scheduled_time: "December 12, 2024 at 9:00 AM EST",
      media: ["product_screenshot.png", "feature_demo.gif"],
      hashtags: ["#ProductUpdate", "#AIAnalytics", "#TechInnovation"],
    },
    output_data: {
      status: "Scheduled",
      post_id: "pending",
      scheduled_for: "December 12, 2024 at 9:00 AM EST",
      estimated_reach: "2,500-3,000 impressions",
    },
    steps: [
      { name: "Validating content and media", duration_ms: 0, status: "pending" },
      { name: "Scheduling post", duration_ms: 0, status: "pending" },
    ],
    related_entities: [
      { type: "automation", id: "auto-890", name: "Product Launch Campaign" },
    ],
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
    trigger_source: "Scheduled automation",
    input_data: {
      report_type: "weekly_performance",
      date_range: "Dec 1-7, 2024",
      metrics: ["revenue", "conversions", "user_engagement", "churn_rate"],
      format: "PDF with interactive charts",
    },
    output_data: {
      report_generated: true,
      file_name: "Weekly_Performance_Dec_1-7.pdf",
      file_size: "4.2 MB",
      pages: 18,
      charts_included: 12,
      key_insights: [
        "Revenue up 23% vs previous week",
        "Conversion rate improved to 3.8%",
        "User engagement increased 15%",
      ],
    },
    steps: [
      { name: "Collecting data from analytics", duration_ms: 1240, status: "success" },
      { name: "Processing metrics and calculations", duration_ms: 890, status: "success" },
      { name: "Generating visualizations", duration_ms: 765, status: "success" },
      { name: "Creating PDF report", duration_ms: 555, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-234", name: "Weekly Reports" },
    ],
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
    trigger_source: "Webhook from signup form",
    input_data: {
      customer_name: "TechStart Inc",
      plan: "Enterprise",
      team_size: 45,
      channel: "#new-customers",
      message_template: "new_enterprise_signup",
    },
    output_data: {
      notification_sent: true,
      channel: "#new-customers",
      message_id: "msg_abc123",
      reactions: ["🎉", "🚀", "👏"],
      thread_replies: 3,
    },
    steps: [
      { name: "Formatting notification message", duration_ms: 45, status: "success" },
      { name: "Sending to Slack API", duration_ms: 185, status: "success" },
      { name: "Creating CRM entry", duration_ms: 90, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-678", name: "New Customer Onboarding" },
    ],
  },
  {
    id: "log-8",
    action: "update_crm",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(150),
    metadata: {
      tool_name: "Notion Database",
      execution_time_ms: 1120,
      description: "Updated 24 customer records with engagement scores",
    },
    agent: {
      name: "Sales Assistant",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "Scheduled automation",
    input_data: {
      database: "Customer CRM",
      records_to_update: 24,
      fields: ["engagement_score", "last_interaction", "status"],
      calculation_method: "weighted_activity_score",
    },
    output_data: {
      records_updated: 24,
      records_failed: 0,
      average_score_change: "+12%",
      high_priority_alerts: 3,
    },
    steps: [
      { name: "Fetching customer activity data", duration_ms: 340, status: "success" },
      { name: "Calculating engagement scores", duration_ms: 450, status: "success" },
      { name: "Updating Notion database", duration_ms: 330, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-445", name: "Daily CRM Sync" },
    ],
  },
  {
    id: "log-9",
    action: "generate_invoice",
    entity_type: "task",
    status: "success",
    created_at: getRecentTime(180),
    metadata: {
      tool_name: "Invoice Generator",
      execution_time_ms: 890,
      description: "Generated invoice #INV-2024-1247 for Project Alpha",
    },
    agent: {
      name: "Finance Assistant",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "Manual task",
    input_data: {
      client: "Acme Corp",
      project: "Project Alpha - Q4 Consulting",
      amount: "$24,500.00",
      items: [
        "Strategy Consulting - 40 hours @ $350/hr",
        "Implementation Support - 25 hours @ $300/hr",
      ],
      due_date: "December 31, 2024",
    },
    output_data: {
      invoice_number: "INV-2024-1247",
      pdf_generated: true,
      file_path: "/invoices/2024/INV-2024-1247.pdf",
      email_sent: true,
      payment_link: "https://pay.company.com/inv/1247",
    },
    steps: [
      { name: "Validating project data", duration_ms: 120, status: "success" },
      { name: "Generating invoice PDF", duration_ms: 340, status: "success" },
      { name: "Sending email to client", duration_ms: 280, status: "success" },
      { name: "Creating payment link", duration_ms: 150, status: "success" },
    ],
    related_entities: [
      { type: "task", id: "task-112", name: "Q4 Billing" },
    ],
  },
  {
    id: "log-10",
    action: "research_competitor",
    entity_type: "task",
    status: "success",
    created_at: getRecentTime(210),
    metadata: {
      tool_name: "Web Research",
      execution_time_ms: 8750,
      description: "Completed competitive analysis on 5 market competitors",
    },
    agent: {
      name: "Market Research AI",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "User request",
    input_data: {
      competitors: ["CompanyA", "CompanyB", "CompanyC", "CompanyD", "CompanyE"],
      research_areas: ["pricing", "features", "market_positioning", "customer_reviews"],
      sources: ["company_websites", "g2_crowd", "capterra", "linkedin"],
    },
    output_data: {
      report_generated: true,
      insights_found: 47,
      pricing_comparisons: 5,
      feature_matrix_created: true,
      key_differentiators: [
        "We offer 2x more integrations than average",
        "Our pricing is 30% lower for SMB segment",
        "Highest G2 rating in category (4.8/5)",
      ],
    },
    steps: [
      { name: "Scraping competitor websites", duration_ms: 3200, status: "success" },
      { name: "Analyzing review platforms", duration_ms: 2450, status: "success" },
      { name: "Extracting pricing data", duration_ms: 1800, status: "success" },
      { name: "Generating comparison report", duration_ms: 1300, status: "success" },
    ],
    related_entities: [
      { type: "task", id: "task-667", name: "Q4 Market Analysis" },
    ],
  },
  {
    id: "log-11",
    action: "organize_files",
    entity_type: "automation",
    status: "success",
    created_at: getRecentTime(240),
    metadata: {
      tool_name: "Google Drive",
      execution_time_ms: 2340,
      description: "Organized 156 files into folders by project and date",
    },
    agent: {
      name: "Admin Assistant",
      image_url: "/elixa-logo.png",
    },
    trigger_source: "Scheduled automation",
    input_data: {
      source_folder: "Unorganized Files",
      files_count: 156,
      organization_rules: [
        "Group by project name",
        "Sort by creation date",
        "Move PDFs to Archive/2024",
      ],
    },
    output_data: {
      files_organized: 156,
      folders_created: 12,
      duplicates_found: 8,
      duplicates_archived: 8,
      space_saved: "245 MB",
    },
    steps: [
      { name: "Scanning source folder", duration_ms: 450, status: "success" },
      { name: "Analyzing file metadata", duration_ms: 780, status: "success" },
      { name: "Creating folder structure", duration_ms: 220, status: "success" },
      { name: "Moving files to destinations", duration_ms: 890, status: "success" },
    ],
    related_entities: [
      { type: "automation", id: "auto-889", name: "Weekly File Cleanup" },
    ],
  },
];
