import { useState } from "react";
import { CheckSquare, Plus, Trash2, Zap } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import PullToRefresh from "react-pull-to-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { DemoBanner } from "@/components/DemoBanner";
import { mockTasks, MockTask } from "@/data/mockTasks";

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);

  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 500));
  };

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

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Demo Mode",
      description: "Task removed (changes won't be saved)",
    });
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

  const TaskCard = ({ task }: { task: MockTask }) => {
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
    <div className="flex-1 w-full overflow-y-auto">
      <DemoBanner />
      <div className="p-4 md:p-8 pb-20 md:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
              </div>
              <Button onClick={() => toast({ title: "Demo Mode", description: "Task creation disabled in demo" })} className="w-full sm:w-auto">
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
                    onClick: () => toast({ title: "Demo Mode", description: "Task creation disabled in demo" }),
                  }}
                />
              ) : (
                tasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
    </div>
  );
};

export default Tasks;
