import React, { useState } from "react";
import { Star, ArrowRight, Sparkles, Bot, Megaphone, Headphones, Target, DollarSign, Package, Users, Code, Palette, BarChart3, Scale, Smartphone, ClipboardList, ShoppingCart, X, ExternalLink, Plus, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WaitlistDialog } from "@/components/WaitlistDialog";

// Category visual config matching AgentDetail page
const categoryConfig: Record<string, { 
  iconBg: string;
  icon: React.ReactNode;
}> = {
  "Marketing & Growth": { 
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    icon: <Megaphone className="h-5 w-5 text-white" /> 
  },
  "Customer Support": { 
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    icon: <Headphones className="h-5 w-5 text-white" /> 
  },
  "Sales": { 
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    icon: <Target className="h-5 w-5 text-white" /> 
  },
  "Finance": { 
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    icon: <DollarSign className="h-5 w-5 text-white" /> 
  },
  "Operations": { 
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    icon: <Package className="h-5 w-5 text-white" /> 
  },
  "HR & People": { 
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    icon: <Users className="h-5 w-5 text-white" /> 
  },
  "Development": { 
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    icon: <Code className="h-5 w-5 text-white" /> 
  },
  "Design & Creative": { 
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    icon: <Palette className="h-5 w-5 text-white" /> 
  },
  "Analytics & Data": { 
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    icon: <BarChart3 className="h-5 w-5 text-white" /> 
  },
  "Legal & Compliance": { 
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    icon: <Scale className="h-5 w-5 text-white" /> 
  },
  "Product": { 
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    icon: <Smartphone className="h-5 w-5 text-white" /> 
  },
  "Project Management": { 
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    icon: <ClipboardList className="h-5 w-5 text-white" /> 
  },
  "Ecommerce": { 
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    icon: <ShoppingCart className="h-5 w-5 text-white" /> 
  },
};

const defaultCategoryConfig = { 
  iconBg: "bg-gradient-to-br from-primary to-primary/80",
  icon: <Bot className="h-5 w-5 text-white" /> 
};

interface AgentRecommendationCardProps {
  agentId: string;
  agentName: string;
  description?: string;
  category?: string;
  rating?: number;
}

export const AgentRecommendationCard = ({
  agentId,
  agentName,
  description,
  category,
  rating = 4.8,
}: AgentRecommendationCardProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const config = category ? (categoryConfig[category] || defaultCategoryConfig) : defaultCategoryConfig;

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const handleViewFullProfile = () => {
    navigate(`/agent/${agentId}`);
  };

  const handleAddToWorkspace = () => {
    setIsDialogOpen(false);
    setIsWaitlistOpen(true);
  };

  const handleDeveloperClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWaitlistOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className="group mt-3 max-w-[85%] cursor-pointer overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-3 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
      >
        {/* Header with sparkle */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Recommended from Talent Pool</span>
        </div>

        <div className="flex items-start gap-3">
          {/* Agent Icon - matching agent details page style */}
          <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {config.icon}
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{agentName}</h4>
              {rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {category && (
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-0">
                  {category}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  by{" "}
                  <span 
                    onClick={handleDeveloperClick}
                    className="underline cursor-pointer hover:text-primary transition-colors"
                  >
                    Axlerod Agents
                  </span>
                </span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 self-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Agent Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20">
          {/* Header with gradient */}
          <div className={`${config.iconBg} p-6 relative`}>
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                {React.cloneElement(config.icon as React.ReactElement, { className: "h-8 w-8 text-white" })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{agentName}</h2>
                {category && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {category}
                    </Badge>
                    <span className="text-xs text-white/80">
                      by{" "}
                      <span 
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsWaitlistOpen(true);
                        }}
                        className="underline cursor-pointer hover:text-white transition-colors"
                      >
                        Axlerod Agents
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">rating</span>
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <h3 className="text-sm font-semibold mb-1">About</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}

            {/* Key highlights - specific capabilities */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Capabilities</h3>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Transaction categorisation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Account reconciliation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Financial reporting</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                <span>Works 24/7 in the background</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2">
              <Button 
                onClick={handleAddToWorkspace}
                className="flex-1 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Workspace
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewFullProfile}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Full Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waitlist Dialog */}
      <WaitlistDialog 
        open={isWaitlistOpen} 
        onOpenChange={setIsWaitlistOpen} 
      />
    </>
  );
};
