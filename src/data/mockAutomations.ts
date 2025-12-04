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

// Agent definitions matching mockAgents.ts
const agents = {
  marketingManager: {
    id: "mock-1",
    name: "Marketing Manager AI",
    description: "Full-stack marketing operator for ads, email, SEO, and reporting",
    capabilities: ["Paid Ads Management", "Email & CRM Automation", "Weekly Reporting", "Forecasting"]
  },
  productPricing: {
    id: "mock-2",
    name: "Product & Pricing Manager",
    description: "Controls product catalog, dynamic pricing, and demand forecasting",
    capabilities: ["Real-Time Dynamic Pricing Engine", "Competitor Price Scanning", "SKU-Level Profitability Analysis"]
  },
  customerService: {
    id: "mock-3",
    name: "Customer Service Manager",
    description: "Handles tickets, calls, refunds, returns, and sentiment analysis",
    capabilities: ["Omnichannel Support", "Instant Refunds & Returns", "Sentiment Analysis", "Churn Prediction"]
  },
  salesAssistant: {
    id: "mock-4",
    name: "Sales Assistant",
    description: "Automate lead qualification, follow-ups, and pipeline management",
    capabilities: ["Lead Scoring", "Email Outreach", "CRM Integration", "Pipeline Management"]
  },
  socialMedia: {
    id: "mock-5",
    name: "Social Media Manager",
    description: "Schedule posts, analyze engagement, and grow social presence",
    capabilities: ["Post Scheduling", "Analytics", "Hashtag Research", "Content Calendar"]
  },
  emailMarketing: {
    id: "mock-6",
    name: "Email Marketing Bot",
    description: "Create, send, and optimize email campaigns with AI personalization",
    capabilities: ["Campaign Builder", "A/B Testing", "Personalization", "Analytics"]
  },
  financeManager: {
    id: "mock-8",
    name: "Finance Manager",
    description: "Track expenses, generate reports, and manage invoices",
    capabilities: ["Expense Tracking", "Invoice Management", "Financial Reports", "Budget Planning"]
  },
  legalAssistant: {
    id: "mock-10",
    name: "Legal Assistant",
    description: "Draft contracts, review documents, and ensure compliance",
    capabilities: ["Contract Drafting", "Document Review", "Compliance Checking", "Legal Research"]
  },
  researchAssistant: {
    id: "mock-11",
    name: "Research Assistant",
    description: "Conduct market research, competitive analysis, and trend identification",
    capabilities: ["Market Research", "Competitive Analysis", "Trend Reports", "Data Gathering"]
  },
  devOpsHelper: {
    id: "mock-12",
    name: "DevOps Helper",
    description: "Automate deployments, monitor infrastructure, and manage CI/CD",
    capabilities: ["CI/CD Automation", "Infrastructure Monitoring", "Log Analysis", "Deployment"]
  }
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockAutomations: MockAutomation[] = [
  // ===== TR-001: January Flash Sale Campaign =====
  {
    id: "auto-001-1",
    name: "Create Flash Sale Email",
    action: "Design and build flash sale email with countdown timer and personalized product recommendations",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: hoursAgo(12),
    task_id: "tr-001",
    chain_order: 1,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },
  {
    id: "auto-001-2",
    name: "Launch Social Ad Campaign",
    action: "Deploy flash sale ads across Facebook, Instagram, and TikTok with urgency messaging",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(8),
    task_id: "tr-001",
    chain_order: 2,
    agent_id: "mock-5",
    next_run_at: null,
    schedule_type: null,
    agent: agents.socialMedia
  },
  {
    id: "auto-001-3",
    name: "Update Homepage Banner",
    action: "Deploy flash sale takeover banner with animated countdown",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(6),
    task_id: "tr-001",
    chain_order: 3,
    agent_id: "mock-1",
    next_run_at: null,
    schedule_type: null,
    agent: agents.marketingManager
  },
  {
    id: "auto-001-4",
    name: "Monitor Campaign Performance",
    action: "Track real-time sales, conversion rates, and ad spend - alert if performance dips",
    status: "active",
    trigger: "scheduled",
    progress: 60,
    last_run: null,
    task_id: "tr-001",
    chain_order: 4,
    agent_id: "mock-1",
    next_run_at: hoursAgo(-2),
    schedule_type: "hourly",
    agent: agents.marketingManager
  },
  {
    id: "auto-001-5",
    name: "Generate Post-Sale Report",
    action: "Compile comprehensive flash sale performance report with ROI analysis",
    status: "pending",
    trigger: "scheduled",
    progress: 0,
    last_run: null,
    task_id: "tr-001",
    chain_order: 5,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },

  // ===== TR-002: TikTok Influencer Partnership =====
  {
    id: "auto-002-1",
    name: "Research Influencer Profiles",
    action: "Analyze engagement rates, audience demographics, and brand fit for 20 potential influencers",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-002",
    chain_order: 1,
    agent_id: "mock-11",
    next_run_at: null,
    schedule_type: null,
    agent: agents.researchAssistant
  },
  {
    id: "auto-002-2",
    name: "Draft Outreach Messages",
    action: "Create personalized outreach messages for top 5 selected influencers",
    status: "active",
    trigger: "on_completion",
    progress: 40,
    last_run: null,
    task_id: "tr-002",
    chain_order: 2,
    agent_id: "mock-4",
    next_run_at: null,
    schedule_type: null,
    agent: agents.salesAssistant
  },
  {
    id: "auto-002-3",
    name: "Prepare Content Brief",
    action: "Create detailed content guidelines and talking points for unboxing videos",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-002",
    chain_order: 3,
    agent_id: "mock-1",
    next_run_at: null,
    schedule_type: null,
    agent: agents.marketingManager
  },
  {
    id: "auto-002-4",
    name: "Review & Approve Content",
    action: "Review submitted content for brand compliance before posting",
    status: "pending",
    trigger: "manual",
    progress: 0,
    last_run: null,
    task_id: "tr-002",
    chain_order: 4,
    agent_id: "mock-10",
    next_run_at: null,
    schedule_type: null,
    agent: agents.legalAssistant
  },

  // ===== TR-003: SEO Content Calendar Q1 =====
  {
    id: "auto-003-1",
    name: "Keyword Research Analysis",
    action: "Identify top 50 target keywords with search volume and competition analysis",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(5),
    task_id: "tr-003",
    chain_order: 1,
    agent_id: "mock-11",
    next_run_at: null,
    schedule_type: null,
    agent: agents.researchAssistant
  },
  {
    id: "auto-003-2",
    name: "Generate Content Outlines",
    action: "Create detailed outlines for 24 blog posts optimized for target keywords",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(3),
    task_id: "tr-003",
    chain_order: 2,
    agent_id: "mock-1",
    next_run_at: null,
    schedule_type: null,
    agent: agents.marketingManager
  },
  {
    id: "auto-003-3",
    name: "Schedule Publishing Calendar",
    action: "Map content to publishing schedule with optimal posting times",
    status: "active",
    trigger: "on_completion",
    progress: 75,
    last_run: null,
    task_id: "tr-003",
    chain_order: 3,
    agent_id: "mock-5",
    next_run_at: null,
    schedule_type: null,
    agent: agents.socialMedia
  },

  // ===== TR-004: Abandoned Cart Email Optimization =====
  {
    id: "auto-004-1",
    name: "Analyze Current Performance",
    action: "Pull abandoned cart email metrics - open rates, click rates, recovery rate",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-004",
    chain_order: 1,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },
  {
    id: "auto-004-2",
    name: "Create Test Variants",
    action: "Design 4 email variants with different subject lines and urgency messaging",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(18),
    task_id: "tr-004",
    chain_order: 2,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },
  {
    id: "auto-004-3",
    name: "Deploy A/B Test",
    action: "Launch A/B test with 25% traffic allocation per variant",
    status: "active",
    trigger: "on_completion",
    progress: 50,
    last_run: null,
    task_id: "tr-004",
    chain_order: 3,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },
  {
    id: "auto-004-4",
    name: "Analyze Results & Implement Winner",
    action: "Evaluate test results and deploy winning variant to full audience",
    status: "pending",
    trigger: "scheduled",
    progress: 0,
    last_run: null,
    task_id: "tr-004",
    chain_order: 4,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },

  // ===== TR-005: Samsung Galaxy S24 Catalog Setup =====
  {
    id: "auto-005-1",
    name: "Market Price Research",
    action: "Research competitor pricing for Galaxy S24 refurbished units across all storage variants",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(3),
    task_id: "tr-005",
    chain_order: 1,
    agent_id: "mock-11",
    next_run_at: null,
    schedule_type: null,
    agent: agents.researchAssistant
  },
  {
    id: "auto-005-2",
    name: "Set Pricing Tiers",
    action: "Define pricing by condition grade (A/B/C) and storage (128GB/256GB/512GB)",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-005",
    chain_order: 2,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-005-3",
    name: "Generate Product Descriptions",
    action: "Create SEO-optimized product descriptions for all S24 variants",
    status: "active",
    trigger: "on_completion",
    progress: 60,
    last_run: null,
    task_id: "tr-005",
    chain_order: 3,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-005-4",
    name: "Upload Product Listings",
    action: "Publish all Galaxy S24 listings to website and marketplaces",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-005",
    chain_order: 4,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-005-5",
    name: "Launch Announcement Email",
    action: "Send new product announcement to subscribers interested in Samsung devices",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-005",
    chain_order: 5,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },

  // ===== TR-006: Price Matching Competitor Audit (COMPLETED) =====
  {
    id: "auto-006-1",
    name: "Scrape Competitor Prices",
    action: "Extract current prices from Back Market, Decluttr, Amazon Renewed for top 50 SKUs",
    status: "completed",
    trigger: "scheduled",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-006",
    chain_order: 1,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: "weekly",
    agent: agents.productPricing
  },
  {
    id: "auto-006-2",
    name: "Generate Price Comparison Report",
    action: "Create detailed report highlighting price gaps and opportunities",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-006",
    chain_order: 2,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-006-3",
    name: "Apply Price Adjustments",
    action: "Automatically adjust prices on 12 SKUs to maintain competitiveness",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-006",
    chain_order: 3,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },

  // ===== TR-007: Trade-In Value Calculator Update =====
  {
    id: "auto-007-1",
    name: "Gather Market Value Data",
    action: "Research current resale values for iPhone 13/14/15 and Samsung S23 series",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(4),
    task_id: "tr-007",
    chain_order: 1,
    agent_id: "mock-11",
    next_run_at: null,
    schedule_type: null,
    agent: agents.researchAssistant
  },
  {
    id: "auto-007-2",
    name: "Update Pricing Algorithm",
    action: "Adjust trade-in value formulas based on new market data",
    status: "active",
    trigger: "on_completion",
    progress: 70,
    last_run: null,
    task_id: "tr-007",
    chain_order: 2,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-007-3",
    name: "Test Calculator Accuracy",
    action: "Validate updated values against competitor trade-in offers",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-007",
    chain_order: 3,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },

  // ===== TR-009: Holiday Return Wave Processing =====
  {
    id: "auto-009-1",
    name: "Sort Returns by Category",
    action: "Categorize 847 returns into refund, exchange, and restock queues",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-009",
    chain_order: 1,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-009-2",
    name: "Process Refund Requests",
    action: "Execute refunds for 234 non-restockable items",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(18),
    task_id: "tr-009",
    chain_order: 2,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-009-3",
    name: "Quality Inspect Restockables",
    action: "Grade returned devices for restock eligibility",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(8),
    task_id: "tr-009",
    chain_order: 3,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-009-4",
    name: "Update Inventory Records",
    action: "Add regraded units back to available inventory",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(4),
    task_id: "tr-009",
    chain_order: 4,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-009-5",
    name: "Send Customer Confirmations",
    action: "Email customers with return status updates and refund confirmations",
    status: "active",
    trigger: "on_completion",
    progress: 85,
    last_run: null,
    task_id: "tr-009",
    chain_order: 5,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-009-6",
    name: "Generate Returns Report",
    action: "Compile return rate analysis and reasons summary",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-009",
    chain_order: 6,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },

  // ===== TR-010: Trustpilot Review Response Campaign =====
  {
    id: "auto-010-1",
    name: "Categorize Pending Reviews",
    action: "Sort 67 reviews by sentiment and issue type",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-010",
    chain_order: 1,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-010-2",
    name: "Draft Response Templates",
    action: "Create personalized response drafts for each review category",
    status: "active",
    trigger: "on_completion",
    progress: 45,
    last_run: null,
    task_id: "tr-010",
    chain_order: 2,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-010-3",
    name: "Post Responses",
    action: "Publish approved responses to Trustpilot",
    status: "pending",
    trigger: "approval",
    progress: 0,
    last_run: null,
    task_id: "tr-010",
    chain_order: 3,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },

  // ===== TR-012: Warranty Claim Backlog Clear =====
  {
    id: "auto-012-1",
    name: "Triage Warranty Claims",
    action: "Sort 156 claims by device type, issue, and warranty status",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(3),
    task_id: "tr-012",
    chain_order: 1,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-012-2",
    name: "Run Remote Diagnostics",
    action: "Execute remote diagnostic checks on eligible devices",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-012",
    chain_order: 2,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-012-3",
    name: "Process Replacement Approvals",
    action: "Approve and process 89 replacement device shipments",
    status: "active",
    trigger: "on_completion",
    progress: 55,
    last_run: null,
    task_id: "tr-012",
    chain_order: 3,
    agent_id: "mock-3",
    next_run_at: null,
    schedule_type: null,
    agent: agents.customerService
  },
  {
    id: "auto-012-4",
    name: "Send Status Updates",
    action: "Email customers with claim resolution status",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-012",
    chain_order: 4,
    agent_id: "mock-6",
    next_run_at: null,
    schedule_type: null,
    agent: agents.emailMarketing
  },

  // ===== TR-013: December Revenue Reconciliation =====
  {
    id: "auto-013-1",
    name: "Pull Transaction Data",
    action: "Extract all December transactions from Stripe, PayPal, and Klarna",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-013",
    chain_order: 1,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-013-2",
    name: "Cross-Reference Orders",
    action: "Match payment transactions to order records and identify discrepancies",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-013",
    chain_order: 2,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-013-3",
    name: "Resolve Discrepancies",
    action: "Investigate and resolve 23 identified payment discrepancies",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: hoursAgo(12),
    task_id: "tr-013",
    chain_order: 3,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-013-4",
    name: "Generate Monthly Report",
    action: "Compile final December revenue report with YoY comparison",
    status: "active",
    trigger: "on_completion",
    progress: 80,
    last_run: null,
    task_id: "tr-013",
    chain_order: 4,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },

  // ===== TR-014: Q1 Marketing Budget Allocation =====
  {
    id: "auto-014-1",
    name: "Analyze Q4 Spend Efficiency",
    action: "Review Q4 marketing spend by channel and calculate ROI",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(4),
    task_id: "tr-014",
    chain_order: 1,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-014-2",
    name: "Model Budget Scenarios",
    action: "Create 3 budget allocation scenarios with projected ROI",
    status: "active",
    trigger: "on_completion",
    progress: 50,
    last_run: null,
    task_id: "tr-014",
    chain_order: 2,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-014-3",
    name: "Finalize Allocation",
    action: "Approve and document final Q1 budget allocation",
    status: "pending",
    trigger: "approval",
    progress: 0,
    last_run: null,
    task_id: "tr-014",
    chain_order: 3,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },

  // ===== TR-015: Supplier Invoice Processing =====
  {
    id: "auto-015-1",
    name: "Verify Invoice Details",
    action: "Cross-check 34 invoices against POs and delivery receipts",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(2),
    task_id: "tr-015",
    chain_order: 1,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-015-2",
    name: "Apply Early Payment Discounts",
    action: "Calculate and apply 2% early payment discounts where applicable",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(1),
    task_id: "tr-015",
    chain_order: 2,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },
  {
    id: "auto-015-3",
    name: "Schedule Payments",
    action: "Queue approved invoices for payment processing",
    status: "active",
    trigger: "on_completion",
    progress: 65,
    last_run: null,
    task_id: "tr-015",
    chain_order: 3,
    agent_id: "mock-8",
    next_run_at: null,
    schedule_type: null,
    agent: agents.financeManager
  },

  // ===== TR-016: Checkout Flow Redesign =====
  {
    id: "auto-016-1",
    name: "Audit Current Checkout",
    action: "Document current checkout flow and identify friction points",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(10),
    task_id: "tr-016",
    chain_order: 1,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-016-2",
    name: "Implement Apple Pay",
    action: "Integrate Apple Pay with Stripe Web Elements",
    status: "completed",
    trigger: "on_completion",
    progress: 100,
    last_run: daysAgo(5),
    task_id: "tr-016",
    chain_order: 2,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-016-3",
    name: "Implement Google Pay",
    action: "Add Google Pay integration alongside Apple Pay",
    status: "active",
    trigger: "on_completion",
    progress: 70,
    last_run: null,
    task_id: "tr-016",
    chain_order: 3,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-016-4",
    name: "Add Klarna Integration",
    action: "Implement Klarna buy-now-pay-later option at checkout",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-016",
    chain_order: 4,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-016-5",
    name: "A/B Test New Flow",
    action: "Run A/B test comparing 3-step vs 5-step checkout",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-016",
    chain_order: 5,
    agent_id: "mock-1",
    next_run_at: null,
    schedule_type: null,
    agent: agents.marketingManager
  },

  // ===== TR-017: Mobile App Push Notifications =====
  {
    id: "auto-017-1",
    name: "Configure Push Service",
    action: "Set up Firebase Cloud Messaging for iOS and Android",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(6),
    task_id: "tr-017",
    chain_order: 1,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-017-2",
    name: "Build Notification Triggers",
    action: "Create triggers for order updates, price drops, and back-in-stock alerts",
    status: "active",
    trigger: "on_completion",
    progress: 40,
    last_run: null,
    task_id: "tr-017",
    chain_order: 2,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },
  {
    id: "auto-017-3",
    name: "Design Notification UI",
    action: "Create notification templates with rich media support",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-017",
    chain_order: 3,
    agent_id: "mock-5",
    next_run_at: null,
    schedule_type: null,
    agent: agents.socialMedia
  },
  {
    id: "auto-017-4",
    name: "Test & Deploy",
    action: "Run QA tests and deploy to app stores",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-017",
    chain_order: 4,
    agent_id: "mock-12",
    next_run_at: null,
    schedule_type: null,
    agent: agents.devOpsHelper
  },

  // ===== TR-020: Product Photography Sprint =====
  {
    id: "auto-020-1",
    name: "Prepare Shot List",
    action: "Create detailed shot list for 120 SKUs with required angles",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(3),
    task_id: "tr-020",
    chain_order: 1,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },
  {
    id: "auto-020-2",
    name: "Process & Edit Images",
    action: "Post-process photos - color correction, background removal, optimization",
    status: "active",
    trigger: "manual",
    progress: 25,
    last_run: null,
    task_id: "tr-020",
    chain_order: 2,
    agent_id: "mock-5",
    next_run_at: null,
    schedule_type: null,
    agent: agents.socialMedia
  },
  {
    id: "auto-020-3",
    name: "Upload to Asset Library",
    action: "Upload processed images and link to product listings",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-020",
    chain_order: 3,
    agent_id: "mock-2",
    next_run_at: null,
    schedule_type: null,
    agent: agents.productPricing
  },

  // ===== TR-023: Privacy Policy Update =====
  {
    id: "auto-023-1",
    name: "Audit Current Policy",
    action: "Review current privacy policy against new requirements",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(4),
    task_id: "tr-023",
    chain_order: 1,
    agent_id: "mock-10",
    next_run_at: null,
    schedule_type: null,
    agent: agents.legalAssistant
  },
  {
    id: "auto-023-2",
    name: "Draft Policy Updates",
    action: "Write new sections for marketing cookies, Klarna, and data retention",
    status: "active",
    trigger: "on_completion",
    progress: 60,
    last_run: null,
    task_id: "tr-023",
    chain_order: 2,
    agent_id: "mock-10",
    next_run_at: null,
    schedule_type: null,
    agent: agents.legalAssistant
  },

  // ===== TR-024: New Supplier Due Diligence =====
  {
    id: "auto-024-1",
    name: "Run Background Checks",
    action: "Conduct business verification and credit checks on 3 suppliers",
    status: "completed",
    trigger: "manual",
    progress: 100,
    last_run: daysAgo(7),
    task_id: "tr-024",
    chain_order: 1,
    agent_id: "mock-11",
    next_run_at: null,
    schedule_type: null,
    agent: agents.researchAssistant
  },
  {
    id: "auto-024-2",
    name: "Review Quality Certifications",
    action: "Verify ISO certifications and quality assurance processes",
    status: "active",
    trigger: "on_completion",
    progress: 35,
    last_run: null,
    task_id: "tr-024",
    chain_order: 2,
    agent_id: "mock-10",
    next_run_at: null,
    schedule_type: null,
    agent: agents.legalAssistant
  },
  {
    id: "auto-024-3",
    name: "Draft Supplier Contracts",
    action: "Prepare contract templates with payment terms and liability clauses",
    status: "pending",
    trigger: "on_completion",
    progress: 0,
    last_run: null,
    task_id: "tr-024",
    chain_order: 3,
    agent_id: "mock-10",
    next_run_at: null,
    schedule_type: null,
    agent: agents.legalAssistant
  },
];

// Helper functions
export const getAutomationsByTaskId = (taskId: string) => 
  mockAutomations.filter(auto => auto.task_id === taskId);

export const getAutomationsByAgent = (agentId: string) => 
  mockAutomations.filter(auto => auto.agent_id === agentId);

export const getActiveAutomations = () => 
  mockAutomations.filter(auto => auto.status === 'active');

export const getPendingAutomations = () => 
  mockAutomations.filter(auto => auto.status === 'pending');

export const getCompletedAutomations = () => 
  mockAutomations.filter(auto => auto.status === 'completed');
