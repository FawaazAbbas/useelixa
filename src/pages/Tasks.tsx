import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Zap, Search, Filter, Calendar } from "lucide-react";
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
import { DemoBanner } from "@/components/DemoBanner";
import { TaskCreationModeDialog } from "@/components/TaskCreationModeDialog";
import { BrianChatDialog } from "@/components/BrianChatDialog";
import { ManualTaskDialog } from "@/components/ManualTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { mockTasks, MockTask } from "@/data/mockTasks";
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

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Dialog states
  const [showCreationModeDialog, setShowCreationModeDialog] = useState(false);
  const [showBrianChat, setShowBrianChat] = useState(false);
  const [showManualTask, setShowManualTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [activeTab, setActiveTab] = useState<string>("all");

  const toggleTaskComplete = (taskId: string, currentStatus: string | null) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: currentStatus === "completed" ? "pending" : "completed" }
        : task
    ));
    toast({
      title: "Demo Mode",
      description: "Task status updated (changes won't be saved)",
    });
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    
    setTasks(tasks.filter(task => task.id !== taskToDelete));
    toast({
      title: "Demo Mode",
      description: "Task removed (changes won't be saved)",
    });
    
    setTaskToDelete(null);
    setSwipedTaskId(null);
  };

  const getPriorityBadgeColor = (priority: string | null) => {
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

  const handleSelectCreationMode = (mode: "brian" | "manual") => {
    if (mode === "brian") {
      setShowBrianChat(true);
    } else {
      setShowManualTask(true);
    }
  };

  const handleTaskCreated = () => {
    toast({
      title: "Demo Mode",
      description: "Task creation disabled in demo mode",
    });
    setShowBrianChat(false);
    setShowManualTask(false);
  };

  const openTaskDetail = (task: MockTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const filterTasks = (tasksToFilter: MockTask[]) => {
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

  const TaskCard = ({ task }: { task: MockTask }) => {
    const handlers = useSwipeable({
      onSwipedLeft: () => setSwipedTaskId(task.id),
      onSwipedRight: () => setSwipedTaskId(null),
      trackMouse: false,
    });

    const isCompleted = task.status === "completed";

    return (
      <div className="relative overflow-hidden animate-fade-in" {...handlers}>
        <Card
          className={`group cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 ${
            swipedTaskId === task.id ? "-translate-x-20" : "translate-x-0"
          } ${
            task.priority === "high" 
              ? "border-l-red-500" 
              : task.priority === "medium" 
              ? "border-l-yellow-500" 
              : "border-l-green-500"
          } ${isCompleted ? "opacity-60" : ""}`}
          onClick={() => openTaskDetail(task)}
        >
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 transition-transform hover:scale-110"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base transition-all ${
                      isCompleted 
                        ? "line-through text-muted-foreground" 
                        : "text-foreground group-hover:text-primary"
                    }`}>
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={getPriorityBadgeColor(task.priority)} className="hidden md:flex">
                      {task.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 hidden md:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {task.is_asap && (
                    <Badge variant="destructive" className="gap-1 animate-pulse">
                      <Zap className="h-3 w-3" />
                      ASAP
                    </Badge>
                  )}
                  {task.due_date && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </Badge>
                  )}
                  {task.automation_count && task.automation_count > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <span className="font-medium">{task.completed_automation_count}/{task.automation_count}</span>
                      <span className="text-muted-foreground">automations</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="md:hidden">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {swipedTaskId === task.id && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full shadow-lg animate-scale-in"
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
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      <div className="p-4 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckSquare className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreationModeDialog(true)} 
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10">
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
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10">
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
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-12 bg-muted/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow">
              All
              <Badge variant="secondary" className="ml-2 text-xs">
                {tasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-background data-[state=active]:shadow">
              Active
              <Badge variant="secondary" className="ml-2 text-xs">
                {tasks.filter(t => t.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-background data-[state=active]:shadow">
              Completed
              <Badge variant="secondary" className="ml-2 text-xs">
                {tasks.filter(t => t.status === "completed").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="asap" className="data-[state=active]:bg-background data-[state=active]:shadow">
              ASAP
              <Badge variant="destructive" className="ml-2 text-xs">
                {tasks.filter(t => t.is_asap).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredTasks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <EmptyState
                    icon="📋"
                    title={searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? "No tasks found" : "No tasks yet"}
                    description={
                      searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters or search terms"
                        : "Create your first task to start organizing your work with AI-powered automations"
                    }
                    action={{
                      label: "Create Task",
                      onClick: () => setShowCreationModeDialog(true),
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredTasks.map((task, index) => (
                  <div key={task.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <TaskCard task={task} />
                  </div>
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
          if (!open) setSelectedTask(null);
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
