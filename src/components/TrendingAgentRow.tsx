import { Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MockAgent } from "@/data/mockAgents";
import { Badge } from "@/components/ui/badge";

interface TrendingAgentRowProps {
  agent: MockAgent;
  rank: number;
}

export const TrendingAgentRow = ({ agent, rank }: TrendingAgentRowProps) => {
  const navigate = useNavigate();
  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <div 
      className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      {/* Rank Badge */}
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
        #{rank}
      </div>
      
      {/* Avatar */}
      <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${agent.gradient || 'from-primary to-accent'} flex items-center justify-center text-lg md:text-xl font-bold text-white group-hover:scale-110 transition-transform`}>
        {initial}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors truncate">
          {agent.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {agent.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{agent.rating}</span>
          </div>
        </div>
      </div>
      
      {/* Trending Icon */}
      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse flex-shrink-0" />
    </div>
  );
};
