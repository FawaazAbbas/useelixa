import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Edit2, LayoutGrid, List, Bot, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { KanbanBoard, Task } from "@/components/tasks/KanbanBoard";

const AI_TOOLS = [
  { id: "search_knowledge_base", label: "Search Knowledge Base", description: "Search uploaded documents" },
  { id: "create_note", label: "Create Notes", description: "Create notes with findings" },
  { id: "create_subtask", label: "Create Subtasks", description: "Break into smaller tasks" },
  { id: "list_calendar_events", label: "Check Calendar", description: "Get calendar context" },
];

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    due_date: "",
    assigned_to: "user" as "user" | "ai",
    scheduled_at: "",
    ai_tools_allowed: [] as string[],
    ai_context: "",
  });

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Tasks realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => 
              t.id === payload.new.id ? (payload.new as Task) : t
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      toast({ title: "Error fetching tasks", description: error.message, variant: "destructive" });
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !user) return;

    const maxPosition = tasks
      .filter(t => t.status === formData.status)
      .reduce((max, t) => Math.max(max, t.position), 0);

    const taskData = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date || null,
      user_id: user.id,
      position: editingTask ? editingTask.position : maxPosition + 1,
      assigned_to: formData.assigned_to,
      scheduled_at: formData.assigned_to === "ai" && formData.scheduled_at 
        ? new Date(formData.scheduled_at).toISOString() 
        : null,
      ai_tools_allowed: formData.assigned_to === "ai" ? formData.ai_tools_allowed : [],
      ai_context: formData.assigned_to === "ai" && formData.ai_context ? formData.ai_context : null,
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
      assigned_to: (task.assigned_to === "ai" ? "ai" : "user") as "user" | "ai",
      scheduled_at: task.scheduled_at ? task.scheduled_at.slice(0, 16) : "",
      ai_tools_allowed: task.ai_tools_allowed || [],
      ai_context: task.ai_context || "",
    });
    setDialogOpen(true);
  };

  const handleTaskMove = async (taskId: string, newStatus: Task["status"], newPosition: number) => {
    // Optimistic update
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      const otherTasks = prev.filter(t => t.id !== taskId);
      const sameStatusTasks = otherTasks.filter(t => t.status === newStatus);
      
      // Insert at new position
      sameStatusTasks.splice(newPosition, 0, { ...task, status: newStatus });
      
      // Update positions
      sameStatusTasks.forEach((t, i) => {
        t.position = i;
      });

      const differentStatusTasks = otherTasks.filter(t => t.status !== newStatus);
      
      return [...differentStatusTasks, ...sameStatusTasks].map(t => 
        t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
      );
    });

    // Persist to database
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, position: newPosition })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
      fetchTasks(); // Revert on error
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: "", 
      description: "", 
      status: "todo", 
      priority: "medium", 
      due_date: "",
      assigned_to: "user",
      scheduled_at: "",
      ai_tools_allowed: [],
      ai_context: "",
    });
    setEditingTask(null);
    setDialogOpen(false);
  };

  const toggleTool = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      ai_tools_allowed: prev.ai_tools_allowed.includes(toolId)
        ? prev.ai_tools_allowed.filter(t => t !== toolId)
        : [...prev.ai_tools_allowed, toolId],
    }));
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Tasks</h1>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "list" | "kanban")}>
              <ToggleGroupItem value="kanban" aria-label="Kanban view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

                  {/* Assignment Toggle */}
                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-medium">Assign to</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.assigned_to === "user" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, assigned_to: "user" })}
                        className="flex-1"
                      >
                        Me
                      </Button>
                      <Button
                        type="button"
                        variant={formData.assigned_to === "ai" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, assigned_to: "ai" })}
                        className="flex-1 gap-2"
                      >
                        <Bot className="h-4 w-4" />
                        AI Agent
                      </Button>
                    </div>
                  </div>

                  {/* AI Configuration Panel */}
                  {formData.assigned_to === "ai" && (
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Bot className="h-4 w-4" />
                        AI Configuration
                      </div>

                      {/* Scheduled Execution */}
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          Execute at
                        </Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduled_at}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty for immediate execution when status is "To Do"
                        </p>
                      </div>

                      {/* AI Context */}
                      <div className="space-y-2">
                        <Label className="text-sm">Additional context for AI</Label>
                        <Textarea
                          placeholder="Any specific instructions or context for the AI..."
                          value={formData.ai_context}
                          onChange={(e) => setFormData({ ...formData, ai_context: e.target.value })}
                          className="text-sm min-h-[80px]"
                        />
                      </div>

                      {/* Tool Permissions */}
                      <div className="space-y-2">
                        <Label className="text-sm">AI can use these tools</Label>
                        <div className="space-y-2">
                          {AI_TOOLS.map((tool) => (
                            <div
                              key={tool.id}
                              className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={tool.id}
                                checked={formData.ai_tools_allowed.includes(tool.id)}
                                onCheckedChange={() => toggleTool(tool.id)}
                              />
                              <div className="grid gap-0.5 leading-none">
                                <label
                                  htmlFor={tool.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {tool.label}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {tool.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit}>{editingTask ? "Update" : "Create"}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
        ) : viewMode === "kanban" ? (
          <div className="max-w-6xl mx-auto">
            <KanbanBoard
              tasks={tasks}
              onTaskMove={handleTaskMove}
              onTaskEdit={handleEdit}
              onTaskDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className={task.status === "done" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-medium ${task.status === "done" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.assigned_to === "ai" && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Bot className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                          </p>
                        )}
                        {task.assigned_to === "ai" && task.scheduled_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled: {format(new Date(task.scheduled_at), "MMM d, h:mm a")}
                          </p>
                        )}
                        {task.assigned_to === "ai" && task.last_run_at && (
                          <Badge variant="secondary" className="text-xs">
                            Executed
                          </Badge>
                        )}
                      </div>
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
