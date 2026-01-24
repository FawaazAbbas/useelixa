import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, GripVertical, Bot, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "./KanbanBoard";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-slate-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 shadow-lg rotate-2 scale-105",
        task.status === "completed" && "opacity-60"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityColors[task.priority])} />
              <h4 className={cn(
                "text-sm font-medium truncate",
                task.status === "completed" && "line-through"
              )}>
                {task.title}
              </h4>
              {task.is_recurring && (
                <RefreshCw className="h-3 w-3 text-teal-500" />
              )}
              {task.assigned_to === "ai" && (
                <Badge variant="outline" className="gap-1 text-xs px-1.5 py-0 h-5">
                  <Bot className="h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {task.due_date && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
                {task.assigned_to === "ai" && task.scheduled_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.scheduled_at), "MMM d, h:mm a")}
                  </span>
                )}
                {task.assigned_to === "ai" && task.last_run_at && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                    Executed
                  </Badge>
                )}
              </div>
              <div className="flex gap-1 ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
