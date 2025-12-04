import { MockActivityLog } from './mockLogs';
import { mockTeamActivity } from './mockTeamGroupData';
import {
  marketingDirectorActivity,
  productDirectorActivity,
  customerServiceDirectorActivity,
  financeDirectorActivity,
  techLeadActivity,
  creativeDirectorActivity,
  legalDirectorActivity,
} from './mockDirectorChatData';

// Agent metadata for activity logs
const agentMetadata: Record<string, { name: string; category: string; image_url: string }> = {
  // Directors
  'Marketing Director': { name: 'Marketing Director', category: 'Marketing', image_url: '/elixa-logo.png' },
  'Product Director': { name: 'Product Director', category: 'Product', image_url: '/elixa-logo.png' },
  'Customer Service Director': { name: 'Customer Service Director', category: 'Customer Service', image_url: '/elixa-logo.png' },
  'Finance Director': { name: 'Finance Director', category: 'Finance', image_url: '/elixa-logo.png' },
  'Tech Lead': { name: 'Tech Lead', category: 'Development', image_url: '/elixa-logo.png' },
  'Creative Director': { name: 'Creative Director', category: 'Creative', image_url: '/elixa-logo.png' },
  'Legal Director': { name: 'Legal Director', category: 'Legal', image_url: '/elixa-logo.png' },
  // Team Members
  'Content Writer': { name: 'Content Writer', category: 'Marketing', image_url: '/elixa-logo.png' },
  'SEO Specialist': { name: 'SEO Specialist', category: 'Marketing', image_url: '/elixa-logo.png' },
  'Social Media Manager': { name: 'Social Media Manager', category: 'Marketing', image_url: '/elixa-logo.png' },
  'Product Manager': { name: 'Product Manager', category: 'Product', image_url: '/elixa-logo.png' },
  'QA Lead': { name: 'QA Lead', category: 'Product', image_url: '/elixa-logo.png' },
  'Inventory Specialist': { name: 'Inventory Specialist', category: 'Product', image_url: '/elixa-logo.png' },
  'Support Lead': { name: 'Support Lead', category: 'Customer Service', image_url: '/elixa-logo.png' },
  'Returns Specialist': { name: 'Returns Specialist', category: 'Customer Service', image_url: '/elixa-logo.png' },
  'Escalation Manager': { name: 'Escalation Manager', category: 'Customer Service', image_url: '/elixa-logo.png' },
  'Financial Analyst': { name: 'Financial Analyst', category: 'Finance', image_url: '/elixa-logo.png' },
  'Accounts Specialist': { name: 'Accounts Specialist', category: 'Finance', image_url: '/elixa-logo.png' },
  'Frontend Developer': { name: 'Frontend Developer', category: 'Development', image_url: '/elixa-logo.png' },
  'Backend Developer': { name: 'Backend Developer', category: 'Development', image_url: '/elixa-logo.png' },
  'DevOps Engineer': { name: 'DevOps Engineer', category: 'Development', image_url: '/elixa-logo.png' },
  'QA Engineer': { name: 'QA Engineer', category: 'Development', image_url: '/elixa-logo.png' },
  'Data Engineer': { name: 'Data Engineer', category: 'Development', image_url: '/elixa-logo.png' },
  'Security Analyst': { name: 'Security Analyst', category: 'Development', image_url: '/elixa-logo.png' },
  'Senior Designer': { name: 'Senior Designer', category: 'Creative', image_url: '/elixa-logo.png' },
  'Motion Designer': { name: 'Motion Designer', category: 'Creative', image_url: '/elixa-logo.png' },
  'Lead Counsel': { name: 'Lead Counsel', category: 'Legal', image_url: '/elixa-logo.png' },
  'Compliance Officer': { name: 'Compliance Officer', category: 'Legal', image_url: '/elixa-logo.png' },
  'IP Specialist': { name: 'IP Specialist', category: 'Legal', image_url: '/elixa-logo.png' },
  'Liam': { name: 'Liam (CEO)', category: 'Executive', image_url: '/elixa-logo.png' },
};

// Tool names based on activity type
const getToolName = (action: string, type: string): string => {
  if (action.toLowerCase().includes('file uploaded') || type === 'file_upload') return 'File Upload';
  if (action.toLowerCase().includes('decision') || type === 'decision') return 'Decision Engine';
  if (action.toLowerCase().includes('milestone') || type === 'milestone') return 'Milestone Tracker';
  if (action.toLowerCase().includes('strategy') || type === 'strategy') return 'Strategy Planner';
  if (action.toLowerCase().includes('task')) return 'Task Manager';
  if (action.toLowerCase().includes('discussion')) return 'Discussion Thread';
  if (action.toLowerCase().includes('approval')) return 'Approval Workflow';
  if (action.toLowerCase().includes('review')) return 'Review System';
  return 'Activity Logger';
};

