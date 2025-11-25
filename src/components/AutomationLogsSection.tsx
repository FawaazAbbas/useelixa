import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AutomationLog {
  id: string;
  automation_id: string;
  executed_at: string;
  status: "success" | "failed" | "partial" | "pending";
  output_data: any;
  error_message: string | null;
  execution_time_ms: number | null;
  automation: {
    name: string;
  };
}

interface AutomationLogsSectionProps {
  taskId: string;
}

export const AutomationLogsSection = ({ taskId }: AutomationLogsSectionProps) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel(`automation_logs_${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "automation_logs",
          filter: `task_id=eq.${taskId}`
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("automation_logs")
      .select(`
        *,
        automation:automations(name)
      `)
      .eq("task_id", taskId)
      .order("executed_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to load automation logs",
        variant: "destructive"
      });
    } else {
      setLogs(data as any || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: "default",
      failed: "destructive",
      partial: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Logs & Issues</CardTitle>
        <CardDescription>
          Execution history and error reports for all automations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No automation logs yet. Automations will appear here once they run.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getStatusIcon(log.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {log.automation?.name || "Unknown Automation"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.status)}
                          {log.execution_time_ms && (
                            <Badge variant="outline" className="text-xs">
                              {log.execution_time_ms}ms
                            </Badge>
                          )}
                        </div>
                      </div>

                      {log.error_message && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-xs font-medium text-destructive mb-1">Error:</p>
                          <p className="text-xs text-destructive/80">{log.error_message}</p>
                        </div>
                      )}

                      {log.output_data && (
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-xs font-medium mb-1">Output:</p>
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(log.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
