import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Loader2, Zap } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import PullToRefresh from "react-pull-to-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { TaskCreationModeDialog } from "@/components/TaskCreationModeDialog";
import { BrianChatDialog } from "@/components/BrianChatDialog";
import { ManualTaskDialog } from "@/components/ManualTaskDialog";
import { EmptyState } from "@/components/EmptyState";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  automation_count: number;
  completed_automation_count: number;
  is_asap: boolean;
}

const Tasks = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [brianDialogOpen, setBrianDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchTasks();

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, navigate]);

  // Handle deep linking to specific task
  useEffect(() => {
    const taskIdParam = searchParams.get('taskId');
    if (taskIdParam && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskIdParam);
      if (task) {
        setSelectedTask(task);
        setTaskDetailOpen(true);
        // Remove query param
        navigate('/tasks', { replace: true });
      }
    }
  }, [searchParams, tasks, navigate]);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*, automation_count, completed_automation_count, is_asap")
      .eq("user_id", user.id)
      .order("is_asap", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: error.message,
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    await fetchTasks();
  }, [user]);

  const handleModeSelect = (mode: "brian" | "manual") => {
    if (mode === "brian") {
      setBrianDialogOpen(true);
    } else {
      setManualDialogOpen(true);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const { error } = await supabase
      .from("tasks")
      .update({ 
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const handlers = useSwipeable({
      onSwipedLeft: () => setSwipedTaskId(task.id),
      onSwipedRight: () => setSwipedTaskId(null),
      trackMouse: false,
    });

    return (
      <div className="relative overflow-hidden" {...handlers}>
        <Card
          className={`cursor-pointer hover:bg-accent/50 transition-all ${
            swipedTaskId === task.id ? "-translate-x-20" : "translate-x-0"
          }`}
          onClick={() => {
            setSelectedTask(task);
            setTaskDetailOpen(true);
          }}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0 md:block hidden">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`w-2 h-2 rounded-full md:hidden ${getPriorityColor(task.priority)}`} />
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {task.is_asap && (
                    <Badge variant="destructive" className="gap-1">
                      <Zap className="h-3 w-3" />
                      ASAP
                    </Badge>
                  )}
                  {task.due_date && (
                    <span className="text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  )}
                  {task.automation_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {task.completed_automation_count}/{task.automation_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {swipedTaskId === task.id && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
              setSwipedTaskId(null);
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="flex-1">
      <div className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
          </div>
          <Button onClick={() => setModeDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No tasks yet"
              description="Create your first task to start organizing your work with AI-powered automations"
              action={{
                label: "Create Task",
                onClick: () => setModeDialogOpen(true),
              }}
            />
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>

      <TaskCreationModeDialog
        open={modeDialogOpen}
        onOpenChange={setModeDialogOpen}
        onSelectMode={handleModeSelect}
      />

      <BrianChatDialog
        open={brianDialogOpen}
        onOpenChange={setBrianDialogOpen}
        onTaskCreated={fetchTasks}
      />

      <ManualTaskDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        onTaskCreated={fetchTasks}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
      />
      </div>
    </PullToRefresh>
  );
};

export default Tasks;
