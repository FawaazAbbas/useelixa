import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MockAgent } from "@/data/mockAgents";

interface FeaturedAgentCardProps {
  agent: MockAgent;
}

export const FeaturedAgentCard = ({ agent }: FeaturedAgentCardProps) => {
  const navigate = useNavigate();
  
  const initial = agent.name.charAt(0).toUpperCase();
  
  return (
    <Card 
      className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/20 animate-fade-in bg-gradient-to-br from-card via-card to-primary/5"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{ backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))` }} />
      
      <CardContent className="relative p-8">
        <div className="flex items-start gap-6">
          {/* Large Avatar */}
          <div className={`relative flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${agent.gradient || 'from-primary to-accent'} flex items-center justify-center text-4xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:shadow-2xl group-hover:shadow-primary/50`}>
            {initial}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                <Badge variant="secondary" className="mb-2">
                  {agent.category}
                </Badge>
              </div>
              
              {agent.badge && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-3 py-1 animate-glow-pulse">
                  {agent.badge}
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {agent.description}
            </p>
            
            {/* Capabilities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {agent.capabilities?.slice(0, 4).map((capability, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({agent.total_reviews.toLocaleString()})
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${agent.price}/mo
                </div>
              </div>
              
              <Button size="lg" className="group-hover:scale-105 transition-transform">
                Install Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
