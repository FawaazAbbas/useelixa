import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentSelector } from "./AgentSelector";
import { Loader2 } from "lucide-react";

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

interface AutomationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: Automation | null;
  onSaved: () => void;
}

export const AutomationEditDialog = ({
  open,
  onOpenChange,
  automation,
  onSaved
}: AutomationEditDialogProps) => {
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
      if (automation) {
        setFormData({
          name: automation.name,
          action: automation.action,
          trigger: automation.trigger,
          agent_id: automation.agent_id || ""
        });
      }
    }
  }, [open, automation]);

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

  const handleSave = async () => {
    if (!automation?.id || !formData.name || !formData.action || !formData.agent_id) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("automations")
        .update({
          name: formData.name,
          action: formData.action,
          trigger: formData.trigger,
          agent_id: formData.agent_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", automation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation updated successfully"
      });

      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating automation:", error);
      toast({
        title: "Error",
        description: "Failed to update automation",
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
          <DialogTitle>Edit Automation</DialogTitle>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};