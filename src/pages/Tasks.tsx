import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
}

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    due_date: "",
  });

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching tasks", description: error.message, variant: "destructive" });
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !user) return;

    const taskData = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date || null,
      user_id: user.id,
    };

    if (editingTask) {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", editingTask.id);

      if (error) {
        toast({ title: "Error updating task", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Task updated" });
        fetchTasks();
      }
    } else {
      const { error } = await supabase.from("tasks").insert(taskData);

      if (error) {
        toast({ title: "Error creating task", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Task created" });
        fetchTasks();
      }
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task deleted" });
      fetchTasks();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", status: "todo", priority: "medium", due_date: "" });
    setEditingTask(null);
    setDialogOpen(false);
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo": return "secondary";
      case "in_progress": return "default";
      case "done": return "outline";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low": return "text-muted-foreground";
      case "medium": return "text-yellow-500";
      case "high": return "text-destructive";
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <header className="border-b bg-card/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Tasks</h1>
          </div>
        </header>
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to manage tasks.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Tasks</h1>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Task["status"] })}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Task["priority"] })}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingTask ? "Update" : "Create"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : tasks.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Create your first task!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className={task.status === "done" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${task.status === "done" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tasks;
