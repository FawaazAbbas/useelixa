import { useState, useEffect } from "react";
import { Bot, Clock, Play, Pause, History, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ScheduledTask {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  recurrence_pattern: string | null;
  is_recurring: boolean;
  status: string;
  ai_context: string | null;
  last_run_at?: string | null;
  next_run_at?: string | null;
}

interface TaskExecution {
  id: string;
  task_id: string;
  executed_at: string;
  status: "success" | "failed" | "running";
  result_summary: string | null;
  error_message: string | null;
}

export const ScheduledTasksPanel = () => {
  const { user } = useAuth();
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchScheduledTasks();
    }
  }, [user]);

  const fetchScheduledTasks = async () => {
    setLoading(true);
    try {
      // Fetch tasks that are either recurring or scheduled for AI
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .or("is_recurring.eq.true,and(assigned_to.eq.ai,scheduled_at.not.is.null)")
        .order("scheduled_at", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setScheduledTasks(data || []);

      // For execution history, we'll use the tasks' last_run_at field
      // since tool_usage_logs may not exist in this schema
      setExecutions([]);
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
      toast.error("Failed to load scheduled tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "recurring" ? "paused" : "recurring";
    
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task status");
    } else {
      toast.success(newStatus === "paused" ? "Task paused" : "Task resumed");
      fetchScheduledTasks();
    }
  };

  const getRecurrenceLabel = (pattern: string | null) => {
    switch (pattern) {
      case "daily": return "Daily";
      case "weekdays": return "Weekdays";
      case "weekly": return "Weekly";
      case "biweekly": return "Every 2 weeks";
      case "monthly": return "Monthly";
      default: return pattern || "One-time";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recurring":
        return <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">Active</Badge>;
      case "paused":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExecutionIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "running":
        return <AlertCircle className="h-4 w-4 text-muted-foreground animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (scheduledTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Bot className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Scheduled Tasks</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create a recurring task or assign a task to the AI with a scheduled time to see it here.
        </p>
      </div>
    );
  }

  const selectedTask = scheduledTasks.find(t => t.id === selectedTaskId);
  const taskExecutions = executions.filter(e => e.task_id === selectedTaskId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Task List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {scheduledTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTaskId === task.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {getStatusBadge(task.status)}
                        <span className="text-xs text-muted-foreground">
                          {getRecurrenceLabel(task.recurrence_pattern)}
                        </span>
                      </div>
                      {task.scheduled_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Next: {format(new Date(task.scheduled_at), "MMM d, h:mm a")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id, task.status);
                      }}
                    >
                      {task.status === "recurring" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedTaskId ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p className="text-sm text-muted-foreground">
                Select a task to view its execution history
              </p>
            </div>
          ) : taskExecutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <p className="text-sm text-muted-foreground">
                No executions yet for "{selectedTask?.title}"
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-2">
                {taskExecutions.map((exec) => (
                  <div
                    key={exec.id}
                    className="p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3">
                      {getExecutionIcon(exec.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{exec.status}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(exec.executed_at), { addSuffix: true })}
                          </span>
                        </div>
                        {exec.result_summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {exec.result_summary}
                          </p>
                        )}
                        {exec.error_message && (
                          <p className="text-xs text-destructive mt-1 line-clamp-2">
                            {exec.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
