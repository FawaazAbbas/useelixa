import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StarBreakdownProps {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
}

export const StarBreakdown = ({ distribution, totalReviews }: StarBreakdownProps) => {
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const starLevels = [5, 4, 3, 2, 1] as const;

  return (
    <div className="space-y-3">
      {starLevels.map((stars) => {
        const count = distribution[stars];
        const percentage = getPercentage(count);

        return (
          <div key={stars} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-12">
              <span className="text-sm font-medium">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            
            <div className="flex-1">
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
            
            <div className="w-16 text-right">
              <span className="text-sm text-muted-foreground">
                {percentage}%
              </span>
            </div>
            
            <div className="w-12 text-right">
              <span className="text-sm text-muted-foreground">
                ({count})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
