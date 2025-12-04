import { mockTeams } from "./mockTeams";
import { marketingChatFiles } from './mockMarketingChatData';
import { customerServiceChatFiles, customerServiceMemories, customerServiceActivity } from './mockCustomerServiceChatData';
import { financeChatFiles, financeMemories, financeActivity } from './mockFinanceChatData';
import { developmentChatFiles, developmentMemories, developmentActivity } from './mockDevelopmentChatData';
import { creativeChatFiles, creativeMemories, creativeActivity } from './mockCreativeChatData';
import { legalChatFiles, legalMemories, legalActivity } from './mockLegalChatData';
import { productChatFiles, productMemories, productActivity } from './mockProductChatData';

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
    { id: "ma-1", action: "File Uploaded", description: "Uploaded daily_overview_tech_reborn_1000.csv with campaign metrics", performedBy: "Marketing Director", timestamp: "2025-04-12T10:02:00.000Z", type: "task" },
    { id: "ma-2", action: "Decision Made", description: "MacBook angle: Go performance + savings. Hook: 'You don't need the new one, the M1 is a monster.'", performedBy: "Liam", timestamp: "2025-04-12T10:10:00.000Z", type: "decision" },
    { id: "ma-3", action: "File Uploaded", description: "Uploaded tech_reborn_macbook_scripts_v1.docx with 3 script variants", performedBy: "Content Writer", timestamp: "2025-04-12T10:12:00.000Z", type: "task" },
    { id: "ma-4", action: "Strategy Set", description: "Messaging framework locked: 'Truth. Performance. Reborn.' - premium refurb positioning", performedBy: "Marketing Director", timestamp: "2025-04-12T10:26:00.000Z", type: "milestone" },
    { id: "ma-5", action: "Milestone", description: "Record day achieved. Revenue £189,420. Campaign locked, scaling tomorrow.", performedBy: "Liam", timestamp: "2025-04-12T17:16:00.000Z", type: "milestone" },
  ],
  "product": productActivity,
  "customer-service": customerServiceActivity,
  "finance": financeActivity,
  "development": developmentActivity,
  "creative": creativeActivity,
  "legal": legalActivity,
};

// Helper function to get team data by ID
export const getTeamGroupData = (teamId: string) => {
  const team = mockTeams.find(t => t.id === teamId);
  if (!team) return null;
  
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
    pdf: "📄", xlsx: "📊", csv: "📊", docx: "📝", md: "📝",
    json: "📋", fig: "🎨", psd: "🎨", zip: "📦", png: "🖼️",
    jpg: "🖼️", mp4: "🎬", pptx: "📊", html: "🌐", yml: "⚙️",
  };
  return icons[type] || "📄";
};

export const formatFileSize = (size: string): string => size;

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
