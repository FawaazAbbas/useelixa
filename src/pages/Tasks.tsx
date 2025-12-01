import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Zap, Search, Filter } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TaskCreationModeDialog } from "@/components/TaskCreationModeDialog";
import { BrianChatDialog } from "@/components/BrianChatDialog";
import { ManualTaskDialog } from "@/components/ManualTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  is_asap: boolean | null;
  automation_count: number | null;
  completed_automation_count: number | null;
  created_at: string;
}

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  
  // Dialog states
  const [showCreationModeDialog, setShowCreationModeDialog] = useState(false);
  const [showBrianChat, setShowBrianChat] = useState(false);
  const [showManualTask, setShowManualTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchTasks();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel("tasks-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      // Apply sorting
      const [sortField, sortOrder] = sortBy.split("-");
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const completed_at = newStatus === "completed" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } else {
      fetchTasks();
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskToDelete);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } else {
      fetchTasks();
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    }
    
    setTaskToDelete(null);
    setSwipedTaskId(null);
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

  const handleTaskCreated = () => {
    fetchTasks();
    setShowBrianChat(false);
    setShowManualTask(false);
  };

  const handleSelectCreationMode = (mode: "brian" | "manual") => {
    if (mode === "brian") {
      setShowBrianChat(true);
    } else {
      setShowManualTask(true);
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const filterTasks = (tasksToFilter: Task[]) => {
    return tasksToFilter.filter(task => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      // Tab filter
      let matchesTab = true;
      if (activeTab === "active") matchesTab = task.status === "pending";
      else if (activeTab === "completed") matchesTab = task.status === "completed";
      else if (activeTab === "asap") matchesTab = task.is_asap === true;

      return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    });
  };

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
          onClick={() => openTaskDetail(task)}
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
                        setTaskToDelete(task.id);
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
                  {task.automation_count && task.automation_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {task.completed_automation_count}/{task.automation_count} automations
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
              setTaskToDelete(task.id);
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  };

  const filteredTasks = filterTasks(tasks);

  return (
    <div className="flex-1 w-full overflow-y-auto">
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
          </div>
          <Button onClick={() => setShowCreationModeDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="due_date-asc">Due Date</SelectItem>
                <SelectItem value="priority-desc">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="asap">ASAP</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <LoadingSkeleton count={3} />
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                icon="📋"
                title={searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? "No tasks found" : "No tasks yet"}
                description={
                  searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first task to start organizing your work with AI-powered automations"
                }
                action={{
                  label: "Create Task",
                  onClick: () => setShowCreationModeDialog(true),
                }}
              />
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <TaskCreationModeDialog
        open={showCreationModeDialog}
        onOpenChange={setShowCreationModeDialog}
        onSelectMode={handleSelectCreationMode}
      />

      <BrianChatDialog
        open={showBrianChat}
        onOpenChange={setShowBrianChat}
        onTaskCreated={handleTaskCreated}
      />

      <ManualTaskDialog
        open={showManualTask}
        onOpenChange={setShowManualTask}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={showTaskDetail}
        onOpenChange={(open) => {
          setShowTaskDetail(open);
          if (!open) {
            setSelectedTask(null);
            fetchTasks(); // Refresh after editing
          }
        }}
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone and will also delete all associated automations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
