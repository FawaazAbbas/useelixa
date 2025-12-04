import { mockTeams } from "./mockTeams";
import { marketingChatFiles } from './mockMarketingChatData';
import {
  customerServiceChatFiles,
  customerServiceMemories,
  customerServiceActivity,
  financeChatFiles,
  financeMemories,
  financeActivity,
  developmentChatFiles,
  developmentMemories,
  developmentActivity,
  creativeChatFiles,
  creativeMemories,
  creativeActivity,
  legalChatFiles,
  legalMemories,
  legalActivity,
  productChatFiles,
  productMemories,
  productActivity,
} from './mockAllTeamChatsData';

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
  "product": productChatFiles,
  "customer-service": customerServiceChatFiles,
  "finance": financeChatFiles,
  "development": developmentChatFiles,
  "creative": creativeChatFiles,
  "legal": legalChatFiles,
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
  ],
  "product": productMemories,
  "customer-service": customerServiceMemories,
  "finance": financeMemories,
  "development": developmentMemories,
  "creative": creativeMemories,
  "legal": legalMemories,
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
  
  // Map team ID to data key (team IDs are like "team-marketing", data keys are "marketing")
  const teamKeyMap: Record<string, string> = {
    'team-marketing': 'marketing',
    'team-product': 'product',
    'team-customer-service': 'customer-service',
    'team-finance': 'finance',
    'team-development': 'development',
    'team-creative': 'creative',
    'team-legal': 'legal',
  };
  const dataKey = teamKeyMap[teamId] || teamId;
  
  return {
    team,
    files: mockTeamFiles[dataKey] || [],
    memories: mockTeamMemories[dataKey] || [],
    activity: mockTeamActivity[dataKey] || [],
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
