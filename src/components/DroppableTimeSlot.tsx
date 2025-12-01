import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableTimeSlotProps {
  id: string;
  data: { day: Date; hour?: number; isAllDay?: boolean };
  children: ReactNode;
  className?: string;
}

export const DroppableTimeSlot = ({ id, data, children, className = "" }: DroppableTimeSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "bg-primary/20 ring-2 ring-primary" : ""} transition-all`}
    >
      {children}
    </div>
  );
};
