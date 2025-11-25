import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AgentSelector } from "./AgentSelector";
import { Loader2 } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface AddAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onAdded: () => void;
}

export const AddAutomationDialog = ({
  open,
  onOpenChange,
  taskId,
  onAdded
}: AddAutomationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    action: "",
    trigger: "manual",
    agent_id: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAgents();
      fetchMaxChainOrder();
    }
  }, [open]);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, description, capabilities")
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error("Error fetching agents:", error);
      return;
    }

    setAgents(data || []);
  };

  const fetchMaxChainOrder = async () => {
    const { data, error } = await supabase
      .from("automations")
      .select("chain_order")
      .eq("task_id", taskId)
      .order("chain_order", { ascending: false })
      .limit(1)
      .single();

    // Next automation gets max + 1, or 0 if none exist
    // This will be set when we save
  };

  const handleSave = async () => {
    if (!formData.name || !formData.action || !formData.agent_id) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Get the current max chain_order for this task
      const { data: maxData } = await supabase
        .from("automations")
        .select("chain_order")
        .eq("task_id", taskId)
        .order("chain_order", { ascending: false })
        .limit(1)
        .single();

      const nextChainOrder = maxData ? maxData.chain_order + 1 : 0;

      const { error } = await supabase
        .from("automations")
        .insert({
          name: formData.name,
          action: formData.action,
          trigger: formData.trigger,
          agent_id: formData.agent_id,
          task_id: taskId,
          workspace_id: user?.id!,
          created_by: user?.id!,
          chain_order: nextChainOrder,
          status: "active"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation added successfully"
      });

      setFormData({ name: "", action: "", trigger: "manual", agent_id: "" });
      onAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding automation:", error);
      toast({
        title: "Error",
        description: "Failed to add automation",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Automation to Chain</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Automation Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Daily News Scan"
            />
          </div>

          <div>
            <Label htmlFor="action">AI Agent Instruction *</Label>
            <Textarea
              id="action"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="Specific instruction for the AI agent..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) => setFormData({ ...formData, trigger: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="on_completion">On Task Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AgentSelector
            agents={agents}
            selectedAgentId={formData.agent_id}
            onSelect={(agentId) => setFormData({ ...formData, agent_id: agentId })}
            label="Assigned Agent"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Chain"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};