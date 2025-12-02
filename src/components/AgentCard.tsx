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
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-card border-border/50"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Agent Icon */}
        <div className="p-6 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl shadow-sm">
            {agent.image_url ? (
              <img src={agent.image_url} alt={agent.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              agent.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="px-6 pb-6 space-y-2">
          <h3 className="font-semibold text-base line-clamp-1">
            {agent.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {agent.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 pt-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              {agent.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
