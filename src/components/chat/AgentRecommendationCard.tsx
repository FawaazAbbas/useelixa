import { useNavigate } from "react-router-dom";
import { Bot, Star, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AgentRecommendationCardProps {
  agentId: string;
  agentName: string;
  description?: string;
  category?: string;
  rating?: number;
}

export const AgentRecommendationCard = ({
  agentId,
  agentName,
  description,
  category,
  rating = 4.8,
}: AgentRecommendationCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group mt-2 w-full cursor-pointer overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-3 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]"
    >
      {/* Header with sparkle */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        <span className="text-[11px] font-medium text-primary">Recommended from Talent Pool</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Agent Icon */}
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform duration-300">
          <Bot className="h-5 w-5 text-primary" />
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate">{agentName}</h4>
            {rating && (
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[11px] font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            {category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                {category}
              </Badge>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};
