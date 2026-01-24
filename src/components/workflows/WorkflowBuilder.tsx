import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  X,
  Plus,
  Play,
  Trash2,
  GripVertical,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Database,
  Zap,
  GitBranch,
  Clock,
  Bot,
  ArrowRight,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { WorkflowStepCard } from "./WorkflowStepCard";
import { Json } from "@/integrations/supabase/types";

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: string;
  step_name: string | null;
  tool_name: string | null;
  tool_params: Json;
  condition_config: Json | null;
  on_success_step_id: string | null;
  on_failure_step_id: string | null;
  position_x: number;
  position_y: number;
  created_at: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  trigger_config: Json;
}

interface WorkflowBuilderProps {
  workflow: Workflow | null;
  onClose: () => void;
}

const STEP_TYPES = [
  { value: "tool", label: "Tool Action", icon: Zap, color: "bg-blue-500" },
  { value: "condition", label: "Condition", icon: GitBranch, color: "bg-yellow-500" },
  { value: "delay", label: "Delay", icon: Clock, color: "bg-gray-500" },
  { value: "ai_decision", label: "AI Decision", icon: Bot, color: "bg-purple-500" },
];

const AVAILABLE_TOOLS = [
  { category: "Email", tools: ["gmail_send_email", "gmail_search_emails", "gmail_get_labels"] },
  { category: "Calendar", tools: ["calendar_list_events", "calendar_create_event", "calendar_update_event"] },
  { category: "Notes", tools: ["notes_create", "notes_update", "notes_list"] },
  { category: "Tasks", tools: ["tasks_create", "tasks_update", "tasks_list"] },
  { category: "Notion", tools: ["notion_query_database", "notion_create_page", "notion_update_page"] },
  { category: "Shopify", tools: ["shopify_get_orders", "shopify_get_products", "shopify_update_product"] },
  { category: "Stripe", tools: ["stripe_list_customers", "stripe_list_invoices", "stripe_create_invoice"] },
];

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual", description: "Run on-demand" },
  { value: "schedule", label: "Schedule", description: "Run on a schedule" },
  { value: "webhook", label: "Webhook", description: "Triggered by external events" },
  { value: "event", label: "Event", description: "Triggered by internal events" },
];

