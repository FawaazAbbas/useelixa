import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  workflow_json?: any;
  is_workflow_based?: boolean;
}

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {
  const navigate = useNavigate();
  
  // Check if agent has AI capabilities
  const hasAICapabilities = agent.is_workflow_based && 
    agent.workflow_json && 
    typeof agent.workflow_json === 'object' && 
    'nodes' in agent.workflow_json && 
    Array.isArray(agent.workflow_json.nodes) && 
    agent.workflow_json.nodes.some((node: any) => node.type === 'n8n-nodes-base.openAi');

  // Generate gradient based on agent name
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 1.618) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 60%))`;
  };

  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <Card 
      className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/10 animate-fade-in bg-card/50 backdrop-blur-sm"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Gradient header with avatar */}
      <div className="relative h-28 overflow-hidden" style={{ background: getGradient(agent.name) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="w-14 h-14 rounded-xl bg-background/95 backdrop-blur-md flex items-center justify-center text-xl font-bold shadow-xl border-2 border-white/20 group-hover:scale-110 transition-transform duration-300">
            {initial}
          </div>
          {hasAICapabilities && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white shadow-lg animate-glow-pulse">
              AI Powered
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1 flex-1">
            {agent.name}
          </h3>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {agent.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {agent.description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">{agent.rating}</span>
            <span className="text-xs text-muted-foreground">({agent.total_reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${agent.price}
            </span>
            <span className="text-xs text-muted-foreground">/mo</span>
          </div>
        </div>
        
        {/* Hover action buttons */}
        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 translate-y-2 group-hover:translate-y-0">
          <Button size="sm" className="flex-1 shadow-lg" onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.id}`); }}>
            View Details
          </Button>
        </div>
      </CardContent>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </Card>
  );
};
