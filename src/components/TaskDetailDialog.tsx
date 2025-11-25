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
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { AutomationLogsSection } from "./AutomationLogsSection";
import { AutomationChainBuilder } from "./AutomationChainBuilder";
import { AutomationEditDialog } from "./AutomationEditDialog";
import { AddAutomationDialog } from "./AddAutomationDialog";

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

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface Automation {
  id: string;
  name: string;
  action: string;
  status: string;
  trigger: string;
  progress: number;
  last_run: string | null;
  task_id: string | null;
  chain_order: number;
  agent_id: string | null;
  agent?: Agent;
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
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showAddAutomation, setShowAddAutomation] = useState(false);

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
      .select(`
        *,
        agent:agents(id, name, description, capabilities)
      `)
      .eq("task_id", task.id)
      .order("chain_order");

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

  const handleDeleteAutomation = async (automationId: string) => {
    const { error } = await supabase
      .from("automations")
      .delete()
      .eq("id", automationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Automation deleted successfully"
      });
      fetchAutomations();
    }
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

          {/* Automation Chain Builder */}
          <AutomationChainBuilder
            taskId={task.id}
            automations={automations}
            onReorder={fetchAutomations}
            onEdit={(automation) => setEditingAutomation(automation)}
            onDelete={handleDeleteAutomation}
            onAddNew={() => setShowAddAutomation(true)}
          />

          {/* Automation Logs Section */}
          <AutomationLogsSection taskId={task.id} />
        </div>

        {/* Edit Automation Dialog */}
        <AutomationEditDialog
          open={!!editingAutomation}
          onOpenChange={(open) => !open && setEditingAutomation(null)}
          automation={editingAutomation}
          onSaved={fetchAutomations}
        />

        {/* Add Automation Dialog */}
        <AddAutomationDialog
          open={showAddAutomation}
          onOpenChange={setShowAddAutomation}
          taskId={task.id}
          onAdded={fetchAutomations}
        />
      </DialogContent>
    </Dialog>
  );
};