export function WorkflowBuilder({ workflow, onClose }: WorkflowBuilderProps) {
  const { user } = useAuth();
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [triggerType, setTriggerType] = useState(workflow?.trigger_type || "manual");
  const [triggerConfig, setTriggerConfig] = useState<Json>(
    workflow?.trigger_config || {}
  );
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(workflow?.id || null);

  useEffect(() => {
    if (workflow?.id) {
      fetchSteps(workflow.id);
    }
  }, [workflow]);

  const fetchSteps = async (wfId: string) => {
    const { data, error } = await supabase
      .from("workflow_steps")
      .select("*")
      .eq("workflow_id", wfId)
      .order("step_order", { ascending: true });

    if (error) {
      console.error("Error fetching steps:", error);
      return;
    }

    setSteps(data || []);
  };

  const saveWorkflow = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }

    try {
      setSaving(true);

      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user?.id)
        .single();

      let wfId = workflowId;

      if (workflowId) {
        // Update existing workflow
        const { error } = await supabase
          .from("workflows")
          .update({
            name,
            description,
            trigger_type: triggerType,
            trigger_config: triggerConfig as Json,
          })
          .eq("id", workflowId);

        if (error) throw error;
      } else {
        // Create new workflow
        const { data, error } = await supabase
          .from("workflows")
          .insert([{
            name,
            description,
            trigger_type: triggerType,
            trigger_config: triggerConfig as Json,
            user_id: user?.id,
            org_id: orgMember?.org_id,
          }])
          .select()
          .single();

        if (error) throw error;
        wfId = data.id;
        setWorkflowId(data.id);
      }

      // Save steps
      if (wfId && steps.length > 0) {
        // Delete existing steps for this workflow
        await supabase.from("workflow_steps").delete().eq("workflow_id", wfId);

        // Insert new steps
        const stepsToInsert = steps.map((step, index) => ({
          workflow_id: wfId,
          step_order: index,
          step_type: step.step_type,
          step_name: step.step_name,
          tool_name: step.tool_name,
          tool_params: step.tool_params as Json,
          condition_config: step.condition_config as Json,
          position_x: step.position_x,
          position_y: step.position_y,
        }));

        const { error: stepsError } = await supabase
          .from("workflow_steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      toast.success(workflow ? "Workflow updated" : "Workflow created");
      onClose();
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const addStep = (stepType: string) => {
    const newStep: WorkflowStep = {
      id: `temp-${Date.now()}`,
      workflow_id: workflowId || "",
      step_order: steps.length,
      step_type: stepType,
      step_name: `Step ${steps.length + 1}`,
      tool_name: null,
      tool_params: {} as Json,
      condition_config: null,
      on_success_step_id: null,
      on_failure_step_id: null,
      position_x: 0,
      position_y: steps.length * 120,
      created_at: new Date().toISOString(),
    };

    setSteps((prev) => [...prev, newStep]);
    setSelectedStep(newStep);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
    if (selectedStep?.id === stepId) {
      setSelectedStep((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteStep = (stepId: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const index = steps.findIndex((s) => s.id === stepId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    
    // Update step_order
    newSteps.forEach((step, i) => {
      step.step_order = i;
    });

    setSteps(newSteps);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {workflow ? "Edit Workflow" : "Create Workflow"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Chain tools together with conditional logic
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveWorkflow} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Workflow"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Workflow Settings & Steps */}
        <div className="w-80 border-r flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Workflow"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Trigger */}
              <div className="space-y-3">
                <Label>Trigger</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div>
                          <p className="font-medium">{trigger.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {trigger.description}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {triggerType === "schedule" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Cron Expression</Label>
                    <Input
                      value={((triggerConfig as Record<string, unknown>)?.cron as string) || ""}
                      onChange={(e) =>
                        setTriggerConfig({ ...(triggerConfig as Record<string, unknown>), cron: e.target.value })
                      }
                      placeholder="0 9 * * *"
                    />
                    <p className="text-xs text-muted-foreground">
                      e.g., "0 9 * * *" for daily at 9 AM
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Add Step */}
              <div className="space-y-3">
                <Label>Add Step</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STEP_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => addStep(type.value)}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Center - Workflow Canvas */}
        <div className="flex-1 bg-muted/30 overflow-auto">
          <div className="p-6 min-h-full">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No steps yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add steps from the left panel to build your workflow
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    <WorkflowStepCard
                      step={step}
                      isSelected={selectedStep?.id === step.id}
                      onSelect={() => setSelectedStep(step)}
                      onDelete={() => deleteStep(step.id)}
                      onMoveUp={() => moveStep(step.id, "up")}
                      onMoveDown={() => moveStep(step.id, "down")}
                      isFirst={index === 0}
                      isLast={index === steps.length - 1}
                    />
                    {index < steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Step Configuration */}
        {selectedStep && (
          <div className="w-80 border-l">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Configure Step</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedStep(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Step Name</Label>
                    <Input
                      value={selectedStep.step_name || ""}
                      onChange={(e) =>
                        updateStep(selectedStep.id, { step_name: e.target.value })
                      }
                      placeholder="Step name"
                    />
                  </div>

                  {selectedStep.step_type === "tool" && (
                    <div className="space-y-2">
                      <Label>Tool</Label>
                      <Select
                        value={selectedStep.tool_name || ""}
                        onValueChange={(value) =>
                          updateStep(selectedStep.id, { tool_name: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tool" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_TOOLS.map((category) => (
                            <div key={category.category}>
                              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                {category.category}
                              </p>
                              {category.tools.map((tool) => (
                                <SelectItem key={tool} value={tool}>
                                  {tool.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedStep.step_type === "condition" && (
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Textarea
                        value={
                          ((selectedStep.condition_config as Record<string, unknown>)?.expression as string) || ""
                        }
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            condition_config: {
                              ...(selectedStep.condition_config as Record<string, unknown>),
                              expression: e.target.value,
                            } as Json,
                          })
                        }
                        placeholder="e.g., {{previous_step.result.count}} > 10"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {'{{step_name.result}}'} to reference previous step outputs
                      </p>
                    </div>
                  )}

                  {selectedStep.step_type === "delay" && (
                    <div className="space-y-2">
                      <Label>Delay (minutes)</Label>
                      <Input
                        type="number"
                        value={((selectedStep.tool_params as Record<string, unknown>)?.minutes as number) || 5}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            tool_params: {
                              ...(selectedStep.tool_params as Record<string, unknown>),
                              minutes: parseInt(e.target.value) || 5,
                            } as Json,
                          })
                        }
                        min={1}
                      />
                    </div>
                  )}

                  {selectedStep.step_type === "ai_decision" && (
                    <div className="space-y-2">
                      <Label>AI Prompt</Label>
                      <Textarea
                        value={
                          ((selectedStep.tool_params as Record<string, unknown>)?.prompt as string) || ""
                        }
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            tool_params: {
                              ...(selectedStep.tool_params as Record<string, unknown>),
                              prompt: e.target.value,
                            } as Json,
                          })
                        }
                        placeholder="Describe what the AI should decide..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
