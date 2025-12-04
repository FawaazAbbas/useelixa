import { useState } from "react";
import { CheckSquare, Plus, Trash2, Zap, Search, Calendar, List, LayoutGrid, Clock, AlertTriangle, CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { DemoBanner } from "@/components/DemoBanner";
import { TaskCreationModeDialog } from "@/components/TaskCreationModeDialog";
import { BrianChatDialog } from "@/components/BrianChatDialog";
import { ManualTaskDialog } from "@/components/ManualTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { mockTasks, MockTask } from "@/data/mockTasks";
import { cn } from "@/lib/utils";
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
  const [view, setView] = useState<"list" | "board">("list");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "asap" | "overdue">("all");
  
  // Dialog states
  const [showCreationModeDialog, setShowCreationModeDialog] = useState(false);
  const [showBrianChat, setShowBrianChat] = useState(false);
  const [showManualTask, setShowManualTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTaskComplete = (taskId: string, currentStatus: string | null) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: currentStatus === "completed" ? "pending" : "completed",
            completed_at: currentStatus === "completed" ? null : new Date().toISOString()
          }
        : task
    ));
    toast({
      title: "Demo Mode",
      description: `Task marked as ${currentStatus === "completed" ? "pending" : "completed"}`,
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completed_at: newStatus === "completed" ? new Date().toISOString() : null
          }
        : task
    ));
    toast({
      title: "Demo Mode",
      description: `Task moved to ${newStatus}`,
    });
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    setTasks(tasks.filter(task => task.id !== taskToDelete));
    toast({
      title: "Demo Mode",
      description: "Task deleted",
    });
    setTaskToDelete(null);
    setSwipedTaskId(null);
  };

  const handleAddTask = (title: string, description: string, priority: string, dueDate: Date | null, isAsap: boolean) => {
    const newTask: MockTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      priority,
      status: "pending",
      due_date: dueDate ? dueDate.toISOString() : null,
      completed_at: null,
      created_at: new Date().toISOString(),
      automation_count: 0,
      completed_automation_count: 0,
      is_asap: isAsap,
    };
    setTasks([newTask, ...tasks]);
    toast({
      title: "Task Created",
      description: "New task added successfully (Demo Mode)",
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-muted";
    }
  };

  const handleSelectCreationMode = (mode: "brian" | "manual") => {
    setShowCreationModeDialog(false);
    if (mode === "brian") {
      setShowBrianChat(true);
    } else {
      setShowManualTask(true);
    }
  };

  const handleTaskCreatedFromBrian = () => {
    // Simulate Brian creating a task
    handleAddTask(
      "AI-Generated Task",
      "This task was created by Brian based on your conversation",
      "medium",
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      false
    );
    setShowBrianChat(false);
  };

  const handleManualTaskCreated = () => {
    // In real app, task is created by the dialog itself
    // For demo, we'll simulate adding a task
    handleAddTask(
      "New Manual Task",
      "This task was created manually",
      "medium",
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      false
    );
    setShowManualTask(false);
  };

  const openTaskDetail = (task: MockTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // Stats calculations
  const stats = {
    all: tasks.length,
    active: tasks.filter(t => t.status === "pending").length,
    completed: tasks.filter(t => t.status === "completed").length,
    asap: tasks.filter(t => t.is_asap && t.status === "pending").length,
    overdue: tasks.filter(t => t.status === "pending" && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length,
  };

  // Filter tasks
  const filterTasks = () => {
    let filtered = tasks;
    
    switch (activeFilter) {
      case "active":
        filtered = filtered.filter(t => t.status === "pending");
        break;
      case "completed":
        filtered = filtered.filter(t => t.status === "completed");
        break;
      case "asap":
        filtered = filtered.filter(t => t.is_asap && t.status === "pending");
        break;
      case "overdue":
        filtered = filtered.filter(t => t.status === "pending" && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
        break;
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getUpcomingTasks = () => {
    return [...tasks]
      .filter(task => task.status === "pending" && task.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 4);
  };

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return "Overdue";
    return format(date, "MMM d");
  };

  const getDueDateColor = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return "text-destructive";
    if (isToday(date)) return "text-orange-500";
    return "text-muted-foreground";
  };

  // Task Card Component
  const TaskCard = ({ task, compact = false }: { task: MockTask; compact?: boolean }) => {
    const handlers = useSwipeable({
      onSwipedLeft: () => setSwipedTaskId(task.id),
      onSwipedRight: () => setSwipedTaskId(null),
      trackMouse: false,
    });

    const isCompleted = task.status === "completed";
    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && !isCompleted;

    if (compact) {
      return (
        <div
          className={cn(
            "p-3 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md border-l-4",
            getPriorityColor(task.priority),
            isCompleted && "opacity-50",
            isOverdue && "bg-destructive/5"
          )}
          onClick={() => openTaskDetail(task)}
        >
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "text-sm font-medium truncate",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {task.is_asap && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5">
                    <Zap className="h-2 w-2" />
                    ASAP
                  </Badge>
                )}
                {task.due_date && (
                  <span className={cn("text-[10px] flex items-center gap-0.5", getDueDateColor(task.due_date))}>
                    <Calendar className="h-2.5 w-2.5" />
                    {getDueDateLabel(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden animate-fade-in" {...handlers}>
        <Card
          className={cn(
            "group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
            swipedTaskId === task.id ? "-translate-x-20" : "translate-x-0",
            getPriorityColor(task.priority),
            isCompleted && "opacity-50",
            isOverdue && "bg-destructive/5"
          )}
          onClick={() => openTaskDetail(task)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-medium text-sm leading-tight",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToDelete(task.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {task.is_asap && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <Zap className="h-2.5 w-2.5" />
                      ASAP
                    </Badge>
                  )}
                  {task.due_date && (
                    <span className={cn("text-[11px] flex items-center gap-1", getDueDateColor(task.due_date))}>
                      <Calendar className="h-3 w-3" />
                      {getDueDateLabel(task.due_date)}
                    </span>
                  )}
                  {task.automation_count && task.automation_count > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {task.completed_automation_count}/{task.automation_count} automations
                    </span>
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
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setTaskToDelete(task.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Board View Component
  const BoardView = () => {
    const columns = [
      { 
        id: "pending", 
        title: "To Do", 
        icon: Circle,
        tasks: tasks.filter(t => t.status === "pending" && !t.is_asap),
        color: "bg-blue-500"
      },
      { 
        id: "asap", 
        title: "ASAP", 
        icon: Zap,
        tasks: tasks.filter(t => t.status === "pending" && t.is_asap),
        color: "bg-orange-500"
      },
      { 
        id: "completed", 
        title: "Completed", 
        icon: CheckCircle2,
        tasks: tasks.filter(t => t.status === "completed"),
        color: "bg-green-500"
      },
    ];

    return (
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-lg"
          >
            {/* Column Header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {column.tasks.length}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowCreationModeDialog(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Column Content */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {column.tasks.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    );
  };

  const filteredTasks = filterTasks();

  const filterButtons: Array<{
    key: "all" | "active" | "completed" | "asap" | "overdue";
    label: string;
    icon: typeof List;
    count: number;
    danger?: boolean;
  }> = [
    { key: "all", label: "All", icon: List, count: stats.all },
    { key: "active", label: "Active", icon: Circle, count: stats.active },
    { key: "completed", label: "Done", icon: CheckCircle2, count: stats.completed },
    { key: "asap", label: "ASAP", icon: Zap, count: stats.asap },
    { key: "overdue", label: "Overdue", icon: AlertTriangle, count: stats.overdue, danger: true },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl hidden sm:inline">Tasks</span>
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-7 px-2.5 gap-1"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">List</span>
            </Button>
            <Button
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("board")}
              className="h-7 px-2.5 gap-1"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Board</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Sidebar - Only show in list view */}
        {view === "list" && (
          <div className="hidden lg:flex flex-col w-64 border-r bg-card/50 shrink-0 overflow-hidden">
            <ScrollArea className="flex-1">
              {/* Create Button */}
              <div className="p-4">
                <Button 
                  onClick={() => setShowCreationModeDialog(true)} 
                  className="w-full shadow-md hover:shadow-lg transition-all gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="px-4 pb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Filters</h3>
                <div className="space-y-1">
                  {filterButtons.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        activeFilter === filter.key 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50",
                        filter.danger && filter.count > 0 && activeFilter !== filter.key && "text-destructive"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <filter.icon className="h-4 w-4" />
                        <span>{filter.label}</span>
                      </div>
                      <Badge 
                        variant={activeFilter === filter.key ? "secondary" : filter.danger && filter.count > 0 ? "destructive" : "outline"}
                        className="text-[10px] px-1.5"
                      >
                        {filter.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Summary */}
              <div className="px-4 py-4 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Priority</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm">High</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tasks.filter(t => t.priority === "high" && t.status === "pending").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">Medium</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tasks.filter(t => t.priority === "medium" && t.status === "pending").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">Low</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tasks.filter(t => t.priority === "low" && t.status === "pending").length}</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Due */}
              <div className="px-4 py-4 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coming Up</h3>
                <div className="space-y-2">
                  {getUpcomingTasks().map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openTaskDetail(task)}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer transition-all hover:bg-accent/50 border-l-2",
                        getPriorityColor(task.priority)
                      )}
                    >
                      <div className="text-sm font-medium truncate">{task.title}</div>
                      <div className={cn("flex items-center gap-1 text-[10px] mt-1", task.due_date && getDueDateColor(task.due_date))}>
                        <Clock className="h-2.5 w-2.5" />
                        {task.due_date && getDueDateLabel(task.due_date)}
                      </div>
                    </div>
                  ))}
                  {getUpcomingTasks().length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">No upcoming tasks</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {view === "list" ? (
            <>
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-card/30">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Mobile Filter Pills */}
              <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b overflow-x-auto">
                {filterButtons.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={activeFilter === filter.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      "h-8 gap-1.5 whitespace-nowrap",
                      filter.danger && filter.count > 0 && activeFilter !== filter.key && "border-destructive text-destructive"
                    )}
                  >
                    <filter.icon className="h-3.5 w-3.5" />
                    {filter.label}
                    <Badge 
                      variant={activeFilter === filter.key ? "secondary" : "outline"} 
                      className="text-[10px] px-1 ml-0.5"
                    >
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Task List */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {/* Mobile Create Button */}
                  <div className="lg:hidden mb-4">
                    <Button 
                      onClick={() => setShowCreationModeDialog(true)} 
                      className="w-full shadow-md hover:shadow-lg transition-all gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Task
                    </Button>
                  </div>

                  {filteredTasks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12">
                        <EmptyState
                          icon="📋"
                          title={searchQuery ? "No tasks found" : activeFilter !== "all" ? `No ${activeFilter} tasks` : "No tasks yet"}
                          description={
                            searchQuery
                              ? "Try adjusting your search terms"
                              : "Create your first task to start organizing your work"
                          }
                          action={{
                            label: "Create Task",
                            onClick: () => setShowCreationModeDialog(true),
                          }}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-2">
                      {filteredTasks.map((task, index) => (
                        <div key={task.id} style={{ animationDelay: `${index * 30}ms` }}>
                          <TaskCard task={task} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <BoardView />
          )}
        </div>
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
        onTaskCreated={handleTaskCreatedFromBrian}
      />

      <ManualTaskDialog
        open={showManualTask}
        onOpenChange={setShowManualTask}
        onTaskCreated={handleManualTaskCreated}
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
              Are you sure you want to delete this task? This action cannot be undone.
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
