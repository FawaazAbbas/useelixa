import { Star, Download, Megaphone, Headphones, Target, DollarSign, Package, Users, Code, Palette, BarChart3, Scale, Smartphone, ClipboardList, ShoppingCart, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { trackAgentView } from "@/utils/analytics";

interface Agent {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  rating: number;
  total_reviews: number;
  total_installs?: number;
  category: string;
  image_url: string;
  capabilities?: string[];
}

interface AgentCardProps {
  agent: Agent;
}

// Category visual config with vibrant colors
const categoryConfig: Record<string, { 
  glow: string;
  border: string;
  iconBg: string;
  iconText: string;
  accent: string;
  gradientFrom: string;
  icon: React.ReactNode;
}> = {
  "Marketing & Growth": { 
    glow: "shadow-lg shadow-rose-500/20 group-hover:shadow-2xl group-hover:shadow-rose-500/40",
    border: "border-rose-500/30 group-hover:border-rose-500/60",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    iconText: "text-white",
    accent: "from-rose-500 to-pink-600",
    gradientFrom: "from-rose-500/10 via-transparent",
    icon: <Megaphone className="h-5 w-5" /> 
  },
  "Customer Support": { 
    glow: "shadow-lg shadow-emerald-500/20 group-hover:shadow-2xl group-hover:shadow-emerald-500/40",
    border: "border-emerald-500/30 group-hover:border-emerald-500/60",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    iconText: "text-white",
    accent: "from-emerald-500 to-teal-600",
    gradientFrom: "from-emerald-500/10 via-transparent",
    icon: <Headphones className="h-5 w-5" /> 
  },
  "Sales": { 
    glow: "shadow-lg shadow-orange-500/20 group-hover:shadow-2xl group-hover:shadow-orange-500/40",
    border: "border-orange-500/30 group-hover:border-orange-500/60",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    iconText: "text-white",
    accent: "from-orange-500 to-amber-600",
    gradientFrom: "from-orange-500/10 via-transparent",
    icon: <Target className="h-5 w-5" /> 
  },
  "Finance": { 
    glow: "shadow-lg shadow-green-500/20 group-hover:shadow-2xl group-hover:shadow-green-500/40",
    border: "border-green-500/30 group-hover:border-green-500/60",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    iconText: "text-white",
    accent: "from-green-500 to-emerald-600",
    gradientFrom: "from-green-500/10 via-transparent",
    icon: <DollarSign className="h-5 w-5" /> 
  },
  "Operations": { 
    glow: "shadow-lg shadow-blue-500/20 group-hover:shadow-2xl group-hover:shadow-blue-500/40",
    border: "border-blue-500/30 group-hover:border-blue-500/60",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    iconText: "text-white",
    accent: "from-blue-500 to-indigo-600",
    gradientFrom: "from-blue-500/10 via-transparent",
    icon: <Package className="h-5 w-5" /> 
  },
  "HR & People": { 
    glow: "shadow-lg shadow-cyan-500/20 group-hover:shadow-2xl group-hover:shadow-cyan-500/40",
    border: "border-cyan-500/30 group-hover:border-cyan-500/60",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconText: "text-white",
    accent: "from-cyan-500 to-blue-600",
    gradientFrom: "from-cyan-500/10 via-transparent",
    icon: <Users className="h-5 w-5" /> 
  },
  "Development": { 
    glow: "shadow-lg shadow-amber-500/20 group-hover:shadow-2xl group-hover:shadow-amber-500/40",
    border: "border-amber-500/30 group-hover:border-amber-500/60",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    iconText: "text-white",
    accent: "from-amber-500 to-orange-600",
    gradientFrom: "from-amber-500/10 via-transparent",
    icon: <Code className="h-5 w-5" /> 
  },
  "Design & Creative": { 
    glow: "shadow-lg shadow-pink-500/20 group-hover:shadow-2xl group-hover:shadow-pink-500/40",
    border: "border-pink-500/30 group-hover:border-pink-500/60",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    iconText: "text-white",
    accent: "from-pink-500 to-rose-600",
    gradientFrom: "from-pink-500/10 via-transparent",
    icon: <Palette className="h-5 w-5" /> 
  },
  "Analytics & Data": { 
    glow: "shadow-lg shadow-purple-500/20 group-hover:shadow-2xl group-hover:shadow-purple-500/40",
    border: "border-purple-500/30 group-hover:border-purple-500/60",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    iconText: "text-white",
    accent: "from-purple-500 to-violet-600",
    gradientFrom: "from-purple-500/10 via-transparent",
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  "Legal & Compliance": { 
    glow: "shadow-lg shadow-slate-500/20 group-hover:shadow-2xl group-hover:shadow-slate-500/40",
    border: "border-slate-500/30 group-hover:border-slate-500/60",
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    iconText: "text-white",
    accent: "from-slate-500 to-gray-600",
    gradientFrom: "from-slate-500/10 via-transparent",
    icon: <Scale className="h-5 w-5" /> 
  },
  "Product": { 
    glow: "shadow-lg shadow-violet-500/20 group-hover:shadow-2xl group-hover:shadow-violet-500/40",
    border: "border-violet-500/30 group-hover:border-violet-500/60",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    iconText: "text-white",
    accent: "from-violet-500 to-purple-600",
    gradientFrom: "from-violet-500/10 via-transparent",
    icon: <Smartphone className="h-5 w-5" /> 
  },
  "Project Management": { 
    glow: "shadow-lg shadow-indigo-500/20 group-hover:shadow-2xl group-hover:shadow-indigo-500/40",
    border: "border-indigo-500/30 group-hover:border-indigo-500/60",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    iconText: "text-white",
    accent: "from-indigo-500 to-blue-600",
    gradientFrom: "from-indigo-500/10 via-transparent",
    icon: <ClipboardList className="h-5 w-5" /> 
  },
  "Ecommerce": { 
    glow: "shadow-lg shadow-teal-500/20 group-hover:shadow-2xl group-hover:shadow-teal-500/40",
    border: "border-teal-500/30 group-hover:border-teal-500/60",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    iconText: "text-white",
    accent: "from-teal-500 to-cyan-600",
    gradientFrom: "from-teal-500/10 via-transparent",
    icon: <ShoppingCart className="h-5 w-5" /> 
  },
};

const defaultConfig = { 
  glow: "shadow-lg shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/40",
  border: "border-primary/30 group-hover:border-primary/60",
  iconBg: "bg-gradient-to-br from-primary to-primary/80",
  iconText: "text-primary-foreground",
  accent: "from-primary to-primary/80",
  gradientFrom: "from-primary/10 via-transparent",
  icon: <Bot className="h-5 w-5" /> 
};

export const AgentCard = ({ agent }: AgentCardProps) => {
  const navigate = useNavigate();
  const config = categoryConfig[agent.category] || defaultConfig;

  const handleClick = () => {
    trackAgentView(agent.name, agent.category);
    navigate(`/agent/${agent.id}`);
  };

  const formatInstalls = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div 
      className="group cursor-pointer h-full"
      onClick={handleClick}
    >
      <div className={`relative h-full rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 border bg-card ${config.glow} ${config.border}`}>
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
        
        {/* Content */}
        <div className="relative p-4 pt-5 space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${config.iconBg}`}>
              <span className={config.iconText}>{config.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {agent.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {agent.short_description || agent.description}
          </p>

          {/* Capability tags */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 2).map((capability, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground font-normal border border-border/50"
                >
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground font-normal border border-border/50"
                >
                  +{agent.capabilities.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{agent.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({agent.total_reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-3 w-3" />
              <span className="text-xs">{formatInstalls(agent.total_installs)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
