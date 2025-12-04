import { mockTeams } from "./mockTeams";

import { marketingChatFiles } from './mockMarketingChatData';

// Mock files for team group chats
export const mockTeamFiles: Record<string, Array<{
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}>> = {
  "marketing": marketingChatFiles,
  "product": [
    { id: "pf-1", name: "Product Roadmap Q4.pdf", type: "pdf", size: "1.8 MB", uploadedBy: "Product Director", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "pf-2", name: "Competitor Pricing Analysis.xlsx", type: "xlsx", size: "892 KB", uploadedBy: "Competitive Pricing Analyst", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "pf-3", name: "SKU Inventory List.csv", type: "csv", size: "2.1 MB", uploadedBy: "Product Listing Manager", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "customer-service": [
    { id: "cf-1", name: "Support Playbook.pdf", type: "pdf", size: "3.2 MB", uploadedBy: "Customer Service Director", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "cf-2", name: "FAQ Templates.docx", type: "docx", size: "245 KB", uploadedBy: "Customer Support Rep", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "cf-3", name: "Weekly CSAT Report.xlsx", type: "xlsx", size: "412 KB", uploadedBy: "QA Specialist", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "finance": [
    { id: "ff-1", name: "Monthly P&L Report.xlsx", type: "xlsx", size: "1.4 MB", uploadedBy: "Finance Director", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "ff-2", name: "Q4 Forecast Model.xlsx", type: "xlsx", size: "2.8 MB", uploadedBy: "FP&A Analyst", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "ff-3", name: "Revenue Dashboard Config.json", type: "json", size: "12 KB", uploadedBy: "Revenue Ops Analyst", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "development": [
    { id: "df-1", name: "Technical Architecture.pdf", type: "pdf", size: "4.2 MB", uploadedBy: "Tech Lead", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "df-2", name: "API Documentation.md", type: "md", size: "156 KB", uploadedBy: "Tech Integrations Specialist", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "df-3", name: "Sprint Backlog.csv", type: "csv", size: "89 KB", uploadedBy: "Tech Lead", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
    { id: "df-4", name: "UX Wireframes.fig", type: "fig", size: "12.4 MB", uploadedBy: "UX/UI Designer", uploadedAt: new Date(Date.now() - 345600000).toISOString() },
  ],
  "creative": [
    { id: "crf-1", name: "Brand Assets Pack.zip", type: "zip", size: "48.2 MB", uploadedBy: "Creative Director", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "crf-2", name: "Video Templates.zip", type: "zip", size: "124 MB", uploadedBy: "Video Producer", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "crf-3", name: "Social Templates.psd", type: "psd", size: "34.6 MB", uploadedBy: "Graphic Designer", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "legal": [
    { id: "lf-1", name: "Terms of Service.pdf", type: "pdf", size: "892 KB", uploadedBy: "Legal Director", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "lf-2", name: "Privacy Policy.pdf", type: "pdf", size: "645 KB", uploadedBy: "Compliance Officer", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "lf-3", name: "Contract Templates.zip", type: "zip", size: "2.4 MB", uploadedBy: "Legal Assistant", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
    { id: "lf-4", name: "Fraud Prevention Guidelines.pdf", type: "pdf", size: "1.2 MB", uploadedBy: "Fraud Detection Specialist", uploadedAt: new Date(Date.now() - 345600000).toISOString() },
  ],
};

// Mock memories for team group chats
export const mockTeamMemories: Record<string, Array<{
  id: string;
  key: string;
  value: string;
  category: string;
  createdBy: string;
  updatedAt: string;
}>> = {
  "marketing": [
    { id: "mm-1", key: "Campaign Messaging Framework", value: "Truth. Performance. Reborn. - Drop any lines that feel too discount-y. We're premium refurb.", category: "Strategy", createdBy: "Marketing Director", updatedAt: "2025-04-12T10:26:00.000Z" },
    { id: "mm-2", key: "Brand Positioning", value: "We are the anti-inflation tech brand. We sell truth.", category: "Brand", createdBy: "Liam", updatedAt: "2025-04-12T10:20:00.000Z" },
    { id: "mm-3", key: "MacBook Hook", value: "Performance + Savings angle: 'You don't need the new one, the M1 is a monster.'", category: "Creative", createdBy: "Liam", updatedAt: "2025-04-12T10:10:00.000Z" },
    { id: "mm-4", key: "Approved Headlines", value: "#1: 'The M1 Didn't Get Slower, Only Cheaper.' #3: 'MacBook Air M1: Peak Value. Reborn.' Rotate both.", category: "Ads", createdBy: "Liam", updatedAt: "2025-04-12T10:24:00.000Z" },
    { id: "mm-5", key: "Email Messaging Priority", value: "Quality first, price second. Hero line: 'Your Next MacBook, Reborn to Perform.' Put savings further down, not up front.", category: "Email", createdBy: "Liam", updatedAt: "2025-04-12T10:16:00.000Z" },
    { id: "mm-6", key: "Approved Script", value: "Before you spend over £1,000 on a laptop… remember this. The M1 is still one of the fastest chips Apple ever made. Tech Reborn brings it back to life, at a price that finally makes sense.", category: "Creative", createdBy: "Content Writer", updatedAt: "2025-04-12T10:50:00.000Z" },
    { id: "mm-7", key: "Influencer Strategy", value: "10 creators with hook: 'I tested a refurbished MacBook so you don't have to.' CTA: Tech Reborn by Baduss", category: "Influencer", createdBy: "Social Media Manager", updatedAt: "2025-04-12T10:46:00.000Z" },
    { id: "mm-8", key: "Email Segmentation", value: "4 segments: Laptop intenders, High-value visitors, Viewed MacBook but didn't buy, Existing customers with older MacBooks", category: "Email", createdBy: "Email Marketing Specialist", updatedAt: "2025-04-12T10:52:00.000Z" },
    { id: "mm-9", key: "Video CTA", value: "End line for all videos: 'Stop overpaying for the same performance.'", category: "Creative", createdBy: "Liam", updatedAt: "2025-04-12T10:30:00.000Z" },
    { id: "mm-10", key: "FAQ Topics", value: "1. Is M1 still good in 2025? 2. Why choose refurbished over new? 3. What testing does Baduss Tech perform? 4. Battery Health Guarantee", category: "SEO", createdBy: "SEO Specialist", updatedAt: "2025-04-12T10:40:00.000Z" },
    { id: "mm-11", key: "Performance Record Day", value: "April 12, 2025: Revenue £132,870 (+24% vs last Tuesday), MacBook sales up 41% vs all of yesterday", category: "Metrics", createdBy: "Marketing Director", updatedAt: "2025-04-12T15:00:00.000Z" },
    { id: "mm-12", key: "Top Performing Ad", value: "'Before you spend £1,000…' → CTR 5.3%, CPA £10.90. Budget reallocated 70% to winners.", category: "Ads", createdBy: "PPC Specialist", updatedAt: "2025-04-12T15:04:00.000Z" },
  ],
  "product": [
    { id: "pm-1", key: "Pricing Strategy", value: "15-20% below market for Grade A, 25-30% for Grade B", category: "Pricing", createdBy: "Competitive Pricing Analyst", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "pm-2", key: "Quality Grading", value: "Grade A: Like new, Grade B: Minor cosmetic wear, Grade C: Functional with visible wear", category: "Product", createdBy: "Product Director", updatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  "customer-service": [
    { id: "cm-1", key: "Response Time SLA", value: "First response within 4 hours during business hours", category: "SLA", createdBy: "Customer Service Director", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "cm-2", key: "Escalation Process", value: "Complex issues escalate to Director after 2 failed resolution attempts", category: "Process", createdBy: "Customer Service Director", updatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  "finance": [
    { id: "fm-1", key: "Budget Review", value: "Monthly budget review on the last Friday of each month", category: "Schedule", createdBy: "Finance Director", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "fm-2", key: "Approval Thresholds", value: "Director approval required for expenses over £5,000", category: "Process", createdBy: "Finance Director", updatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  "development": [
    { id: "dm-1", key: "Sprint Length", value: "2-week sprints with planning on Monday", category: "Process", createdBy: "Tech Lead", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "dm-2", key: "Code Review Policy", value: "All PRs require at least one approval before merge", category: "Process", createdBy: "Tech Lead", updatedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "dm-3", key: "Tech Stack", value: "Shopify Plus, React, Node.js, PostgreSQL", category: "Technical", createdBy: "Tech Lead", updatedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  "creative": [
    { id: "crm-1", key: "Brand Colors", value: "Primary: #2563EB, Secondary: #10B981, Accent: #F59E0B", category: "Brand", createdBy: "Creative Director", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "crm-2", key: "Asset Naming Convention", value: "[Campaign]_[Format]_[Size]_[Version] e.g., BF24_Banner_1200x628_v2", category: "Process", createdBy: "Graphic Designer", updatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  "legal": [
    { id: "lm-1", key: "Contract Review SLA", value: "Standard contracts within 3 business days, complex within 5", category: "SLA", createdBy: "Legal Director", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "lm-2", key: "Compliance Check", value: "Quarterly compliance audit on first week of each quarter", category: "Schedule", createdBy: "Compliance Officer", updatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
};

// Mock activity history for team group chats
export const mockTeamActivity: Record<string, Array<{
  id: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  type: 'decision' | 'task' | 'discussion' | 'milestone';
}>> = {
  "marketing": [
    // Morning Session - April 12, 2025
    { id: "ma-1", action: "File Uploaded", description: "Uploaded daily_overview_tech_reborn_1000.csv with campaign metrics", performedBy: "Marketing Director", timestamp: "2025-04-12T10:02:00.000Z", type: "task" },
    { id: "ma-2", action: "Decision Made", description: "MacBook angle: Go performance + savings. Hook: 'You don't need the new one, the M1 is a monster.'", performedBy: "Liam", timestamp: "2025-04-12T10:10:00.000Z", type: "decision" },
    { id: "ma-3", action: "File Uploaded", description: "Uploaded tech_reborn_macbook_scripts_v1.docx with 3 script variants", performedBy: "Content Writer", timestamp: "2025-04-12T10:12:00.000Z", type: "task" },
    { id: "ma-4", action: "Decision Made", description: "Email priority: Quality first, price second. Hero: 'Your Next MacBook, Reborn to Perform.'", performedBy: "Liam", timestamp: "2025-04-12T10:16:00.000Z", type: "decision" },
    { id: "ma-5", action: "Decision Made", description: "Approved 'anti-Apple' performance comparison chart: 'Minimal difference for most users.'", performedBy: "Liam", timestamp: "2025-04-12T10:20:00.000Z", type: "decision" },
    { id: "ma-6", action: "File Uploaded", description: "Uploaded macbook_headlines_options.pdf with 3 headline variations", performedBy: "PPC Specialist", timestamp: "2025-04-12T10:22:00.000Z", type: "task" },
    { id: "ma-7", action: "Decision Made", description: "Headlines approved: #1 and #3 to rotate. Kill #2.", performedBy: "Liam", timestamp: "2025-04-12T10:24:00.000Z", type: "decision" },
    { id: "ma-8", action: "Strategy Set", description: "Messaging framework locked: 'Truth. Performance. Reborn.' - premium refurb positioning", performedBy: "Marketing Director", timestamp: "2025-04-12T10:26:00.000Z", type: "milestone" },
    { id: "ma-9", action: "File Uploaded", description: "Uploaded tech_reborn_reel_draft_v2.mp4 with new Reel creative", performedBy: "Social Media Manager", timestamp: "2025-04-12T10:28:00.000Z", type: "task" },
    { id: "ma-10", action: "Decision Made", description: "Video CTA added: 'Stop overpaying for the same performance.'", performedBy: "Liam", timestamp: "2025-04-12T10:30:00.000Z", type: "decision" },
    { id: "ma-11", action: "File Uploaded", description: "Uploaded tech_reborn_macbook_scripts_v2_v3.docx with 2 more variants", performedBy: "Content Writer", timestamp: "2025-04-12T10:32:00.000Z", type: "task" },
    { id: "ma-12", action: "Decision Made", description: "Approved V3 script: 'Before you spend over £1,000 on a laptop…'", performedBy: "Liam", timestamp: "2025-04-12T10:34:00.000Z", type: "decision" },
    { id: "ma-13", action: "File Uploaded", description: "Uploaded tech_reborn_macbook_email_preview.html", performedBy: "Email Marketing Specialist", timestamp: "2025-04-12T10:36:00.000Z", type: "task" },
    { id: "ma-14", action: "Decision Made", description: "Added Battery Health Guarantee FAQ - 'People obsess over that line item.'", performedBy: "Liam", timestamp: "2025-04-12T10:40:00.000Z", type: "decision" },
    { id: "ma-15", action: "File Uploaded", description: "Uploaded tech_reborn_macbook_creatives_batch1.zip with ad variations", performedBy: "PPC Specialist", timestamp: "2025-04-12T10:42:00.000Z", type: "task" },
    { id: "ma-16", action: "File Uploaded", description: "Uploaded influencer_brief_tech_reborn_macbook.pdf for 10 creators", performedBy: "Social Media Manager", timestamp: "2025-04-12T10:46:00.000Z", type: "task" },
    { id: "ma-17", action: "Decision Made", description: "Final script V3 approved: Push line everywhere.", performedBy: "Liam", timestamp: "2025-04-12T10:50:00.000Z", type: "decision" },
    { id: "ma-18", action: "File Uploaded", description: "Uploaded midday_checklist_tech_reborn.docx", performedBy: "Marketing Director", timestamp: "2025-04-12T10:56:00.000Z", type: "task" },
    { id: "ma-19", action: "Milestone", description: "Tech Reborn campaign identity established. Target: record numbers by midnight.", performedBy: "Liam", timestamp: "2025-04-12T10:58:00.000Z", type: "milestone" },
    // 3PM Session
    { id: "ma-20", action: "File Uploaded", description: "Uploaded tech_reborn_3pm_performance.csv - Revenue £132,870 (+24%)", performedBy: "Marketing Director", timestamp: "2025-04-12T15:00:00.000Z", type: "task" },
    { id: "ma-21", action: "File Uploaded", description: "Uploaded macbook_ads_performance_window_13-15.csv", performedBy: "PPC Specialist", timestamp: "2025-04-12T15:04:00.000Z", type: "task" },
    { id: "ma-22", action: "Decision Made", description: "Paused all legacy MacBook creatives. Reallocating 70% budget to top performers.", performedBy: "PPC Specialist", timestamp: "2025-04-12T15:04:00.000Z", type: "decision" },
    { id: "ma-23", action: "File Uploaded", description: "Uploaded creator_ad_macbook_cut1.mp4 - first creator video edit", performedBy: "Social Media Manager", timestamp: "2025-04-12T15:06:00.000Z", type: "task" },
    { id: "ma-24", action: "Decision Made", description: "Creator video feedback: Trim intro by 2 seconds, cut rambling, new end line.", performedBy: "Liam", timestamp: "2025-04-12T15:08:00.000Z", type: "decision" },
    { id: "ma-25", action: "File Uploaded", description: "Uploaded tech_reborn_evening_strategy.pptx", performedBy: "Marketing Director", timestamp: "2025-04-12T15:24:00.000Z", type: "task" },
    { id: "ma-26", action: "Decision Made", description: "Evening push: Scale MacBook spend 50%, launch iPhone 13 angle, TikTok priority.", performedBy: "Liam", timestamp: "2025-04-12T15:30:00.000Z", type: "decision" },
    { id: "ma-27", action: "File Uploaded", description: "Uploaded tech_reborn_iphone13_scripts.docx", performedBy: "Content Writer", timestamp: "2025-04-12T15:32:00.000Z", type: "task" },
    { id: "ma-28", action: "Decision Made", description: "iPhone 13 hook: 'Better camera than 99% of phones. £399. Tech Reborn.'", performedBy: "Liam", timestamp: "2025-04-12T15:38:00.000Z", type: "decision" },
    { id: "ma-29", action: "File Uploaded", description: "Uploaded tech_reborn_iphone_creatives.zip", performedBy: "PPC Specialist", timestamp: "2025-04-12T15:44:00.000Z", type: "task" },
    { id: "ma-30", action: "File Uploaded", description: "Uploaded tech_reborn_final_report_april12.csv - Day's performance summary", performedBy: "Marketing Director", timestamp: "2025-04-12T17:14:00.000Z", type: "task" },
    { id: "ma-31", action: "Milestone", description: "Record day achieved. Revenue £189,420. Campaign locked, scaling tomorrow.", performedBy: "Liam", timestamp: "2025-04-12T17:16:00.000Z", type: "milestone" },
  ],
  "product": [
    { id: "pa-1", action: "Price Update", description: "iPhone 13 pricing adjusted to match competitor drop", performedBy: "Competitive Pricing Analyst", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "decision" },
    { id: "pa-2", action: "New Category Added", description: "Samsung Galaxy Z Fold category launched with 12 SKUs", performedBy: "Product Director", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "milestone" },
    { id: "pa-3", action: "Listing Audit", description: "Completed audit of 200 listings, 47 updated", performedBy: "Product Listing Manager", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "task" },
  ],
  "customer-service": [
    { id: "ca-1", action: "CSAT Milestone", description: "Achieved 96% CSAT score for the week", performedBy: "Customer Support Rep", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "milestone" },
    { id: "ca-2", action: "Process Update", description: "New warranty claim process implemented", performedBy: "Refunds & Warranty Specialist", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "decision" },
    { id: "ca-3", action: "Training Completed", description: "Team completed new product knowledge training", performedBy: "Customer Service Director", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "task" },
  ],
  "finance": [
    { id: "fa-1", action: "Monthly Close", description: "November books closed - £482k revenue", performedBy: "Finance Director", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "milestone" },
    { id: "fa-2", action: "Forecast Updated", description: "Q4 forecast revised upward by 8%", performedBy: "FP&A Analyst", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "task" },
    { id: "fa-3", action: "Budget Discussion", description: "Discussed 2025 budget allocation priorities", performedBy: "Finance Director", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "discussion" },
  ],
  "development": [
    { id: "da-1", action: "Feature Deployed", description: "New checkout optimization live - 8% improvement in conversion", performedBy: "Shopify Developer", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "milestone" },
    { id: "da-2", action: "Sprint Planning", description: "Sprint 24 planned - 14 story points committed", performedBy: "Tech Lead", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "task" },
    { id: "da-3", action: "Tech Decision", description: "Approved migration to new payment gateway", performedBy: "Tech Lead", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "decision" },
    { id: "da-4", action: "Design Review", description: "Mobile navigation redesign approved", performedBy: "UX/UI Designer", timestamp: new Date(Date.now() - 259200000).toISOString(), type: "discussion" },
  ],
  "creative": [
    { id: "cra-1", action: "Assets Delivered", description: "Black Friday campaign creative pack completed - 24 assets", performedBy: "Graphic Designer", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "task" },
    { id: "cra-2", action: "Video Campaign", description: "Product video series wrapped - 8 videos completed", performedBy: "Video Producer", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "milestone" },
    { id: "cra-3", action: "Brand Discussion", description: "Discussed potential brand refresh for 2025", performedBy: "Creative Director", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "discussion" },
  ],
  "legal": [
    { id: "la-1", action: "Compliance Check", description: "Quarterly GDPR audit completed - all clear", performedBy: "Compliance Officer", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "milestone" },
    { id: "la-2", action: "Contract Signed", description: "New supplier agreement finalized", performedBy: "Legal Assistant", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "task" },
    { id: "la-3", action: "Fraud Alert", description: "Blocked £3.2k in suspicious transactions", performedBy: "Fraud Detection Specialist", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "decision" },
    { id: "la-4", action: "Policy Update", description: "Updated cookie consent for new regulations", performedBy: "Compliance Officer", timestamp: new Date(Date.now() - 259200000).toISOString(), type: "task" },
  ],
};

// Helper function to get team data by ID
export const getTeamGroupData = (teamId: string) => {
  const team = mockTeams.find(t => t.id === teamId);
  if (!team) return null;
  
  return {
    team,
    files: mockTeamFiles[teamId] || [],
    memories: mockTeamMemories[teamId] || [],
    activity: mockTeamActivity[teamId] || [],
  };
};

// Helper to get file icon based on type
export const getFileIcon = (type: string): string => {
  const icons: Record<string, string> = {
    pdf: "📄",
    xlsx: "📊",
    csv: "📊",
    docx: "📝",
    md: "📝",
    json: "📋",
    fig: "🎨",
    psd: "🎨",
    zip: "📦",
  };
  return icons[type] || "📄";
};

// Helper to format file size
export const formatFileSize = (size: string): string => {
  return size;
};

// Helper to format relative time
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};
