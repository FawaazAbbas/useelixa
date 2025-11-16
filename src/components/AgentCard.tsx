import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  total_reviews: number;
  category: string;
  image_url: string;
}

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {
  const navigate = useNavigate();

  // Generate a gradient background based on the agent name
  const getGradient = (name: string) => {
    const gradients = [
      "from-blue-500/10 to-purple-500/10",
      "from-green-500/10 to-teal-500/10",
      "from-orange-500/10 to-red-500/10",
      "from-pink-500/10 to-purple-500/10",
      "from-cyan-500/10 to-blue-500/10",
      "from-yellow-500/10 to-orange-500/10",
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <div className={`h-40 bg-gradient-to-br ${getGradient(agent.name)} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
          {agent.name.charAt(0)}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {agent.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {agent.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{agent.rating}</span>
            <span className="text-muted-foreground">({agent.total_reviews})</span>
          </div>
          <div className="text-xl font-bold text-primary">
            ${agent.price}
          </div>
        </div>
      </div>
    </Card>
  );
};
