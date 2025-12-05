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

// Category visual config: gradient + icon
const categoryConfig: Record<string, { gradient: string; icon: React.ReactNode }> = {
  "Marketing & Growth": { 
    gradient: "from-rose-500 to-orange-500", 
    icon: <Megaphone className="h-8 w-8" /> 
  },
  "Customer Support": { 
    gradient: "from-emerald-500 to-teal-500", 
    icon: <Headphones className="h-8 w-8" /> 
  },
  "Sales": { 
    gradient: "from-orange-500 to-red-500", 
    icon: <Target className="h-8 w-8" /> 
  },
  "Finance": { 
    gradient: "from-green-500 to-emerald-600", 
    icon: <DollarSign className="h-8 w-8" /> 
  },
  "Operations": { 
    gradient: "from-blue-500 to-cyan-500", 
    icon: <Package className="h-8 w-8" /> 
  },
  "HR & People": { 
    gradient: "from-cyan-500 to-blue-500", 
    icon: <Users className="h-8 w-8" /> 
  },
  "Development": { 
    gradient: "from-amber-500 to-orange-500", 
    icon: <Code className="h-8 w-8" /> 
  },
  "Design & Creative": { 
    gradient: "from-pink-500 to-rose-500", 
    icon: <Palette className="h-8 w-8" /> 
  },
  "Analytics & Data": { 
    gradient: "from-purple-500 to-indigo-500", 
    icon: <BarChart3 className="h-8 w-8" /> 
  },
  "Legal & Compliance": { 
    gradient: "from-slate-500 to-gray-600", 
    icon: <Scale className="h-8 w-8" /> 
  },
  "Product": { 
    gradient: "from-violet-500 to-purple-500", 
    icon: <Smartphone className="h-8 w-8" /> 
  },
  "Project Management": { 
    gradient: "from-indigo-500 to-blue-500", 
    icon: <ClipboardList className="h-8 w-8" /> 
  },
  "Ecommerce": { 
    gradient: "from-teal-500 to-emerald-500", 
    icon: <ShoppingCart className="h-8 w-8" /> 
  },
};

const defaultConfig = { 
  gradient: "from-primary to-accent", 
  icon: <Bot className="h-8 w-8" /> 
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
      <div className="relative h-full bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1">
        {/* Agent Visual Header */}
        <div className={`relative h-28 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }} />
          </div>
          {/* Icon */}
          <div className="relative text-white/90 transform group-hover:scale-110 transition-transform duration-300">
            {config.icon}
          </div>
          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
              {agent.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {agent.short_description || agent.description}
            </p>
          </div>

          {/* Capability tags */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 2).map((capability, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground font-normal"
                >
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground font-normal"
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
