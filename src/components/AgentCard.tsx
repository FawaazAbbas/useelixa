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

// Category visual config: tint color + icon
const categoryConfig: Record<string, { tint: string; icon: React.ReactNode }> = {
  "Marketing & Growth": { 
    tint: "bg-rose-500/5 hover:bg-rose-500/10", 
    icon: <Megaphone className="h-5 w-5 text-rose-500" /> 
  },
  "Customer Support": { 
    tint: "bg-emerald-500/5 hover:bg-emerald-500/10", 
    icon: <Headphones className="h-5 w-5 text-emerald-500" /> 
  },
  "Sales": { 
    tint: "bg-orange-500/5 hover:bg-orange-500/10", 
    icon: <Target className="h-5 w-5 text-orange-500" /> 
  },
  "Finance": { 
    tint: "bg-green-500/5 hover:bg-green-500/10", 
    icon: <DollarSign className="h-5 w-5 text-green-500" /> 
  },
  "Operations": { 
    tint: "bg-blue-500/5 hover:bg-blue-500/10", 
    icon: <Package className="h-5 w-5 text-blue-500" /> 
  },
  "HR & People": { 
    tint: "bg-cyan-500/5 hover:bg-cyan-500/10", 
    icon: <Users className="h-5 w-5 text-cyan-500" /> 
  },
  "Development": { 
    tint: "bg-amber-500/5 hover:bg-amber-500/10", 
    icon: <Code className="h-5 w-5 text-amber-500" /> 
  },
  "Design & Creative": { 
    tint: "bg-pink-500/5 hover:bg-pink-500/10", 
    icon: <Palette className="h-5 w-5 text-pink-500" /> 
  },
  "Analytics & Data": { 
    tint: "bg-purple-500/5 hover:bg-purple-500/10", 
    icon: <BarChart3 className="h-5 w-5 text-purple-500" /> 
  },
  "Legal & Compliance": { 
    tint: "bg-slate-500/5 hover:bg-slate-500/10", 
    icon: <Scale className="h-5 w-5 text-slate-500" /> 
  },
  "Product": { 
    tint: "bg-violet-500/5 hover:bg-violet-500/10", 
    icon: <Smartphone className="h-5 w-5 text-violet-500" /> 
  },
  "Project Management": { 
    tint: "bg-indigo-500/5 hover:bg-indigo-500/10", 
    icon: <ClipboardList className="h-5 w-5 text-indigo-500" /> 
  },
  "Ecommerce": { 
    tint: "bg-teal-500/5 hover:bg-teal-500/10", 
    icon: <ShoppingCart className="h-5 w-5 text-teal-500" /> 
  },
};

const defaultConfig = { 
  tint: "bg-primary/5 hover:bg-primary/10", 
  icon: <Bot className="h-5 w-5 text-primary" /> 
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
      <div className={`relative h-full rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 ${config.tint}`}>
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/30">
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