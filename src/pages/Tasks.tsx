import { useState, useEffect, useMemo } from "react";
import { CheckSquare, Plus, LayoutGrid, List, Bot, Clock, RefreshCw, CalendarClock, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/hooks/useTeam";
import { useWorkspace } from "@/hooks/useWorkspace";
import { KanbanBoard, Task, columns } from "@/components/tasks/KanbanBoard";
import { ScheduledTasksPanel } from "@/components/tasks/ScheduledTasksPanel";
import { TaskStatsHeader } from "@/components/tasks/TaskStatsHeader";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { format } from "date-fns";
import { ElixaMascot } from "@/components/ElixaMascot";

const AI_TOOLS = [
  { id: "search_knowledge_base", label: "Search Knowledge Base", description: "Search uploaded documents" },
  { id: "create_note", label: "Create Notes", description: "Create notes with findings" },
  { id: "create_subtask", label: "Create Subtasks", description: "Break into smaller tasks" },
  { id: "list_calendar_events", label: "Check Calendar", description: "Get calendar context" },
];

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { members } = useTeam();
  const { workspaceId } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "scheduled">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    due_date: "",
    assigned_to: "user" as "user" | "ai",
    assigned_user_id: "" as string,
    scheduled_at: "",
    ai_tools_allowed: [] as string[],
    ai_context: "",
    schedule: "",
    is_recurring: false,
    recurrence_pattern: "",
  });

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      t => t.title.toLowerCase().includes(query) || 
           t.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, workspaceId]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? (payload.new as Task) : t));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchTasks = async () => {
    let query = supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},and(workspace_id.is.null,user_id.eq.${user!.id})`);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error fetching tasks", description: error.message, variant: "destructive" });
    } else {
      // Map legacy "done" status to "completed"
      const mappedTasks = (data || []).map(task => ({
        ...task,
        status: task.status === "done" ? "completed" : task.status,
      })) as Task[];
      setTasks(mappedTasks);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !user) return;

    // Determine status based on recurring setting
    let finalStatus = formData.status;
    if (formData.is_recurring && formData.status !== "recurring") {
      finalStatus = "recurring";
    }

    const maxPosition = tasks
      .filter(t => t.status === finalStatus)
      .reduce((max, t) => Math.max(max, t.position), 0);

    const selectedMember = members.find(m => m.user_id === formData.assigned_user_id);
    const currentUserName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || "Me";
    const assignedName = selectedMember?.display_name || currentUserName;

    const taskData = {
      title: formData.title,
      description: formData.description || null,
      status: finalStatus,
      priority: formData.priority,
      due_date: formData.due_date || null,
      user_id: user.id,
      position: editingTask ? editingTask.position : maxPosition + 1,
      assigned_to: formData.assigned_to,
      assigned_user_id: formData.assigned_user_id || user.id,
      assigned_user_name: assignedName,
      scheduled_at: formData.assigned_to === "ai" && formData.scheduled_at 
        ? new Date(formData.scheduled_at).toISOString() : null,
      ai_tools_allowed: formData.assigned_to === "ai" ? formData.ai_tools_allowed : [],
      ai_context: formData.assigned_to === "ai" && formData.ai_context ? formData.ai_context : null,
      schedule: formData.assigned_to === "ai" && formData.schedule ? formData.schedule : null,
      is_recurring: formData.is_recurring,
      recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
    };

    if (editingTask) {
      const { error } = await supabase.from("tasks").update(taskData).eq("id", editingTask.id);
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
      assigned_user_id: task.assigned_user_id || "",
      scheduled_at: task.scheduled_at ? task.scheduled_at.slice(0, 16) : "",
      ai_tools_allowed: task.ai_tools_allowed || [],
      ai_context: task.ai_context || "",
      schedule: (task as any).schedule || "",
      is_recurring: task.is_recurring || false,
      recurrence_pattern: task.recurrence_pattern || "",
    });
    setDialogOpen(true);
  };

  const handleTaskMove = async (taskId: string, newStatus: Task["status"], newPosition: number) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      const otherTasks = prev.filter(t => t.id !== taskId);
      const sameStatusTasks = otherTasks.filter(t => t.status === newStatus);
      sameStatusTasks.splice(newPosition, 0, { ...task, status: newStatus });
      sameStatusTasks.forEach((t, i) => { t.position = i; });

      const differentStatusTasks = otherTasks.filter(t => t.status !== newStatus);
      return [...differentStatusTasks, ...sameStatusTasks].map(t => 
        t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
      );
    });

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, position: newPosition })
      .eq("id", taskId);

    if (error) {
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
      fetchTasks();
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: "", description: "", status: "todo", priority: "medium", due_date: "",
      assigned_to: "user", assigned_user_id: "", scheduled_at: "", ai_tools_allowed: [], ai_context: "", schedule: "",
      is_recurring: false, recurrence_pattern: "",
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

  if (!user) {
    return (
      <PageLayout title="Tasks" icon={CheckSquare}>
        <div className="flex flex-col items-center justify-center py-16">
          <ElixaMascot pose="pointing-right" size="lg" animation="float" className="mb-4" />
          <h3 className="text-lg font-medium mb-1">Sign in to manage tasks</h3>
          <p className="text-muted-foreground text-sm">Create and organize your tasks with our powerful task manager.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Tasks"
      icon={CheckSquare}
      badge={tasks.length}
      fullWidth
      actions={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 h-9"
            />
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "list" | "kanban" | "scheduled")}>
            <ToggleGroupItem value="kanban" aria-label="Kanban view" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-9 w-9">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="scheduled" aria-label="Scheduled view" className="h-9 w-9">
              <CalendarClock className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} size="sm">
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
                <div className="grid grid-cols-2 gap-3">
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Task["status"] })}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                      ))}
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

                {/* Recurring toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Recurring task</Label>
                      <p className="text-xs text-muted-foreground">Repeats on a schedule</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      is_recurring: checked,
                      status: checked ? "recurring" : formData.status === "recurring" ? "todo" : formData.status
                    })}
                  />
                </div>

                {formData.is_recurring && (
                  <Select 
                    value={formData.recurrence_pattern} 
                    onValueChange={(v) => setFormData({ ...formData, recurrence_pattern: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Assign to workspace member */}
                {members.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Assign to team member
                    </Label>
                    <Select
                      value={formData.assigned_user_id}
                      onValueChange={(v) => setFormData({ ...formData, assigned_user_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.display_name || member.email || "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

                {formData.assigned_to === "ai" && (
                  <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bot className="h-4 w-4" />
                      AI Configuration
                    </div>

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
                        Leave empty for immediate execution
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Additional context</Label>
                      <Textarea
                        placeholder="Instructions for the AI..."
                        value={formData.ai_context}
                        onChange={(e) => setFormData({ ...formData, ai_context: e.target.value })}
                        className="text-sm min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">AI can use</Label>
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
                              <label htmlFor={tool.id} className="text-sm font-medium cursor-pointer">
                                {tool.label}
                              </label>
                              <p className="text-xs text-muted-foreground">{tool.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingTask ? "Update" : "Create"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Stats Header - always show */}
      {!loading && <TaskStatsHeader tasks={tasks} />}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredTasks.length === 0 && tasks.length > 0 ? (
        <PageEmptyState
          icon={Search}
          title="No tasks match your search"
          description="Try adjusting your search query."
        />
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onTaskEdit={handleEdit}
          onTaskDelete={handleDelete}
        />
      ) : viewMode === "scheduled" ? (
        <ScheduledTasksPanel />
      ) : (
        <div className="space-y-2 max-w-3xl mx-auto">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEdit(task)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === "high" ? "bg-destructive" :
                    task.priority === "medium" ? "bg-primary/60" : "bg-muted-foreground"
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      {task.is_recurring && (
                        <RefreshCw className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(task.due_date), "MMM d")}
                      </p>
                    )}
                    {task.assigned_user_name && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigned_user_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.assigned_user_name && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">{task.assigned_user_name}</span>
                  )}
                  {task.assigned_to === "ai" && (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Tasks;
