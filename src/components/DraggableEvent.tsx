import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface DraggableEventProps {
  id: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DraggableEvent = ({ id, children, className = "", style }: DraggableEventProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isDragging ? "opacity-50" : ""} group relative cursor-move`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="h-3 w-3 text-white/70" />
      </div>
      {children}
    </div>
  );
};
