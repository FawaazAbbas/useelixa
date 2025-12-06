import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { AgentSelector } from "./AgentSelector";
import { WaitlistDialog } from "@/components/WaitlistDialog";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional()
});

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface Automation {
  name: string;
  description: string;
  instruction: string;
  trigger: string;
  expectedOutput: string;
  agentId: string;
  agentName: string;
}

interface ManualTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

export const ManualTaskDialog = ({ open, onOpenChange, onTaskCreated }: ManualTaskDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    is_asap: false
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [currentAutomation, setCurrentAutomation] = useState<Automation>({
    name: "",
    description: "",
    instruction: "",
    trigger: "manual",
    expectedOutput: "",
    agentId: "",
    agentName: ""
  });
  const [showAutomationForm, setShowAutomationForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAgents();
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

  const handleAddAutomation = () => {
    if (!currentAutomation.name || !currentAutomation.instruction || !currentAutomation.agentId) {
      toast({
        title: "Missing Fields",
        description: "Automation name, AI instruction, and agent are required",
        variant: "destructive"
      });
      return;
    }

    const selectedAgent = agents.find(a => a.id === currentAutomation.agentId);
    setAutomations([...automations, { 
      ...currentAutomation,
      agentName: selectedAgent?.name || ""
    }]);
    setCurrentAutomation({
      name: "",
      description: "",
      instruction: "",
      trigger: "manual",
      expectedOutput: "",
      agentId: "",
      agentName: ""
    });
    setShowAutomationForm(false);
    
    toast({
      title: "Automation Added",
      description: "Automation has been added to the task"
    });
  };

  const handleRemoveAutomation = (index: number) => {
    setAutomations(automations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show waitlist dialog instead of actually creating the task
    onOpenChange(false);
    setShowWaitlistDialog(true);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task Manually</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-destructive" />
                <div>
                  <Label htmlFor="asap" className="cursor-pointer">ASAP Priority</Label>
                  <p className="text-xs text-muted-foreground">Execute automations immediately</p>
                </div>
              </div>
              <Switch
                id="asap"
                checked={formData.is_asap}
                onCheckedChange={(checked) => setFormData({ ...formData, is_asap: checked })}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Automations</CardTitle>
                  <CardDescription>Add custom automations to this task</CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAutomationForm(!showAutomationForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Automation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAutomationForm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Automation Name *</Label>
                        <Input
                          placeholder="e.g., Daily Website Check"
                          value={currentAutomation.name}
                          onChange={(e) => setCurrentAutomation({ ...currentAutomation, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Trigger</Label>
                        <Select
                          value={currentAutomation.trigger}
                          onValueChange={(value) => setCurrentAutomation({ ...currentAutomation, trigger: value })}
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
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description of what this automation does"
                        value={currentAutomation.description}
                        onChange={(e) => setCurrentAutomation({ ...currentAutomation, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>AI Agent Instruction *</Label>
                      <Textarea
                        placeholder="Specific instruction for the AI agent. Example: Visit competitor's website homepage daily and extract pricing section changes."
                        value={currentAutomation.instruction}
                        onChange={(e) => setCurrentAutomation({ ...currentAutomation, instruction: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Expected Output</Label>
                      <Input
                        placeholder="What result do you expect?"
                        value={currentAutomation.expectedOutput}
                        onChange={(e) => setCurrentAutomation({ ...currentAutomation, expectedOutput: e.target.value })}
                      />
                    </div>

                    <AgentSelector
                      agents={agents}
                      selectedAgentId={currentAutomation.agentId}
                      onSelect={(agentId) => setCurrentAutomation({ ...currentAutomation, agentId })}
                    />

                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddAutomation} size="sm">
                        Add Automation
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAutomationForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {automations.length === 0 && !showAutomationForm && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No automations added yet
                </p>
              )}

              {automations.map((auto, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{auto.name}</p>
                      <Badge variant="outline">{auto.trigger}</Badge>
                    </div>
                    {auto.description && (
                      <p className="text-sm text-muted-foreground mb-2">{auto.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">
                      Instruction: {auto.instruction}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        🤖 {auto.agentName}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveAutomation(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    
    <WaitlistDialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog} />
    </>
  );
};
