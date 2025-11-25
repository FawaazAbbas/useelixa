import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Flag, Plus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { AutomationLogsSection } from "./AutomationLogsSection";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  automation_count: number;
  completed_automation_count: number;
  created_at: string;
}

interface Automation {
  id: string;
  name: string;
  status: string;
  trigger: string;
  progress: number;
  last_run: string | null;
  task_id: string | null;
}

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskDetailDialog = ({ task, open, onOpenChange }: TaskDetailDialogProps) => {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && open) {
      fetchAutomations();
    }
  }, [task, open]);

  const fetchAutomations = async () => {
    if (!task) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("task_id", task.id);

    if (error) {
      console.error("Error fetching automations:", error);
      toast({
        title: "Error",
        description: "Failed to load automations",
        variant: "destructive",
      });
    } else {
      setAutomations(data || []);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      default:
        return "outline";
    }
  };

  const calculateProgress = () => {
    if (!task || task.automation_count === 0) return 0;
    return Math.round((task.completed_automation_count / task.automation_count) * 100);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {task.description || "No description provided"}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant={task.status === "completed" ? "secondary" : "default"}>
                {task.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details */}
          <div className="space-y-3">
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(new Date(task.due_date), "PPP")}</span>
              </div>
            )}
            
            {task.automation_count > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {task.completed_automation_count} of {task.automation_count} automations completed
                </p>
              </div>
            )}
          </div>

          {/* Automations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Automations</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Automation
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    No automations linked to this task yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {automations.map((automation) => (
                  <Card key={automation.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{automation.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Trigger: {automation.trigger}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(automation.status)}>
                            {automation.status}
                          </Badge>
                        </div>

                        {automation.progress > 0 && (
                          <div className="space-y-1">
                            <Progress value={automation.progress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground">
                              {automation.progress}% complete
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Last run:{" "}
                          {automation.last_run
                            ? formatDistanceToNow(new Date(automation.last_run), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Automation Logs Section */}
          <AutomationLogsSection taskId={task.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
