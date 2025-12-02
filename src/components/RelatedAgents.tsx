import { useNavigate } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAgents, MockAgent } from "@/data/mockAgents";

interface RelatedAgentsProps {
  relatedAgentIds: string[];
  currentAgentId: string;
}

export const RelatedAgents = ({ relatedAgentIds, currentAgentId }: RelatedAgentsProps) => {
  const navigate = useNavigate();

  // Get related agents, fallback to same category if no related IDs
  let relatedAgents: MockAgent[] = [];
  
  if (relatedAgentIds && relatedAgentIds.length > 0) {
    relatedAgents = mockAgents.filter(agent => 
      relatedAgentIds.includes(agent.id) && agent.id !== currentAgentId
    );
  }
  
  // If we don't have enough related agents, fill with same category
  if (relatedAgents.length < 3) {
    const currentAgent = mockAgents.find(a => a.id === currentAgentId);
    const sameCategoryAgents = mockAgents.filter(agent => 
      agent.category === currentAgent?.category && 
      agent.id !== currentAgentId &&
      !relatedAgents.find(r => r.id === agent.id)
    );
    relatedAgents = [...relatedAgents, ...sameCategoryAgents].slice(0, 3);
  }

  if (relatedAgents.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Users also installed</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/talent-pool")}
        >
          See all
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedAgents.map((agent) => (
          <Card 
            key={agent.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
            onClick={() => navigate(`/talent-pool/agent/${agent.id}`)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient || 'from-primary to-accent'} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {agent.name.charAt(0)}
                </div>
                {agent.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {agent.badge}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {agent.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {agent.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{agent.rating}</span>
                  <span>({agent.total_reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{agent.total_installs}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
