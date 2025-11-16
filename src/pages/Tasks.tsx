import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional()
});

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
}

const Tasks = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

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
      .select("*, automation_count, completed_automation_count")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = taskSchema.parse(formData);

      const { error } = await supabase.from("tasks").insert([{
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority,
        due_date: validatedData.due_date || null,
        user_id: user?.id!,
        status: "pending"
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully"
      });

      setDialogOpen(false);
      setFormData({ title: "", description: "", priority: "medium", due_date: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Error creating task:", error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive"
        });
      }
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

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Tasks</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title"
                  />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description (optional)"
                  />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  setSelectedTask(task);
                  setTaskDetailOpen(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {task.due_date && (
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                          {task.automation_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {task.completed_automation_count}/{task.automation_count} automations
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
      />
    </div>
  );
};

export default Tasks;
