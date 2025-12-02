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
      className="group cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/30 backdrop-blur-sm relative"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="relative p-0">
        {/* Hero Image with overlay */}
        <div className="relative h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            {agent.image_url ? (
              <img src={agent.image_url} alt={agent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Agent Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {agent.description}
            </p>
          </div>

          {/* Category */}
          <Badge variant="secondary" className="text-xs shadow-sm">
            {agent.category}
          </Badge>

          {/* Stats */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{agent.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground/60">•</span>
            <span className="text-sm text-muted-foreground/80">
              {agent.totalReviews?.toLocaleString() || '0'} reviews
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