// Execution time based on action type (realistic mock)
const getExecutionTime = (type: string): number => {
  const times: Record<string, number> = {
    'file_upload': Math.floor(Math.random() * 2000) + 500,
    'decision': Math.floor(Math.random() * 1500) + 200,
    'milestone': Math.floor(Math.random() * 500) + 100,
    'task': Math.floor(Math.random() * 1000) + 300,
    'discussion': Math.floor(Math.random() * 800) + 150,
    'strategy': Math.floor(Math.random() * 2500) + 1000,
  };
  return times[type] || Math.floor(Math.random() * 1000) + 200;
};

// Generate steps based on activity type
const generateSteps = (action: string, type: string): Array<{ name: string; duration_ms: number; status: string }> => {
  if (type === 'file_upload' || action.toLowerCase().includes('file')) {
    return [
      { name: 'Validating file format', duration_ms: Math.floor(Math.random() * 200) + 50, status: 'success' },
      { name: 'Processing file content', duration_ms: Math.floor(Math.random() * 500) + 200, status: 'success' },
      { name: 'Storing in workspace', duration_ms: Math.floor(Math.random() * 300) + 100, status: 'success' },
      { name: 'Updating file index', duration_ms: Math.floor(Math.random() * 150) + 50, status: 'success' },
    ];
  }
  if (type === 'decision') {
    return [
      { name: 'Analyzing context', duration_ms: Math.floor(Math.random() * 300) + 100, status: 'success' },
      { name: 'Evaluating options', duration_ms: Math.floor(Math.random() * 400) + 200, status: 'success' },
      { name: 'Recording decision', duration_ms: Math.floor(Math.random() * 200) + 100, status: 'success' },
      { name: 'Notifying stakeholders', duration_ms: Math.floor(Math.random() * 150) + 50, status: 'success' },
    ];
  }
  if (type === 'milestone') {
    return [
      { name: 'Verifying milestone criteria', duration_ms: Math.floor(Math.random() * 200) + 100, status: 'success' },
      { name: 'Recording achievement', duration_ms: Math.floor(Math.random() * 150) + 50, status: 'success' },
      { name: 'Updating project status', duration_ms: Math.floor(Math.random() * 100) + 50, status: 'success' },
    ];
  }
  return [
    { name: 'Processing activity', duration_ms: Math.floor(Math.random() * 300) + 100, status: 'success' },
    { name: 'Updating records', duration_ms: Math.floor(Math.random() * 200) + 100, status: 'success' },
  ];
};

// Transform team activity to MockActivityLog format
const transformTeamActivity = (
  teamKey: string,
  teamName: string,
  activities: Array<{ id: string; action: string; description: string; performedBy: string; timestamp: string; type: string }>
): MockActivityLog[] => {
  return activities.map((activity, index) => {
    const agent = agentMetadata[activity.performedBy] || { 
      name: activity.performedBy, 
      category: 'General', 
      image_url: '/elixa-logo.png' 
    };
    const toolName = getToolName(activity.action, activity.type);
    const executionTime = getExecutionTime(activity.type);
    
    return {
      id: `team-${teamKey}-${activity.id}`,
      action: activity.action.toLowerCase().replace(/\s+/g, '_'),
      entity_type: activity.type,
      status: 'success' as const,
      created_at: activity.timestamp,
      metadata: {
        tool_name: toolName,
        execution_time_ms: executionTime,
        description: activity.description,
      },
      agent: {
        name: agent.name,
        image_url: agent.image_url,
        category: agent.category,
      },
      trigger_source: `${teamName} Team Chat`,
      input_data: {
        team: teamName,
        performer: activity.performedBy,
        action_type: activity.type,
      },
      output_data: {
        recorded: true,
        team_notified: true,
        timestamp: activity.timestamp,
      },
      steps: generateSteps(activity.action, activity.type),
      related_entities: [
        { type: 'team', id: `team-${teamKey}`, name: `${teamName} Team` },
      ],
    };
  });
};

