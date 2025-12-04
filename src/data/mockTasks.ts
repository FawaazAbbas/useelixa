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
  // ===== MARKETING =====
  {
    id: "tr-001",
    title: "January Flash Sale Campaign",
    description: "Launch 48-hour flash sale on certified refurbished iPhones with 20% discount - email blast, social ads, and homepage takeover",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(2),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 5,
    completed_automation_count: 3,
    is_asap: true,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "tr-002",
    title: "TikTok Influencer Partnership",
    description: "Coordinate with 5 tech influencers for unboxing videos of Grade A refurbished devices - content review and posting schedule",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(14),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "tr-003",
    title: "SEO Content Calendar Q1",
    description: "Plan and schedule 24 blog posts targeting 'refurbished phone' keywords - topics include buying guides, comparison articles, and sustainability content",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 3,
    completed_automation_count: 2,
    is_asap: false,
    category: "Marketing",
    assigned_team: "Marketing"
  },
  {
    id: "tr-004",
    title: "Abandoned Cart Email Optimization",
    description: "A/B test new abandoned cart email sequence with urgency messaging and personalized product recommendations",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: true,
    category: "Marketing",
    assigned_team: "Marketing"
  },

  // ===== PRODUCT & INVENTORY =====
  {
    id: "tr-005",
    title: "Samsung Galaxy S24 Catalog Setup",
    description: "Create product listings for incoming Galaxy S24 refurbished units - photography, descriptions, pricing tiers by condition grade",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(7),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 5,
    completed_automation_count: 2,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "tr-006",
    title: "Price Matching Competitor Audit",
    description: "Weekly competitive price check against Back Market, Decluttr, and Amazon Renewed for top 50 SKUs",
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
    id: "tr-007",
    title: "Trade-In Value Calculator Update",
    description: "Refresh trade-in pricing algorithm with current market values for iPhone 13/14/15 series and Samsung S23 lineup",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(4),
    completed_at: null,
    created_at: daysAgo(6),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: true,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },
  {
    id: "tr-008",
    title: "Accessory Bundle Strategy",
    description: "Design 5 new accessory bundles (case + charger + screen protector) to upsell with phone purchases - margin analysis and pricing",
    priority: "low",
    status: "pending",
    due_date: daysFromNow(21),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 2,
    completed_automation_count: 0,
    is_asap: false,
    category: "Product",
    assigned_team: "Product & Merchandising"
  },

  // ===== CUSTOMER SERVICE =====
  {
    id: "tr-009",
    title: "Holiday Return Wave Processing",
    description: "Process 847 holiday returns - inspect, regrade, and restock eligible units; process refunds for non-restockable items",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(3),
    completed_at: null,
    created_at: daysAgo(2),
    automation_count: 6,
    completed_automation_count: 4,
    is_asap: true,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "tr-010",
    title: "Trustpilot Review Response Campaign",
    description: "Respond to 67 pending Trustpilot reviews - personalized responses for negative reviews with resolution offers",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(6),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "tr-011",
    title: "Support Chatbot Knowledge Update",
    description: "Update AI chatbot with new FAQ content for iPhone 15 troubleshooting, warranty claims process, and January promotions",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(2),
    completed_at: daysAgo(1),
    created_at: daysAgo(10),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },
  {
    id: "tr-012",
    title: "Warranty Claim Backlog Clear",
    description: "Process 156 pending warranty claims from December - device diagnostics, replacement approvals, and customer communications",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(5),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 4,
    completed_automation_count: 2,
    is_asap: false,
    category: "Customer Service",
    assigned_team: "Customer Service"
  },

  // ===== FINANCE =====
  {
    id: "tr-013",
    title: "December Revenue Reconciliation",
    description: "Reconcile all December transactions across Stripe, PayPal, and Klarna - identify discrepancies and generate final monthly report",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(4),
    completed_at: null,
    created_at: daysAgo(3),
    automation_count: 4,
    completed_automation_count: 3,
    is_asap: true,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "tr-014",
    title: "Q1 Marketing Budget Allocation",
    description: "Finalize Q1 marketing spend allocation across Google Ads, Meta, TikTok, and influencer partnerships - £450K total budget",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(8),
    completed_at: null,
    created_at: daysAgo(6),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },
  {
    id: "tr-015",
    title: "Supplier Invoice Processing",
    description: "Process and schedule payment for 34 supplier invoices totaling £189,000 - verify delivery receipts and apply early payment discounts",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(6),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 3,
    completed_automation_count: 2,
    is_asap: false,
    category: "Finance",
    assigned_team: "Finance"
  },

  // ===== DEVELOPMENT =====
  {
    id: "tr-016",
    title: "Checkout Flow Redesign",
    description: "Implement new streamlined checkout with Apple Pay, Google Pay, and Klarna integration - reduce checkout steps from 5 to 3",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(18),
    completed_at: null,
    created_at: daysAgo(12),
    automation_count: 5,
    completed_automation_count: 2,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "tr-017",
    title: "Mobile App Push Notifications",
    description: "Implement personalized push notification system for order updates, price drops, and back-in-stock alerts",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(14),
    completed_at: null,
    created_at: daysAgo(8),
    automation_count: 4,
    completed_automation_count: 1,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "tr-018",
    title: "Security Vulnerability Patch",
    description: "Apply critical security patches for identified XSS vulnerability in product review submission form",
    priority: "high",
    status: "completed",
    due_date: daysAgo(1),
    completed_at: daysAgo(1),
    created_at: daysAgo(3),
    automation_count: 3,
    completed_automation_count: 3,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },
  {
    id: "tr-019",
    title: "Product Search Enhancement",
    description: "Implement fuzzy search, auto-complete suggestions, and search analytics tracking for improved product discovery",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(25),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 4,
    completed_automation_count: 0,
    is_asap: false,
    category: "Development",
    assigned_team: "Development"
  },

  // ===== CREATIVE =====
  {
    id: "tr-020",
    title: "Product Photography Sprint",
    description: "Photograph 120 new SKUs for catalog - lifestyle shots, 360-degree views, and detail close-ups for each device",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(12),
    completed_at: null,
    created_at: daysAgo(4),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "tr-021",
    title: "Video Testimonial Production",
    description: "Produce 6 customer testimonial videos for website and social proof - filming, editing, and captioning",
    priority: "low",
    status: "pending",
    due_date: daysFromNow(30),
    completed_at: null,
    created_at: daysAgo(7),
    automation_count: 2,
    completed_automation_count: 0,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },
  {
    id: "tr-022",
    title: "Email Template Refresh",
    description: "Redesign transactional email templates (order confirmation, shipping, delivery) with updated branding and mobile optimization",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(3),
    completed_at: daysAgo(2),
    created_at: daysAgo(14),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
    category: "Creative",
    assigned_team: "Creative"
  },

  // ===== LEGAL & COMPLIANCE =====
  {
    id: "tr-023",
    title: "Privacy Policy Update",
    description: "Update privacy policy for new marketing cookies, Klarna data sharing, and updated data retention periods",
    priority: "high",
    status: "pending",
    due_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(5),
    automation_count: 2,
    completed_automation_count: 1,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "tr-024",
    title: "New Supplier Due Diligence",
    description: "Complete due diligence on 3 new device suppliers - background checks, quality certifications, and contract negotiations",
    priority: "medium",
    status: "pending",
    due_date: daysFromNow(21),
    completed_at: null,
    created_at: daysAgo(10),
    automation_count: 3,
    completed_automation_count: 1,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
  },
  {
    id: "tr-025",
    title: "Consumer Rights Compliance Review",
    description: "Annual review of return, refund, and warranty policies against UK Consumer Rights Act 2015 requirements",
    priority: "medium",
    status: "completed",
    due_date: daysAgo(4),
    completed_at: daysAgo(3),
    created_at: daysAgo(20),
    automation_count: 2,
    completed_automation_count: 2,
    is_asap: false,
    category: "Legal",
    assigned_team: "Legal & Risk"
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
