import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ErrorRateCardProps {
  errorRate: number;
  totalExecutions: number;
}

export const ErrorRateCard = ({ errorRate, totalExecutions }: ErrorRateCardProps) => {
  const successRate = 100 - errorRate;
  const isHealthy = errorRate < 5;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          Success Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {successRate.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground">%</span>
        </div>
        <Progress
          value={successRate}
          className="h-2 mt-3"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{Math.round((successRate / 100) * totalExecutions)} successful</span>
          <span>{Math.round((errorRate / 100) * totalExecutions)} failed</span>
        </div>
      </CardContent>
    </Card>
  );
};
