export interface MockKnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockDocument {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder: string;
  description: string | null;
  tags: string[];
  created_at: string;
}

export const mockKnowledgeArticles: MockKnowledgeArticle[] = [
  {
    id: "article-1",
    title: "Company Culture & Values",
    content: "Our company is built on principles of innovation, collaboration, and customer success. We believe in transparent communication, continuous learning, and supporting each other's growth. Our core values guide every decision we make: integrity, excellence, and impact.",
    tags: ["culture", "onboarding", "values"],
    category: "Company Policies",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "article-2",
    title: "Sales Playbook - Q4 2024",
    content: "Our Q4 sales strategy focuses on enterprise customers in the finance and healthcare sectors. Key talking points: ROI metrics showing 40% time savings, compliance features for regulated industries, and 24/7 support. Pricing starts at $999/month for teams up to 10 users.",
    tags: ["sales", "strategy", "pricing"],
    category: "Sales",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "article-3",
    title: "Product Roadmap Overview",
    content: "Upcoming features for 2025: Advanced analytics dashboard, API v2 with webhooks, mobile app for iOS and Android, and AI-powered automation builder. Expected releases: Q1 - Analytics, Q2 - API v2, Q3 - Mobile apps, Q4 - AI features.",
    tags: ["product", "roadmap", "features"],
    category: "Product",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "article-4",
    title: "Customer Support Best Practices",
    content: "Always respond within 4 hours during business hours. Use empathetic language and acknowledge customer frustration. Escalate to engineering for bugs. Provide workarounds when possible. Follow up after resolution to ensure satisfaction.",
    tags: ["support", "customer-service", "best-practices"],
    category: "Customer Support",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockDocuments: MockDocument[] = [
  {
    id: "doc-1",
    name: "Onboarding Guide.pdf",
    file_path: "workspace/onboarding-guide.pdf",
    file_type: "application/pdf",
    file_size: 2457600, // 2.4 MB
    folder: "root",
    description: "Complete guide for new employees",
    tags: ["onboarding", "hr"],
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-2",
    name: "Brand Guidelines.pdf",
    file_path: "workspace/brand-guidelines.pdf",
    file_type: "application/pdf",
    file_size: 5242880, // 5 MB
    folder: "marketing",
    description: "Official brand assets and usage guidelines",
    tags: ["branding", "marketing", "design"],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-3",
    name: "API Documentation v2.docx",
    file_path: "workspace/api-docs-v2.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 1048576, // 1 MB
    folder: "technical",
    description: "API v2 technical documentation",
    tags: ["api", "technical", "documentation"],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
