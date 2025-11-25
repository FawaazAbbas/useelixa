import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Trash2, Bot, ArrowDown } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface Automation {
  id: string;
  name: string;
  action: string;
  status: string;
  trigger: string;
  progress: number;
  last_run: string | null;
  task_id: string | null;
  chain_order: number;
  agent_id: string | null;
  agent?: Agent;
}

interface SortableAutomationCardProps {
  automation: Automation;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const SortableAutomationCard = ({
  automation,
  index,
  total,
  onEdit,
  onDelete
}: SortableAutomationCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: automation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="relative">
      <Card
        ref={setNodeRef}
        style={style}
        className={`${isDragging ? "shadow-lg" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing pt-1"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      Step {index + 1}
                    </Badge>
                    <h4 className="font-medium text-sm">{automation.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {automation.action}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {automation.agent?.name || "No agent assigned"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {automation.trigger}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onEdit}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onDelete}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {index < total - 1 && (
        <div className="flex justify-center py-1">
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};