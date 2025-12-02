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
      className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/40 backdrop-blur-sm relative"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="relative p-0">
        {/* Agent Icon */}
        <div className="p-6 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center text-3xl shadow-md group-hover:shadow-xl transition-shadow transform group-hover:scale-105 duration-300">
            {agent.image_url ? (
              <img src={agent.image_url} alt={agent.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="px-6 pb-6 space-y-2">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          
          <p className="text-sm text-muted-foreground/80 line-clamp-2">
            {agent.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-muted-foreground">
              {agent.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
