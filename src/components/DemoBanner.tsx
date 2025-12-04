import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DemoBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Demo Mode - Exploring Elixa's capabilities
            </p>
            <p className="text-xs text-muted-foreground">
              Changes won't be saved • Real agents available in AI Talent Pool
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate("/talent-pool")}
          className="whitespace-nowrap"
        >
          View AI Talent Pool
        </Button>
      </div>
    </div>
  );
};
