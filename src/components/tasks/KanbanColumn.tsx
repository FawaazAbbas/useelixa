import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SortableTaskCard } from "./SortableTaskCard";
import type { Task } from "./KanbanBoard";
import { cn } from "@/lib/utils";
import { RefreshCw, Calendar, Lightbulb, CheckCircle2, Circle, Clock } from "lucide-react";

interface KanbanColumnProps {
  id: Task["status"];
  title: string;
  color: string;
  description?: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const statusIcons: Record<Task["status"], React.ElementType> = {
  ideas: Lightbulb,
  todo: Circle,
  in_progress: Clock,
  recurring: RefreshCw,
  upcoming: Calendar,
  completed: CheckCircle2,
};

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  description, 
  tasks, 
  onTaskEdit, 
  onTaskDelete 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const Icon = statusIcons[id];

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "border-t-4 transition-colors min-h-[400px] flex-shrink-0 w-[280px]",
        color,
        isOver && "bg-accent/50 ring-2 ring-primary/20"
      )}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <CardTitle className="text-sm font-medium truncate">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {tasks.length}
          </Badge>
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2 px-2 pb-2">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed rounded-lg">
            Drop tasks here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
