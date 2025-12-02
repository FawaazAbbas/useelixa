import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Collection } from "@/data/mockCollections";
import { mockAgents } from "@/data/mockAgents";

interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
  const navigate = useNavigate();
  const agents = mockAgents.filter(a => collection.agentIds.includes(a.id));

  return (
    <Card 
      className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${collection.gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg`}>
            {collection.icon}
          </div>
          <Badge variant="secondary" className="text-sm">
            {collection.agentIds.length} agents
          </Badge>
        </div>
        
        {/* Title & Description */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {collection.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {collection.description}
        </p>
        
        {/* Agent Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {agents.slice(0, 5).map((agent, idx) => (
              <div 
                key={agent.id}
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-sm font-bold border-2 border-background`}
                style={{ zIndex: 5 - idx }}
              >
                {agent.name.charAt(0)}
              </div>
            ))}
          </div>
          <Button 
            size="sm" 
            className="group-hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to filtered view with these agents
              navigate('/talent-pool');
            }}
          >
            View Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
