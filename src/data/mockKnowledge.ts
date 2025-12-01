export interface MockKnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
  priority?: "featured" | "standard";
  views?: number;
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
  uploaded_by: string;
  last_accessed?: string;
}

export const mockKnowledgeArticles: MockKnowledgeArticle[] = [
  {
    id: "article-1",
    title: "Company Culture & Values",
    content: "Our company is built on principles of innovation, collaboration, and customer success. We believe in transparent communication, continuous learning, and supporting each other's growth. Our core values guide every decision we make: integrity, excellence, and impact.\n\n## Our Core Values\n\n**Integrity**: We do what's right, even when no one is watching. Our commitment to honesty and transparency builds trust with our team and customers.\n\n**Excellence**: We strive for the highest standards in everything we do. Quality is never an accident; it's always the result of intelligent effort.\n\n**Impact**: We measure success by the positive change we create. Every action should move us closer to our mission of transforming how teams work together.",
    tags: ["culture", "onboarding", "values"],
    category: "Company Policies",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "featured",
    views: 342,
  },
  {
    id: "article-2",
    title: "Sales Playbook - Q4 2024",
    content: "Our Q4 sales strategy focuses on enterprise customers in the finance and healthcare sectors. Key talking points: ROI metrics showing 40% time savings, compliance features for regulated industries, and 24/7 support. Pricing starts at $999/month for teams up to 10 users.\n\n## Target Industries\n\n- **Finance**: Emphasize compliance, security, and audit trails\n- **Healthcare**: HIPAA compliance, patient data protection\n- **Enterprise Tech**: Integration capabilities, API access\n\n## Pricing Tiers\n\n- Starter: $999/mo (up to 10 users)\n- Professional: $2,499/mo (up to 50 users)\n- Enterprise: Custom pricing (unlimited users)",
    tags: ["sales", "strategy", "pricing"],
    category: "Sales",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "featured",
    views: 278,
  },
  {
    id: "article-3",
    title: "Product Roadmap Overview",
    content: "Upcoming features for 2025: Advanced analytics dashboard, API v2 with webhooks, mobile app for iOS and Android, and AI-powered automation builder. Expected releases: Q1 - Analytics, Q2 - API v2, Q3 - Mobile apps, Q4 - AI features.\n\n## Quarterly Milestones\n\n**Q1 2025**: Advanced Analytics Dashboard\n- Real-time data visualization\n- Custom report builder\n- Exportable insights\n\n**Q2 2025**: API v2 Launch\n- RESTful and GraphQL endpoints\n- Webhook support\n- Enhanced security\n\n**Q3 2025**: Mobile Applications\n- Native iOS app\n- Native Android app\n- Cross-platform sync\n\n**Q4 2025**: AI-Powered Features\n- Smart automation builder\n- Predictive analytics\n- Natural language queries",
    tags: ["product", "roadmap", "features"],
    category: "Product",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "standard",
    views: 195,
  },
  {
    id: "article-4",
    title: "Customer Support Best Practices",
    content: "Always respond within 4 hours during business hours. Use empathetic language and acknowledge customer frustration. Escalate to engineering for bugs. Provide workarounds when possible. Follow up after resolution to ensure satisfaction.\n\n## Response Time Standards\n\n- **Critical Issues**: 1 hour\n- **High Priority**: 4 hours\n- **Medium Priority**: 24 hours\n- **Low Priority**: 48 hours\n\n## Escalation Process\n\n1. Document the issue thoroughly\n2. Tag with appropriate priority\n3. Notify team lead for critical issues\n4. Create engineering ticket if needed\n5. Keep customer updated throughout",
    tags: ["support", "customer-service", "best-practices"],
    category: "Customer Support",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "standard",
    views: 156,
  },
  {
    id: "article-5",
    title: "Engineering Deployment Procedures",
    content: "All code changes must go through our CI/CD pipeline. Feature branches require at least 2 code reviews before merging to main. Production deployments happen on Tuesdays and Thursdays at 10 AM PST with a 30-minute maintenance window.\n\n## Pre-Deployment Checklist\n\n- [ ] All tests passing (unit, integration, E2E)\n- [ ] Code review completed by 2+ engineers\n- [ ] Security scan passed\n- [ ] Documentation updated\n- [ ] Staging environment validated\n- [ ] Rollback plan prepared\n\n## Deployment Steps\n\n1. Create deployment ticket\n2. Notify #engineering channel\n3. Execute deployment script\n4. Monitor error rates for 30 minutes\n5. Verify critical user flows\n6. Mark deployment complete or rollback",
    tags: ["engineering", "deployment", "devops", "ci-cd"],
    category: "Engineering",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "standard",
    views: 223,
  },
  {
    id: "article-6",
    title: "Remote Work Policy",
    content: "We support flexible work arrangements. Team members can work remotely full-time or choose a hybrid schedule. Core hours are 10 AM - 3 PM in your local timezone for team collaboration. Monthly in-person meetups are encouraged but optional.\n\n## Work Schedule Guidelines\n\n- **Core Hours**: 10 AM - 3 PM local time (for synchronous collaboration)\n- **Async Work**: Encouraged for deep focus tasks\n- **Time Zones**: We operate across PST, EST, and GMT\n\n## Equipment & Setup\n\n- Company-provided laptop\n- $500 home office stipend\n- Monthly internet reimbursement\n- Co-working space allowance if needed\n\n## Communication Expectations\n\n- Respond to Slack messages within 4 hours during core hours\n- Update calendar with OOO time\n- Weekly team sync meetings\n- Quarterly all-hands gatherings",
    tags: ["hr", "remote-work", "policy", "flexibility"],
    category: "HR",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "featured",
    views: 512,
  },
  {
    id: "article-7",
    title: "Q1 2025 Budget Planning",
    content: "Budget planning for Q1 2025 begins in November. Department heads should submit initial proposals by Nov 15. Focus areas: R&D investment, customer acquisition, and team expansion. Target: 15% revenue growth quarter-over-quarter.\n\n## Budget Allocation\n\n- **R&D**: 35% - Product development and innovation\n- **Sales & Marketing**: 30% - Customer acquisition\n- **Operations**: 20% - Infrastructure and tools\n- **HR**: 15% - Recruiting and retention\n\n## Key Initiatives\n\n1. Launch enterprise tier pricing\n2. Expand engineering team by 5 hires\n3. Invest in marketing automation\n4. Upgrade cloud infrastructure\n\n## Approval Process\n\n- Submit proposals by Nov 15\n- Finance review: Nov 16-22\n- Executive approval: Nov 25-30\n- Final budget locked: Dec 1",
    tags: ["finance", "budget", "planning", "q1-2025"],
    category: "Finance",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "standard",
    views: 89,
  },
  {
    id: "article-8",
    title: "Content Marketing Strategy 2025",
    content: "Our 2025 content strategy focuses on thought leadership, SEO-optimized blog posts, and video content. Target: 3 blog posts per week, 2 videos per month, and 1 major whitepaper per quarter. Emphasize AI, automation, and productivity themes.\n\n## Content Pillars\n\n1. **AI & Automation**: How AI is transforming work\n2. **Productivity**: Tips, tricks, and best practices\n3. **Case Studies**: Customer success stories\n4. **Industry Insights**: Market trends and analysis\n\n## Distribution Channels\n\n- Company blog (primary)\n- LinkedIn (B2B focus)\n- YouTube (video tutorials)\n- Email newsletter (weekly digest)\n- Partner blogs (guest posts)\n\n## Success Metrics\n\n- 50% increase in organic traffic\n- 10,000+ newsletter subscribers\n- 5,000+ YouTube subscribers\n- 20% conversion rate on gated content",
    tags: ["marketing", "content", "strategy", "seo"],
    category: "Marketing",
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "standard",
    views: 167,
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
    uploaded_by: "Sarah Johnson",
    last_accessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    uploaded_by: "Michael Chen",
    last_accessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
    uploaded_by: "David Kim",
    last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-4",
    name: "Q4 Financial Report.xlsx",
    file_path: "workspace/q4-financial-report.xlsx",
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 3145728, // 3 MB
    folder: "finance",
    description: "Q4 2024 financial performance analysis",
    tags: ["finance", "quarterly", "report"],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Emily Rodriguez",
    last_accessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-5",
    name: "Product Launch Deck.pptx",
    file_path: "workspace/product-launch-deck.pptx",
    file_type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    file_size: 8388608, // 8 MB
    folder: "marketing",
    description: "Q1 2025 product launch presentation",
    tags: ["product", "launch", "presentation"],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Sarah Johnson",
    last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-6",
    name: "Engineering Standards.txt",
    file_path: "workspace/engineering-standards.txt",
    file_type: "text/plain",
    file_size: 51200, // 50 KB
    folder: "technical",
    description: "Code style guide and best practices",
    tags: ["engineering", "standards", "guidelines"],
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "David Kim",
    last_accessed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-7",
    name: "Customer Feedback Analysis.csv",
    file_path: "workspace/customer-feedback.csv",
    file_type: "text/csv",
    file_size: 204800, // 200 KB
    folder: "root",
    description: "Q4 customer satisfaction survey results",
    tags: ["customers", "feedback", "survey"],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Michael Chen",
    last_accessed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-8",
    name: "Benefits Package Overview.pdf",
    file_path: "workspace/benefits-package.pdf",
    file_type: "application/pdf",
    file_size: 1572864, // 1.5 MB
    folder: "root",
    description: "Employee benefits and perks guide",
    tags: ["hr", "benefits", "perks"],
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Emily Rodriguez",
    last_accessed: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
