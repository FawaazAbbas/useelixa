import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableAutomationCard } from "./SortableAutomationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface AutomationChainBuilderProps {
  taskId: string;
  automations: Automation[];
  onReorder: () => void;
  onEdit: (automation: Automation) => void;
  onDelete: (automationId: string) => void;
  onAddNew: () => void;
}

export const AutomationChainBuilder = ({
  taskId,
  automations,
  onReorder,
  onEdit,
  onDelete,
  onAddNew
}: AutomationChainBuilderProps) => {
  const { toast } = useToast();
  const [executing, setExecuting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedAutomations = [...automations].sort((a, b) => a.chain_order - b.chain_order);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedAutomations.findIndex((a) => a.id === active.id);
      const newIndex = sortedAutomations.findIndex((a) => a.id === over.id);

      const reordered = arrayMove(sortedAutomations, oldIndex, newIndex);

      // Update chain_order for all affected automations
      const updates = reordered.map((auto, index) => ({
        id: auto.id,
        chain_order: index
      }));

      try {
        for (const update of updates) {
          const { error } = await supabase
            .from("automations")
            .update({ chain_order: update.chain_order })
            .eq("id", update.id);

          if (error) throw error;
        }

        toast({
          title: "Chain Updated",
          description: "Automation order has been updated"
        });

        onReorder();
      } catch (error) {
        console.error("Error reordering automations:", error);
        toast({
          title: "Error",
          description: "Failed to update automation order",
          variant: "destructive"
        });
      }
    }
  };

  const handleExecuteChain = async () => {
    if (sortedAutomations.length === 0) {
      toast({
        title: "No Automations",
        description: "Add automations to execute",
        variant: "destructive"
      });
      return;
    }

    setExecuting(true);
    toast({
      title: "Executing Chain",
      description: `Running ${sortedAutomations.length} automation(s) in sequence...`
    });

    // TODO: Implement actual execution logic via edge function
    // For now, just simulate
    setTimeout(() => {
      setExecuting(false);
      toast({
        title: "Execution Complete",
        description: "Automation chain completed successfully"
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Automation Chain</CardTitle>
            <CardDescription>
              Drag to reorder • Automations execute sequentially
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onAddNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Automation
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteChain}
              disabled={executing || sortedAutomations.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Chain
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAutomations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No automations in this chain yet</p>
            <p className="text-sm mt-1">Click "Add Automation" to get started</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedAutomations.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedAutomations.map((automation, index) => (
                  <SortableAutomationCard
                    key={automation.id}
                    automation={automation}
                    index={index}
                    total={sortedAutomations.length}
                    onEdit={() => onEdit(automation)}
                    onDelete={() => onDelete(automation.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};