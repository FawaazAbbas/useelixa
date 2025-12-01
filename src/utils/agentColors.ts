// Agent category color mappings
export const getAgentColor = (category: string): { bg: string; text: string; icon: string } => {
  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    'Customer Service': { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: 'text-blue-500' },
    'Support': { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: 'text-blue-500' },
    'Marketing': { bg: 'bg-purple-500/20', text: 'text-purple-500', icon: 'text-purple-500' },
    'Analytics': { bg: 'bg-green-500/20', text: 'text-green-500', icon: 'text-green-500' },
    'Sales': { bg: 'bg-orange-500/20', text: 'text-orange-500', icon: 'text-orange-500' },
    'HR': { bg: 'bg-cyan-500/20', text: 'text-cyan-500', icon: 'text-cyan-500' },
    'Finance': { bg: 'bg-emerald-500/20', text: 'text-emerald-500', icon: 'text-emerald-500' },
    'Productivity': { bg: 'bg-violet-500/20', text: 'text-violet-500', icon: 'text-violet-500' },
    'Legal': { bg: 'bg-slate-500/20', text: 'text-slate-500', icon: 'text-slate-500' },
    'Research': { bg: 'bg-sky-500/20', text: 'text-sky-500', icon: 'text-sky-500' },
    'Development': { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: 'text-amber-500' },
  };
  
  return categoryColors[category] || { bg: 'bg-primary/20', text: 'text-primary', icon: 'text-primary' };
};
