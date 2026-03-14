import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "ideas" | "todo" | "in_progress" | "recurring" | "upcoming" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  position: number;
  created_at: string;
  assigned_to: string | null;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  scheduled_at: string | null;
  ai_tools_allowed: string[] | null;
  ai_context: string | null;
  last_run_at: string | null;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Task["status"], newPosition: number) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export interface Column {
  id: Task["status"];
  title: string;
  color: string;
  description?: string;
}

export const columns: Column[] = [
  { id: "ideas", title: "Ideas", color: "border-t-purple-500", description: "Brainstorm & capture" },
  { id: "todo", title: "To Do", color: "border-t-blue-500", description: "Ready to start" },
  { id: "in_progress", title: "In Progress", color: "border-t-yellow-500", description: "Currently working" },
  { id: "recurring", title: "Recurring", color: "border-t-teal-500", description: "Repeating tasks" },
  { id: "upcoming", title: "Upcoming", color: "border-t-orange-500", description: "Scheduled for later" },
  { id: "completed", title: "Completed", color: "border-t-green-500", description: "Done & archived" },
];

export function KanbanBoard({ tasks, onTaskMove, onTaskEdit, onTaskDelete }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Task["status"], Task[]> = {
      ideas: [],
      todo: [],
      in_progress: [],
      recurring: [],
      upcoming: [],
      completed: [],
    };
    
    tasks.forEach((task) => {
      // Handle legacy "done" status by mapping to "completed"
      const status = task.status === "done" as any ? "completed" : task.status;
      if (grouped[status]) {
        grouped[status].push({ ...task, status });
      } else {
        // Fallback to todo if unknown status
        grouped.todo.push({ ...task, status: "todo" });
      }
    });
    
    // Sort by position within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status as Task["status"]].sort((a, b) => a.position - b.position);
    });
    
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping over a column
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      const currentStatus = activeTask.status === "done" as any ? "completed" : activeTask.status;
      if (currentStatus !== overColumn.id) {
        const newPosition = tasksByStatus[overColumn.id].length;
        onTaskMove(activeId, overColumn.id, newPosition);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const activeStatus = activeTask.status === "done" as any ? "completed" : activeTask.status;

    // Check if dropping over a column directly
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      if (activeStatus !== overColumn.id) {
        const newPosition = tasksByStatus[overColumn.id].length;
        onTaskMove(activeId, overColumn.id, newPosition);
      }
      return;
    }

    // Dropping over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    const overStatus = overTask.status === "done" as any ? "completed" : overTask.status;

    if (activeStatus === overStatus) {
      // Same column - reorder
      const columnTasks = tasksByStatus[activeStatus];
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      
      if (overIndex !== -1) {
        onTaskMove(activeId, activeStatus, overIndex);
      }
    } else {
      // Different column - move to new column at target position
      const overColumnTasks = tasksByStatus[overStatus];
      const overIndex = overColumnTasks.findIndex((t) => t.id === overId);
      onTaskMove(activeId, overStatus, overIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            description={column.description}
            tasks={tasksByStatus[column.id]}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
