import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ToolExecution {
  id: string;
  tool_name: string;
  success: boolean;
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

interface ExecutionTimelineProps {
  executions: ToolExecution[];
}

export const ExecutionTimeline = ({ executions }: ExecutionTimelineProps) => {
  if (executions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Executions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">No recent tool executions</p>
        </CardContent>
      </Card>
    );
  }

  const formatToolName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Executions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {executions.map((exec) => (
            <div
              key={exec.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">
                {exec.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">
                    {formatToolName(exec.tool_name)}
                  </span>
                  <Badge variant={exec.success ? "secondary" : "destructive"} className="text-xs">
                    {exec.success ? "Success" : "Failed"}
                  </Badge>
                </div>
                {exec.error_message && (
                  <p className="text-xs text-destructive mt-1 truncate">
                    {exec.error_message}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exec.execution_time_ms}ms
                  </span>
                  <span>{format(new Date(exec.created_at), "MMM d, h:mm a")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
