import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SortableTaskCard } from "./SortableTaskCard";
import type { Task } from "./KanbanBoard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: Task["status"];
  title: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const columnColors: Record<Task["status"], string> = {
  todo: "border-t-blue-500",
  in_progress: "border-t-yellow-500",
  done: "border-t-green-500",
};

export function KanbanColumn({ id, title, tasks, onTaskEdit, onTaskDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "border-t-4 transition-colors min-h-[400px]",
        columnColors[id],
        isOver && "bg-accent/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
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
          <div className="text-center py-8 text-muted-foreground text-sm">
            Drop tasks here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
