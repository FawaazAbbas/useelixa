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
  category?: string;
  assigned_team?: string;
}

// Helper to create dates relative to now
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockTasks: MockTask[] = [
  // ===== MARKETING TASKS =====
  {
    id: "task-1",
    title: "Q1 2025 Marketing Strategy Review",
    description: "Analyze Q4 2024 performance metrics and prepare comprehensive marketing strategy recommendations for Q1 2025 including paid ads, email campaigns, and social media",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(3),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: true,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "task-2",
    title: "Black Friday Campaign Post-Mortem",
    description: "Complete analysis of Black Friday 2024 campaign performance - ROI breakdown, channel effectiveness, and lessons learned for future campaigns",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(2),
    completed_at: daysAgo(1),
    created_at: daysAgo(10),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "task-3",
    title: "Valentine's Day Campaign Launch",
    description: "Plan and execute Valentine's Day promotion for refurbished devices - couples bundles, gift cards, and 'Tech Love' messaging across all channels",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(45),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 6,
    completed_automation_count: 1,
    is_asap: false,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "task-4",
    title: "Email Subscriber Re-engagement Campaign",
    description: "Launch win-back campaign for 12,000 dormant subscribers who haven't opened emails in 90+ days",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(7),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 5,
    completed_automation_count: 3,
    is_asap: false,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "task-5",
    title: "Google Ads Optimization Sprint",
    description: "Reduce CPA by 15% through keyword refinement, negative keyword expansion, and ad copy A/B testing",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: true,
    category: "Marketing",
    assigned_team: "Marketing"
  },

  // ===== PRODUCT & MERCHANDISING TASKS =====
  {
    id: "task-6",
    title: "iPhone 16 Refurb Launch Preparation",
    description: "Prepare catalog, pricing strategy, and quality standards for upcoming iPhone 16 refurbished units expected from trade-in surge",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(14),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 5,
    completed_automation_count: 1,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-7",
    title: "Q4 Slow-Mover Liquidation",
    description: "Clear 847 slow-moving SKUs (Galaxy S21, iPhone 12 mini variants) with strategic markdowns before year-end inventory count",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(6),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: true,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-8",
    title: "Competitor Price Audit - December",
    description: "Complete monthly competitor price analysis across Back Market, Decluttr, and Gazelle for top 100 SKUs",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(1),
    completed_at: daysAgo(1),
    created_at: daysAgo(8),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-9",
    title: "Bundle Strategy Optimization",
    description: "Analyze bundle performance data and create new high-margin bundle combinations for Q1 (phone + case + charger packs)",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(12),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 3,
    completed_automation_count: 0,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-10",
    title: "Grade Consistency Audit",
    description: "Review 500 random units from grading team to ensure A/B/C grade accuracy meets 98% standard",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(4),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 2,
    completed_automation_count: 1,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },

  // ===== CUSTOMER SERVICE TASKS =====
  {
    id: "task-11",
    title: "Holiday Support Surge Response Plan",
    description: "Implement emergency protocols for 340% ticket volume increase during holiday returns period",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(2),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 5,
    completed_automation_count: 3,
    is_asap: true,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "task-12",
    title: "Return Rate Root Cause Analysis",
    description: "Investigate 23% return rate on Galaxy S22 Ultra units - battery health complaints vs. grading accuracy issues",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(6),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "task-13",
    title: "Chatbot Training Update",
    description: "Update AI chatbot with new holiday return policies, extended warranty FAQs, and iPhone 15 troubleshooting guides",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(3),
    completed_at: daysAgo(2),
    created_at: daysAgo(12),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "task-14",
    title: "VIP Customer Retention Outreach",
    description: "Personal outreach to 156 high-value customers ($5000+ lifetime value) with exclusive loyalty offers",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(8),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "task-15",
    title: "Negative Review Response Campaign",
    description: "Address 47 unresolved negative Trustpilot reviews from November with personalized resolution offers",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },

  // ===== FINANCE TASKS =====
  {
    id: "task-16",
    title: "Q4 2024 Revenue Report",
    description: "Compile comprehensive Q4 financial report including revenue, margins, CAC, LTV, and YoY growth analysis",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(15),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 5,
    completed_automation_count: 2,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "task-17",
    title: "Supplier Payment Processing",
    description: "Process outstanding supplier invoices totaling £247,000 before year-end close",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(3),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 3,
    completed_automation_count: 2,
    is_asap: true,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "task-18",
    title: "2025 Budget Planning",
    description: "Finalize departmental budgets for 2025 fiscal year - marketing, ops, tech, and headcount projections",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(20),
    completed_at: null,
    created_at: daysAgo(10),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "task-19",
    title: "VAT Return Preparation",
    description: "Prepare and submit Q4 VAT return - £127,000 estimated reclaim",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(5),
    completed_at: daysAgo(4),
    created_at: daysAgo(20),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "task-20",
    title: "Refund Processing Audit",
    description: "Audit November refund transactions for accuracy and fraud detection - £89,000 in refunds issued",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(7),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },

  // ===== DEVELOPMENT TASKS =====
  {
    id: "task-21",
    title: "Payment Gateway Migration",
    description: "Complete migration from Stripe v2 to v3 API with improved 3D Secure support and Apple Pay integration",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(21),
    completed_at: null,
    created_at: daysAgo(14),
    automation_count: 6,
    completed_automation_count: 3,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "task-22",
    title: "Mobile App Performance Optimization",
    description: "Reduce app load time by 40% and fix memory leaks causing crashes on older iOS devices",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: true,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "task-23",
    title: "Search Algorithm Enhancement",
    description: "Implement ML-powered search with typo tolerance, synonym matching, and personalized ranking",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(30),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 5,
    completed_automation_count: 1,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "task-24",
    title: "Security Patch Deployment",
    description: "Deploy critical security patches for Node.js dependencies with known vulnerabilities",
    priority: "high",
    status: "completed",
    due_date: daysAgo(1),
    completed_at: daysAgo(1),
    created_at: daysAgo(4),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "task-25",
    title: "Inventory API Integration",
    description: "Build real-time inventory sync API with warehouse management system for accurate stock levels",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(18),
    completed_at: null,
    created_at: daysAgo(8),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },

  // ===== CREATIVE TASKS =====
  {
    id: "task-26",
    title: "New Year Campaign Creative Assets",
    description: "Design complete creative package for New Year sale - banners, social ads, email templates, and landing pages",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(4),
    completed_at: null,
    created_at: daysAgo(6),
    automation_count: 5,
    completed_automation_count: 3,
    is_asap: true,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "task-27",
    title: "Product Photography Refresh",
    description: "Re-shoot top 50 SKUs with improved lighting and lifestyle context for Q1 catalog update",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(14),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 3,
    completed_automation_count: 0,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "task-28",
    title: "Brand Guidelines Update",
    description: "Update brand style guide with new color palette, typography rules, and sustainability messaging guidelines",
    priority: "low",
    status: "pending",
    due_date: daysFromNow(25),
    completed_at: null,
    created_at: daysAgo(10),
    automation_count: 2,
    completed_automation_count: 0,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "task-29",
    title: "Video Content Production",
    description: "Produce 5 product showcase videos and 3 customer testimonial clips for social media and YouTube",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(21),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "task-30",
    title: "Email Template Redesign",
    description: "Modernize transactional email templates (order confirmation, shipping, delivery) with new brand elements",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(2),
    completed_at: daysAgo(1),
    created_at: daysAgo(15),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },

  // ===== LEGAL & RISK TASKS =====
  {
    id: "task-31",
    title: "GDPR Compliance Audit",
    description: "Annual GDPR compliance review - data retention policies, consent mechanisms, and third-party data sharing",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(30),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "task-32",
    title: "Supplier Contract Renewals",
    description: "Review and negotiate 7 supplier contracts expiring Q1 2025 - focus on payment terms and liability clauses",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(45),
    completed_at: null,
    created_at: daysAgo(14),
    automation_count: 3,
    completed_automation_count: 0,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "task-33",
    title: "Return Policy Update",
    description: "Draft updated return policy for 2025 - align with new consumer protection regulations and reduce fraud loopholes",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(12),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 2,
    completed_automation_count: 1,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "task-34",
    title: "Insurance Policy Review",
    description: "Annual review of business insurance - product liability, cyber security, and business interruption coverage",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(3),
    completed_at: daysAgo(2),
    created_at: daysAgo(20),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "task-35",
    title: "Counterfeit Parts Investigation",
    description: "Investigate suspected counterfeit battery supplier - 3 customer complaints about non-OEM parts in Grade A units",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: true,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },

  // ===== CROSS-FUNCTIONAL TASKS =====
  {
    id: "task-36",
    title: "Sustainability Report 2024",
    description: "Compile annual sustainability report - devices refurbished, e-waste diverted, carbon footprint reduction metrics",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(35),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 4,
    completed_automation_count: 0,
    is_asap: false,
    category: "Operations",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-37",
    title: "Employee Training Program",
    description: "Roll out new product grading certification program for warehouse team - 45 employees",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(28),
    completed_at: null,
    created_at: daysAgo(12),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "HR",
    assigned_team: "Customer Service"
  },
  {
    id: "task-38",
    title: "Warehouse Capacity Planning",
    description: "Assess warehouse capacity for Q1 2025 inventory surge - may need temporary overflow space",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(8),
    automation_count: 3,
    completed_automation_count: 2,
    is_asap: false,
    category: "Operations",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "task-39",
    title: "Customer Feedback Analysis Q4",
    description: "Analyze 2,340 customer feedback submissions from Q4 - identify top 10 improvement opportunities",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(8),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "task-40",
    title: "Partnership Outreach - Carrier Deals",
    description: "Initiate partnership discussions with O2 and Vodafone for certified refurbished device programs",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(60),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 5,
    completed_automation_count: 1,
    is_asap: false,
    category: "Sales",
    assigned_team: "Marketing"
  },
];

// Helper functions
export const getTasksByStatus = (status: string) => 
  mockTasks.filter(task => task.status === status);

export const getTasksByPriority = (priority: string) => 
  mockTasks.filter(task => task.priority === priority);

export const getTasksByCategory = (category: string) => 
  mockTasks.filter(task => task.category === category);

export const getOverdueTasks = () => 
  mockTasks.filter(task => 
    task.status !== 'completed' && 
    task.due_date && 
    new Date(task.due_date) < new Date()
  );

export const getAsapTasks = () => 
  mockTasks.filter(task => task.is_asap && task.status !== 'completed');
