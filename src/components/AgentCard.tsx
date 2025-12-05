import { Star, Download, Megaphone, Headphones, Target, DollarSign, Package, Users, Code, Palette, BarChart3, Scale, Smartphone, ClipboardList, ShoppingCart, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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

// Category visual config with explicit Tailwind classes
const categoryConfig: Record<string, { 
  tint: string;
  glow: string;
  border: string;
  iconBg: string;
  iconText: string;
  accent: string;
  icon: React.ReactNode;
}> = {
  "Marketing & Growth": { 
    tint: "bg-rose-500/10 group-hover:bg-rose-500/15",
    glow: "shadow-lg shadow-rose-500/10 group-hover:shadow-xl group-hover:shadow-rose-500/25",
    border: "border-rose-500/20 group-hover:border-rose-500/50",
    iconBg: "bg-rose-500/20 group-hover:bg-rose-500/30",
    iconText: "text-rose-500",
    accent: "bg-rose-500",
    icon: <Megaphone className="h-5 w-5" /> 
  },
  "Customer Support": { 
    tint: "bg-emerald-500/10 group-hover:bg-emerald-500/15",
    glow: "shadow-lg shadow-emerald-500/10 group-hover:shadow-xl group-hover:shadow-emerald-500/25",
    border: "border-emerald-500/20 group-hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/20 group-hover:bg-emerald-500/30",
    iconText: "text-emerald-500",
    accent: "bg-emerald-500",
    icon: <Headphones className="h-5 w-5" /> 
  },
  "Sales": { 
    tint: "bg-orange-500/10 group-hover:bg-orange-500/15",
    glow: "shadow-lg shadow-orange-500/10 group-hover:shadow-xl group-hover:shadow-orange-500/25",
    border: "border-orange-500/20 group-hover:border-orange-500/50",
    iconBg: "bg-orange-500/20 group-hover:bg-orange-500/30",
    iconText: "text-orange-500",
    accent: "bg-orange-500",
    icon: <Target className="h-5 w-5" /> 
  },
  "Finance": { 
    tint: "bg-green-500/10 group-hover:bg-green-500/15",
    glow: "shadow-lg shadow-green-500/10 group-hover:shadow-xl group-hover:shadow-green-500/25",
    border: "border-green-500/20 group-hover:border-green-500/50",
    iconBg: "bg-green-500/20 group-hover:bg-green-500/30",
    iconText: "text-green-500",
    accent: "bg-green-500",
    icon: <DollarSign className="h-5 w-5" /> 
  },
  "Operations": { 
    tint: "bg-blue-500/10 group-hover:bg-blue-500/15",
    glow: "shadow-lg shadow-blue-500/10 group-hover:shadow-xl group-hover:shadow-blue-500/25",
    border: "border-blue-500/20 group-hover:border-blue-500/50",
    iconBg: "bg-blue-500/20 group-hover:bg-blue-500/30",
    iconText: "text-blue-500",
    accent: "bg-blue-500",
    icon: <Package className="h-5 w-5" /> 
  },
  "HR & People": { 
    tint: "bg-cyan-500/10 group-hover:bg-cyan-500/15",
    glow: "shadow-lg shadow-cyan-500/10 group-hover:shadow-xl group-hover:shadow-cyan-500/25",
    border: "border-cyan-500/20 group-hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/20 group-hover:bg-cyan-500/30",
    iconText: "text-cyan-500",
    accent: "bg-cyan-500",
    icon: <Users className="h-5 w-5" /> 
  },
  "Development": { 
    tint: "bg-amber-500/10 group-hover:bg-amber-500/15",
    glow: "shadow-lg shadow-amber-500/10 group-hover:shadow-xl group-hover:shadow-amber-500/25",
    border: "border-amber-500/20 group-hover:border-amber-500/50",
    iconBg: "bg-amber-500/20 group-hover:bg-amber-500/30",
    iconText: "text-amber-500",
    accent: "bg-amber-500",
    icon: <Code className="h-5 w-5" /> 
  },
  "Design & Creative": { 
    tint: "bg-pink-500/10 group-hover:bg-pink-500/15",
    glow: "shadow-lg shadow-pink-500/10 group-hover:shadow-xl group-hover:shadow-pink-500/25",
    border: "border-pink-500/20 group-hover:border-pink-500/50",
    iconBg: "bg-pink-500/20 group-hover:bg-pink-500/30",
    iconText: "text-pink-500",
    accent: "bg-pink-500",
    icon: <Palette className="h-5 w-5" /> 
  },
  "Analytics & Data": { 
    tint: "bg-purple-500/10 group-hover:bg-purple-500/15",
    glow: "shadow-lg shadow-purple-500/10 group-hover:shadow-xl group-hover:shadow-purple-500/25",
    border: "border-purple-500/20 group-hover:border-purple-500/50",
    iconBg: "bg-purple-500/20 group-hover:bg-purple-500/30",
    iconText: "text-purple-500",
    accent: "bg-purple-500",
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  "Legal & Compliance": { 
    tint: "bg-slate-500/10 group-hover:bg-slate-500/15",
    glow: "shadow-lg shadow-slate-500/10 group-hover:shadow-xl group-hover:shadow-slate-500/25",
    border: "border-slate-500/20 group-hover:border-slate-500/50",
    iconBg: "bg-slate-500/20 group-hover:bg-slate-500/30",
    iconText: "text-slate-500",
    accent: "bg-slate-500",
    icon: <Scale className="h-5 w-5" /> 
  },
  "Product": { 
    tint: "bg-violet-500/10 group-hover:bg-violet-500/15",
    glow: "shadow-lg shadow-violet-500/10 group-hover:shadow-xl group-hover:shadow-violet-500/25",
    border: "border-violet-500/20 group-hover:border-violet-500/50",
    iconBg: "bg-violet-500/20 group-hover:bg-violet-500/30",
    iconText: "text-violet-500",
    accent: "bg-violet-500",
    icon: <Smartphone className="h-5 w-5" /> 
  },
  "Project Management": { 
    tint: "bg-indigo-500/10 group-hover:bg-indigo-500/15",
    glow: "shadow-lg shadow-indigo-500/10 group-hover:shadow-xl group-hover:shadow-indigo-500/25",
    border: "border-indigo-500/20 group-hover:border-indigo-500/50",
    iconBg: "bg-indigo-500/20 group-hover:bg-indigo-500/30",
    iconText: "text-indigo-500",
    accent: "bg-indigo-500",
    icon: <ClipboardList className="h-5 w-5" /> 
  },
  "Ecommerce": { 
    tint: "bg-teal-500/10 group-hover:bg-teal-500/15",
    glow: "shadow-lg shadow-teal-500/10 group-hover:shadow-xl group-hover:shadow-teal-500/25",
    border: "border-teal-500/20 group-hover:border-teal-500/50",
    iconBg: "bg-teal-500/20 group-hover:bg-teal-500/30",
    iconText: "text-teal-500",
    accent: "bg-teal-500",
    icon: <ShoppingCart className="h-5 w-5" /> 
  },
};

const defaultConfig = { 
  tint: "bg-primary/10 group-hover:bg-primary/15",
  glow: "shadow-lg shadow-primary/10 group-hover:shadow-xl group-hover:shadow-primary/25",
  border: "border-primary/20 group-hover:border-primary/50",
  iconBg: "bg-primary/20 group-hover:bg-primary/30",
  iconText: "text-primary",
  accent: "bg-primary",
  icon: <Bot className="h-5 w-5" /> 
};

export const AgentCard = ({ agent }: AgentCardProps) => {
  const navigate = useNavigate();
  const config = categoryConfig[agent.category] || defaultConfig;

  const handleClick = () => {
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
      <div className={`relative h-full rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 border bg-card ${config.tint} ${config.glow} ${config.border}`}>
        {/* Accent line at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${config.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />
        
        {/* Content */}
        <div className="p-4 pt-5 space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:scale-110 ${config.iconBg}`}>
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
                  className="text-[10px] px-1.5 py-0 h-5 bg-background/50 text-muted-foreground font-normal"
                >
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-background/50 text-muted-foreground font-normal"
                >
                  +{agent.capabilities.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
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
