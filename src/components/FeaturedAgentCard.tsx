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
    <div 
      className="group cursor-pointer transition-all duration-500 hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.16)] transition-all duration-500">
        {/* Glassmorphic card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/5 backdrop-blur-2xl border border-white/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 opacity-0 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-accent/20 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative">
          {/* Hero Image Section */}
          <div className="relative h-72 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
            
            {/* Agent Image/Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {agent.image_url ? (
                <img 
                  src={agent.image_url} 
                  alt={agent.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              ) : (
                <div className="text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-700">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Floating badge */}
            <div className="absolute top-6 right-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/50 dark:bg-white/20 rounded-full blur" />
                <Badge variant="secondary" className="relative text-xs font-semibold backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-white/30 shadow-lg px-3 py-1">
                  {agent.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Agent Details */}
          <div className="p-8 space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-2xl line-clamp-1 group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              
              <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Stats with glassmorphic background */}
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-white/50 dark:bg-white/10 rounded-full blur" />
              <div className="relative flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/30">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold">{agent.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground/60">•</span>
                <span className="text-sm font-medium text-muted-foreground/90">
                  {agent.totalReviews?.toLocaleString() || '0'} reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
