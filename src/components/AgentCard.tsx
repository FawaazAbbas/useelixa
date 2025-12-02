import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  description: string;
  rating: number;
  total_reviews: number;
  total_installs?: number;
  category: string;
  image_url: string;
}

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agent/${agent.id}`);
  };

  return (
    <div 
      className="group cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {/* Glassmorphic card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/5 backdrop-blur-xl border border-white/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 group-hover:from-primary/20 group-hover:to-accent/20 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative p-4 space-y-3">
          {/* Agent Icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 border border-white/30">
            {agent.image_url ? (
              <img src={agent.image_url} alt={agent.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Agent Info */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            
            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {agent.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 pt-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {agent.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
