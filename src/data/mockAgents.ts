export interface MockAgent {
  id: string;
  name: string;
  description: string;
  rating: number;
  total_reviews: number;
  total_installs: number;
  category: string;
  image_url: string;
  featured?: boolean;
  badge?: 'Popular' | 'New' | 'AI-Powered' | 'Trending';
  capabilities?: string[];
  gradient?: string;
  staffPick?: boolean;
  trendingRank?: number | null;
}

export const mockAgents: MockAgent[] = [
  {
    id: "mock-1",
    name: "Customer Support Pro",
    description: "AI-powered 24/7 customer support with sentiment analysis and multi-language capabilities",
    rating: 4.9,
    total_reviews: 1247,
    total_installs: 8543,
    category: "Customer Service",
    image_url: "/elixa-logo.png",
    featured: true,
    badge: "Popular",
    capabilities: ["24/7 Support", "Multi-language", "Ticket Routing", "Sentiment Analysis"],
    gradient: "from-blue-500 to-purple-600",
    staffPick: true,
    trendingRank: 1
  },
  {
    id: "mock-2",
    name: "Content Creator AI",
    description: "Generate engaging content for blogs, social media, and marketing campaigns",
    rating: 4.8,
    total_reviews: 892,
    total_installs: 6234,
    category: "Marketing",
    image_url: "/elixa-logo.png",
    featured: true,
    badge: "AI-Powered",
    capabilities: ["Blog Posts", "Social Media", "SEO Optimization", "Brand Voice"],
    gradient: "from-purple-500 to-pink-600",
    staffPick: true,
    trendingRank: 2
  },
  {
    id: "mock-3",
    name: "Data Analyst Pro",
    description: "Advanced analytics and insights from your business data with predictive modeling",
    rating: 4.9,
    total_reviews: 654,
    total_installs: 5432,
    category: "Analytics",
    image_url: "/elixa-logo.png",
    featured: true,
    badge: "Trending",
    capabilities: ["Predictive Analytics", "Data Visualization", "Reports", "Forecasting"],
    gradient: "from-green-500 to-teal-600",
    trendingRank: 3
  },
  {
    id: "mock-4",
    name: "Sales Assistant",
    description: "Automate lead qualification, follow-ups, and pipeline management",
    rating: 4.7,
    total_reviews: 423,
    total_installs: 4123,
    category: "Sales",
    image_url: "/elixa-logo.png",
    badge: "New",
    capabilities: ["Lead Scoring", "Email Outreach", "CRM Integration", "Pipeline Management"],
    gradient: "from-orange-500 to-red-600",
    trendingRank: 4
  },
  {
    id: "mock-5",
    name: "Social Media Manager",
    description: "Schedule posts, analyze engagement, and grow your social presence",
    rating: 4.6,
    total_reviews: 789,
    total_installs: 7234,
    category: "Marketing",
    image_url: "/elixa-logo.png",
    capabilities: ["Post Scheduling", "Analytics", "Hashtag Research", "Content Calendar"],
    gradient: "from-pink-500 to-rose-600",
    trendingRank: 5
  },
  {
    id: "mock-6",
    name: "Email Marketing Bot",
    description: "Create, send, and optimize email campaigns with AI-driven personalization",
    rating: 4.8,
    total_reviews: 567,
    total_installs: 5876,
    category: "Marketing",
    image_url: "/elixa-logo.png",
    badge: "Popular",
    capabilities: ["Campaign Builder", "A/B Testing", "Personalization", "Analytics"],
    gradient: "from-indigo-500 to-blue-600",
    staffPick: true
  },
  {
    id: "mock-7",
    name: "HR Recruiter AI",
    description: "Streamline hiring with resume screening, interview scheduling, and candidate tracking",
    rating: 4.7,
    total_reviews: 341,
    total_installs: 3456,
    category: "HR",
    image_url: "/elixa-logo.png",
    capabilities: ["Resume Screening", "Interview Scheduling", "Candidate Tracking", "Job Posting"],
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: "mock-8",
    name: "Finance Manager",
    description: "Track expenses, generate reports, and manage invoices automatically",
    rating: 4.9,
    total_reviews: 456,
    total_installs: 4234,
    category: "Finance",
    image_url: "/elixa-logo.png",
    badge: "Trending",
    capabilities: ["Expense Tracking", "Invoice Management", "Financial Reports", "Budget Planning"],
    gradient: "from-emerald-500 to-green-600"
  },
  {
    id: "mock-9",
    name: "Project Manager Pro",
    description: "Coordinate teams, track tasks, and ensure project delivery on time",
    rating: 4.6,
    total_reviews: 612,
    total_installs: 5123,
    category: "Productivity",
    image_url: "/elixa-logo.png",
    capabilities: ["Task Management", "Team Coordination", "Timeline Tracking", "Resource Planning"],
    gradient: "from-violet-500 to-purple-600"
  },
  {
    id: "mock-10",
    name: "Legal Assistant",
    description: "Draft contracts, review documents, and ensure compliance",
    rating: 4.8,
    total_reviews: 234,
    total_installs: 2345,
    category: "Legal",
    image_url: "/elixa-logo.png",
    badge: "New",
    capabilities: ["Contract Drafting", "Document Review", "Compliance Checking", "Legal Research"],
    gradient: "from-slate-500 to-gray-600"
  },
  {
    id: "mock-11",
    name: "Research Assistant",
    description: "Conduct market research, competitive analysis, and trend identification",
    rating: 4.7,
    total_reviews: 389,
    total_installs: 3789,
    category: "Research",
    image_url: "/elixa-logo.png",
    capabilities: ["Market Research", "Competitive Analysis", "Trend Reports", "Data Gathering"],
    gradient: "from-sky-500 to-blue-600"
  },
  {
    id: "mock-12",
    name: "DevOps Helper",
    description: "Automate deployments, monitor infrastructure, and manage CI/CD pipelines",
    rating: 4.9,
    total_reviews: 298,
    total_installs: 3298,
    category: "Development",
    image_url: "/elixa-logo.png",
    badge: "AI-Powered",
    capabilities: ["CI/CD Automation", "Infrastructure Monitoring", "Log Analysis", "Deployment"],
    gradient: "from-amber-500 to-orange-600"
  }
];

// Helper to get featured agents
export const getFeaturedAgents = () => mockAgents.filter(agent => agent.featured);

// Helper to get agents by category
export const getAgentsByCategory = (category: string) => 
  category ? mockAgents.filter(agent => agent.category === category) : mockAgents;
