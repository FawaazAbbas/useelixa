import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableTimeSlotProps {
  id: string;
  data: { day: Date; hour?: number; isAllDay?: boolean };
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const DroppableTimeSlot = ({ id, data, children, className = "", onClick }: DroppableTimeSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`${className} ${isOver ? "bg-primary/20 ring-2 ring-primary" : ""} transition-all`}
    >
      {children}
    </div>
  );
};
