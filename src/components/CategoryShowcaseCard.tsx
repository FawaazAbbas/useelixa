import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CategoryShowcaseCardProps {
  name: string;
  icon: string;
  count: number;
  description: string;
  topAgents?: { id: string; name: string; image_url: string }[];
}

export const CategoryShowcaseCard = ({ 
  name, 
  icon, 
  count, 
  description,
  topAgents = []
}: CategoryShowcaseCardProps) => {
  const navigate = useNavigate();
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Card 
      className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:scale-105"
      onClick={() => navigate(`/talent-pool/category/${slug}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        {/* Icon & Count */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <Badge variant="secondary" className="text-sm">
            {count} agents
          </Badge>
        </div>
        
        {/* Title & Description */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Top Agents Preview */}
        {topAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {topAgents.slice(0, 3).map((agent, idx) => (
                <div 
                  key={agent.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border-2 border-background"
                  style={{ zIndex: 3 - idx }}
                >
                  {agent.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Popular in category</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
