import { useState } from "react";
import { CheckSquare, Plus, Trash2, Zap, Search, Filter, Calendar, ChevronLeft, ChevronRight, List, LayoutGrid, Clock } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { format, isToday, isTomorrow, isPast, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"list" | "board">("list");
  
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
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
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
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), day));
  };

  const getUpcomingTasks = () => {
    return [...tasks]
      .filter(task => task.status === "pending" && task.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const asap = tasks.filter(t => t.is_asap).length;
    const overdue = tasks.filter(t => t.status === "pending" && t.due_date && isPast(new Date(t.due_date))).length;
    return { total, pending, completed, asap, overdue };
  };

  const stats = getTaskStats();

  // Mini Calendar Component
  const MiniCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">{format(currentDate, "MMMM yyyy")}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {allDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="h-7" />;
            const dayIsToday = isToday(day);
            const dayIsSelected = isSameDay(day, currentDate);
            const hasTasks = getTasksForDay(day).length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setCurrentDate(day)}
                className={cn(
                  "h-7 w-7 rounded-full text-xs flex items-center justify-center relative transition-all hover:bg-accent",
                  dayIsSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  dayIsToday && !dayIsSelected && "bg-primary/20 text-primary font-bold"
                )}
              >
                {format(day, "d")}
                {hasTasks && !dayIsSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
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
          className={cn(
            "group cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4",
            swipedTaskId === task.id ? "-translate-x-20" : "translate-x-0",
            task.priority === "high" ? "border-l-red-500" : task.priority === "medium" ? "border-l-yellow-500" : "border-l-green-500",
            isCompleted && "opacity-60"
          )}
          onClick={() => openTaskDetail(task)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 transition-transform hover:scale-110"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={cn(
                    "font-medium text-sm transition-all",
                    isCompleted ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={getPriorityBadgeColor(task.priority)} className="text-[10px] px-1.5 py-0">
                      {task.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-6 w-6 hidden md:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {task.is_asap && (
                    <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0 animate-pulse">
                      <Zap className="h-2.5 w-2.5" />
                      ASAP
                    </Badge>
                  )}
                  {task.due_date && (
                    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(task.due_date), "MMM d")}
                    </Badge>
                  )}
                  {task.automation_count && task.automation_count > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg animate-scale-in"
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

  const filteredTasks = filterTasks(tasks);

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl hidden sm:inline">Tasks</span>
          </div>

          {/* Right: View Toggles */}
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
        {/* Sidebar */}
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

            {/* Mini Calendar */}
            <MiniCalendar />

            {/* Task Stats */}
            <div className="px-4 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="outline">{stats.pending}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="secondary">{stats.completed}</Badge>
                </div>
                {stats.overdue > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
                    <span className="text-sm text-destructive">Overdue</span>
                    <Badge variant="destructive">{stats.overdue}</Badge>
                  </div>
                )}
                {stats.asap > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10">
                    <span className="text-sm text-orange-600 dark:text-orange-400">ASAP</span>
                    <Badge className="bg-orange-500">{stats.asap}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="px-4 py-2 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
              <div className="space-y-2">
                {getUpcomingTasks().map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openTaskDetail(task)}
                    className={cn(
                      "p-2 rounded-lg cursor-pointer transition-all hover:bg-accent/50 border-l-2",
                      task.priority === "high" ? "border-l-red-500" : task.priority === "medium" ? "border-l-yellow-500" : "border-l-green-500"
                    )}
                  >
                    <div className="text-sm font-medium truncate">{task.title}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Clock className="h-2.5 w-2.5" />
                      {task.due_date && (
                        isToday(new Date(task.due_date)) ? "Today" :
                        isTomorrow(new Date(task.due_date)) ? "Tomorrow" :
                        format(new Date(task.due_date), "MMM d")
                      )}
                    </div>
                  </div>
                ))}
                {getUpcomingTasks().length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No upcoming tasks</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-card/30">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px] h-9 hidden sm:flex">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </div>
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
                <div className="grid gap-2">
                  {filteredTasks.map((task, index) => (
                    <div key={task.id} style={{ animationDelay: `${index * 50}ms` }}>
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
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
