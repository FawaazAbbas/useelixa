import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MockAgent } from "@/data/mockAgents";
import { FreeBadge } from "./FreeBadge";

interface StaffPickCardProps {
  agent: MockAgent;
}

export const StaffPickCard = ({ agent }: StaffPickCardProps) => {
  const navigate = useNavigate();
  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <Card 
      className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/20 animate-fade-in bg-gradient-to-br from-card via-card to-primary/5 hover:scale-[1.02]"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
           style={{ backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))` }} />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* Large Avatar */}
          <div className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${agent.gradient || 'from-primary to-accent'} flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:shadow-2xl group-hover:shadow-primary/50`}>
            {initial}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-2 py-0.5 text-xs">
                    ⭐ Staff Pick
                  </Badge>
                </div>
                <Badge variant="secondary" className="mb-2">
                  {agent.category}
                </Badge>
              </div>
              
              <FreeBadge />
            </div>
            
            <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2">
              {agent.description}
            </p>
            
            {/* Capabilities */}
            {agent.capabilities && (
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.capabilities.slice(0, 4).map((capability, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-muted-foreground">
                    ({agent.total_reviews.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{agent.total_installs?.toLocaleString()} installs</span>
                </div>
              </div>
              
              <Button size="sm" className="group-hover:scale-105 transition-transform w-full sm:w-auto">
                Add to Workspace
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