// Transform director activity to MockActivityLog format
const transformDirectorActivity = (
  directorKey: string,
  directorName: string,
  activities: Array<{ id: string; action: string; description: string; performer: string; timestamp: string; type: string }>
): MockActivityLog[] => {
  return activities.map((activity, index) => {
    const agent = agentMetadata[activity.performer] || { 
      name: activity.performer, 
      category: 'Executive', 
      image_url: '/elixa-logo.png' 
    };
    const toolName = getToolName(activity.action, activity.type);
    const executionTime = getExecutionTime(activity.type);
    
    return {
      id: `director-${directorKey}-${activity.id}`,
      action: activity.action.toLowerCase().replace(/\s+/g, '_'),
      entity_type: activity.type,
      status: 'success' as const,
      created_at: activity.timestamp,
      metadata: {
        tool_name: toolName,
        execution_time_ms: executionTime,
        description: activity.description,
      },
      agent: {
        name: agent.name,
        image_url: agent.image_url,
        category: agent.category,
      },
      trigger_source: `${directorName} Direct Chat`,
      input_data: {
        director: directorName,
        performer: activity.performer,
        action_type: activity.type,
      },
      output_data: {
        recorded: true,
        ceo_notified: activity.performer !== 'Liam',
        timestamp: activity.timestamp,
      },
      steps: generateSteps(activity.action, activity.type),
      related_entities: [
        { type: 'director', id: `director-${directorKey}`, name: directorName },
      ],
    };
  });
};

// Combine all team activities
const allTeamActivities: MockActivityLog[] = [
  ...transformTeamActivity('marketing', 'Marketing', mockTeamActivity['marketing'] || []),
  ...transformTeamActivity('product', 'Product & Merchandising', mockTeamActivity['product'] || []),
  ...transformTeamActivity('customer-service', 'Customer Service', mockTeamActivity['customer-service'] || []),
  ...transformTeamActivity('finance', 'Finance', mockTeamActivity['finance'] || []),
  ...transformTeamActivity('development', 'Development', mockTeamActivity['development'] || []),
  ...transformTeamActivity('creative', 'Creative', mockTeamActivity['creative'] || []),
  ...transformTeamActivity('legal', 'Legal & Risk', mockTeamActivity['legal'] || []),
];

// Combine all director activities
const allDirectorActivities: MockActivityLog[] = [
  ...transformDirectorActivity('marketing', 'Marketing Director', marketingDirectorActivity || []),
  ...transformDirectorActivity('product', 'Product Director', productDirectorActivity || []),
  ...transformDirectorActivity('customer-service', 'Customer Service Director', customerServiceDirectorActivity || []),
  ...transformDirectorActivity('finance', 'Finance Director', financeDirectorActivity || []),
  ...transformDirectorActivity('tech', 'Tech Lead', techLeadActivity || []),
  ...transformDirectorActivity('creative', 'Creative Director', creativeDirectorActivity || []),
  ...transformDirectorActivity('legal', 'Legal Director', legalDirectorActivity || []),
];

// Merge and sort all activities by timestamp (newest first)
export const combinedActivityLogs: MockActivityLog[] = [
  ...allTeamActivities,
  ...allDirectorActivities,
].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

// Get statistics
export const activityStats = {
  total: combinedActivityLogs.length,
  byType: {
    file_upload: combinedActivityLogs.filter(l => l.entity_type === 'file_upload').length,
    decision: combinedActivityLogs.filter(l => l.entity_type === 'decision').length,
    milestone: combinedActivityLogs.filter(l => l.entity_type === 'milestone').length,
    task: combinedActivityLogs.filter(l => l.entity_type === 'task').length,
    discussion: combinedActivityLogs.filter(l => l.entity_type === 'discussion').length,
  },
  bySource: {
    teams: allTeamActivities.length,
    directors: allDirectorActivities.length,
  },
};

// Filter helpers
export const getActivitiesByTeam = (teamKey: string): MockActivityLog[] => 
  combinedActivityLogs.filter(log => log.trigger_source.toLowerCase().includes(teamKey.toLowerCase()));

export const getActivitiesByDirector = (directorKey: string): MockActivityLog[] =>
  combinedActivityLogs.filter(log => log.trigger_source.toLowerCase().includes(directorKey.toLowerCase()));

export const getActivitiesByType = (type: string): MockActivityLog[] =>
  combinedActivityLogs.filter(log => log.entity_type === type);

export const getActivitiesByAgent = (agentName: string): MockActivityLog[] =>
  combinedActivityLogs.filter(log => log.agent?.name === agentName);
