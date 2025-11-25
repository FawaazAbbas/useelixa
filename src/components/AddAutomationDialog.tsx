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
    agent_id: "",
    schedule_type: "manual",
    schedule_time: "09:00",
    schedule_days: [] as number[],
    schedule_interval_minutes: 30
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

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day]
    }));
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

      const insertData: any = {
        name: formData.name,
        action: formData.action,
        trigger: formData.trigger,
        agent_id: formData.agent_id,
        task_id: taskId,
        workspace_id: user?.id!,
        created_by: user?.id!,
        chain_order: nextChainOrder,
        status: "active",
        schedule_type: formData.schedule_type,
      };

      if (formData.schedule_type !== 'manual') {
        insertData.schedule_time = formData.schedule_time;
        if (formData.schedule_type === 'weekly') {
          insertData.schedule_days = formData.schedule_days;
        }
        if (formData.schedule_type === 'interval') {
          insertData.schedule_interval_minutes = formData.schedule_interval_minutes;
        }
      }

      const { error } = await supabase
        .from("automations")
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation added successfully"
      });

      setFormData({ 
        name: "", 
        action: "", 
        trigger: "manual", 
        agent_id: "",
        schedule_type: "manual",
        schedule_time: "09:00",
        schedule_days: [],
        schedule_interval_minutes: 30
      });
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
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select
              value={formData.schedule_type}
              onValueChange={(value) => setFormData({ ...formData, schedule_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (Run on demand)</SelectItem>
                <SelectItem value="interval">Interval (Every X minutes)</SelectItem>
                <SelectItem value="daily">Daily (At specific time)</SelectItem>
                <SelectItem value="weekly">Weekly (Specific days & time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.schedule_type !== 'manual' && (
            <>
              <div>
                <Label htmlFor="scheduleTime">Time of Day</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                />
              </div>

              {formData.schedule_type === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <Button
                        key={day}
                        type="button"
                        size="sm"
                        variant={formData.schedule_days.includes(i) ? 'default' : 'outline'}
                        onClick={() => toggleDay(i)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {formData.schedule_type === 'interval' && (
                <div>
                  <Label htmlFor="intervalMinutes">Run Every (minutes)</Label>
                  <Input
                    id="intervalMinutes"
                    type="number"
                    min={5}
                    value={formData.schedule_interval_minutes}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule_interval_minutes: parseInt(e.target.value) || 5 
                    })}
                  />
                </div>
              )}
            </>
          )}

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