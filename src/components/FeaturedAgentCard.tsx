import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeaturedAgent {
  id: string;
  name: string;
  description: string;
  rating: number;
  totalReviews?: number;
  category: string;
  image_url?: string;
}

interface FeaturedAgentCardProps {
  agent: FeaturedAgent;
}

export const FeaturedAgentCard = ({ agent }: FeaturedAgentCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agent/${agent.id}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden bg-card border-border/50"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Hero Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {agent.image_url ? (
              <img src={agent.image_url} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              agent.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Agent Details */}
        <div className="p-6 space-y-3">
          <div className="space-y-2">
            <h3 className="font-bold text-xl line-clamp-1">
              {agent.name}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {agent.description}
            </p>
          </div>

          {/* Category */}
          <Badge variant="secondary" className="text-xs">
            {agent.category}
          </Badge>

          {/* Stats */}
          <div className="flex items-center gap-1 pt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              • {agent.totalReviews?.toLocaleString() || '0'} reviews
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
