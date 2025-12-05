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
      className="group mt-3 cursor-pointer overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
    >
      {/* Header with sparkle */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span className="text-xs font-medium text-primary">Recommended from Talent Pool</span>
      </div>

      <div className="flex items-start gap-3">
        {/* Agent Icon */}
        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-300">
          <Bot className="h-6 w-6 text-primary" />
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{agentName}</h4>
            {rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {category && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0 mb-1.5 bg-primary/10 text-primary border-0">
              {category}
            </Badge>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 self-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};
