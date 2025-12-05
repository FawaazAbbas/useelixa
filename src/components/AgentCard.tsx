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

// Category visual config: tint, glow, border gradient + icon
const categoryConfig: Record<string, { tint: string; glow: string; borderGradient: string; iconBg: string; icon: React.ReactNode }> = {
  "Marketing & Growth": { 
    tint: "bg-rose-500/5", 
    glow: "group-hover:shadow-rose-500/20",
    borderGradient: "group-hover:border-rose-500/40",
    iconBg: "bg-rose-500/10 group-hover:bg-rose-500/20",
    icon: <Megaphone className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" /> 
  },
  "Customer Support": { 
    tint: "bg-emerald-500/5", 
    glow: "group-hover:shadow-emerald-500/20",
    borderGradient: "group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    icon: <Headphones className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" /> 
  },
  "Sales": { 
    tint: "bg-orange-500/5", 
    glow: "group-hover:shadow-orange-500/20",
    borderGradient: "group-hover:border-orange-500/40",
    iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
    icon: <Target className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" /> 
  },
  "Finance": { 
    tint: "bg-green-500/5", 
    glow: "group-hover:shadow-green-500/20",
    borderGradient: "group-hover:border-green-500/40",
    iconBg: "bg-green-500/10 group-hover:bg-green-500/20",
    icon: <DollarSign className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" /> 
  },
  "Operations": { 
    tint: "bg-blue-500/5", 
    glow: "group-hover:shadow-blue-500/20",
    borderGradient: "group-hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    icon: <Package className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" /> 
  },
  "HR & People": { 
    tint: "bg-cyan-500/5", 
    glow: "group-hover:shadow-cyan-500/20",
    borderGradient: "group-hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    icon: <Users className="h-5 w-5 text-cyan-500 group-hover:scale-110 transition-transform" /> 
  },
  "Development": { 
    tint: "bg-amber-500/5", 
    glow: "group-hover:shadow-amber-500/20",
    borderGradient: "group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    icon: <Code className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" /> 
  },
  "Design & Creative": { 
    tint: "bg-pink-500/5", 
    glow: "group-hover:shadow-pink-500/20",
    borderGradient: "group-hover:border-pink-500/40",
    iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    icon: <Palette className="h-5 w-5 text-pink-500 group-hover:scale-110 transition-transform" /> 
  },
  "Analytics & Data": { 
    tint: "bg-purple-500/5", 
    glow: "group-hover:shadow-purple-500/20",
    borderGradient: "group-hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    icon: <BarChart3 className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" /> 
  },
  "Legal & Compliance": { 
    tint: "bg-slate-500/5", 
    glow: "group-hover:shadow-slate-500/20",
    borderGradient: "group-hover:border-slate-500/40",
    iconBg: "bg-slate-500/10 group-hover:bg-slate-500/20",
    icon: <Scale className="h-5 w-5 text-slate-500 group-hover:scale-110 transition-transform" /> 
  },
  "Product": { 
    tint: "bg-violet-500/5", 
    glow: "group-hover:shadow-violet-500/20",
    borderGradient: "group-hover:border-violet-500/40",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
    icon: <Smartphone className="h-5 w-5 text-violet-500 group-hover:scale-110 transition-transform" /> 
  },
  "Project Management": { 
    tint: "bg-indigo-500/5", 
    glow: "group-hover:shadow-indigo-500/20",
    borderGradient: "group-hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    icon: <ClipboardList className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" /> 
  },
  "Ecommerce": { 
    tint: "bg-teal-500/5", 
    glow: "group-hover:shadow-teal-500/20",
    borderGradient: "group-hover:border-teal-500/40",
    iconBg: "bg-teal-500/10 group-hover:bg-teal-500/20",
    icon: <ShoppingCart className="h-5 w-5 text-teal-500 group-hover:scale-110 transition-transform" /> 
  },
};

const defaultConfig = { 
  tint: "bg-primary/5", 
  glow: "group-hover:shadow-primary/20",
  borderGradient: "group-hover:border-primary/40",
  iconBg: "bg-primary/10 group-hover:bg-primary/20",
  icon: <Bot className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" /> 
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
      <div className={`relative h-full rounded-xl border border-border/30 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 ${config.tint} ${config.glow} ${config.borderGradient}`}>
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl backdrop-blur-sm border border-border/20 transition-all duration-300 ${config.iconBg}`}>
              {config.icon}
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
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
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