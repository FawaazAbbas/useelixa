import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Json } from "@/integrations/supabase/types";
import { 
  Plus, 
  Play, 
  Pause, 
  MoreHorizontal, 
  Clock, 
  Webhook,
  Zap,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Workflow as WorkflowIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  trigger_config: Json;
  created_at: string;
  updated_at: string;
  _count?: {
    steps: number;
    executions: number;
    successfulExecutions: number;
  };
}

interface WorkflowExecution {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

const getTriggerIcon = (triggerType: string) => {
  switch (triggerType) {
    case "schedule":
      return <Clock className="h-4 w-4" />;
    case "webhook":
      return <Webhook className="h-4 w-4" />;
    case "event":
      return <Zap className="h-4 w-4" />;
    default:
      return <Play className="h-4 w-4" />;
  }
};

const getTriggerLabel = (triggerType: string) => {
  switch (triggerType) {
    case "schedule":
      return "Scheduled";
    case "webhook":
      return "Webhook";
    case "event":
      return "Event-triggered";
    default:
      return "Manual";
  }
};

export default function Workflows() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<Record<string, WorkflowExecution[]>>({});

  useEffect(() => {
    if (user) {
      fetchWorkflows();
    }
  }, [user]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data: workflowsData, error } = await supabase
        .from("workflows")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch step counts and execution stats for each workflow
      const workflowsWithStats = await Promise.all(
        (workflowsData || []).map(async (workflow) => {
          const [stepsResult, executionsResult] = await Promise.all([
            supabase.from("workflow_steps").select("id", { count: "exact" }).eq("workflow_id", workflow.id),
            supabase.from("workflow_executions").select("id, status", { count: "exact" }).eq("workflow_id", workflow.id),
          ]);

          const successCount = executionsResult.data?.filter((e) => e.status === "completed").length || 0;

          return {
            ...workflow,
            _count: {
              steps: stepsResult.count || 0,
              executions: executionsResult.count || 0,
              successfulExecutions: successCount,
            },
          };
        })
      );

      setWorkflows(workflowsWithStats);

      // Fetch recent executions for each workflow
      const executions: Record<string, WorkflowExecution[]> = {};
      for (const workflow of workflowsWithStats) {
        const { data } = await supabase
          .from("workflow_executions")
          .select("*")
          .eq("workflow_id", workflow.id)
          .order("started_at", { ascending: false })
          .limit(3);
        executions[workflow.id] = data || [];
      }
      setRecentExecutions(executions);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("workflows")
        .update({ is_active: isActive })
        .eq("id", workflowId);

      if (error) throw error;

      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, is_active: isActive } : w))
      );
      toast.success(isActive ? "Workflow activated" : "Workflow paused");
    } catch (error) {
      console.error("Error toggling workflow:", error);
      toast.error("Failed to update workflow");
    }
  };

  const runWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase.functions.invoke("execute-workflow", {
        body: { workflowId },
      });

      if (error) throw error;

      toast.success("Workflow started");
      fetchWorkflows();
    } catch (error) {
      console.error("Error running workflow:", error);
      toast.error("Failed to start workflow");
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase.from("workflows").delete().eq("id", workflowId);

      if (error) throw error;

      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
      toast.success("Workflow deleted");
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error("Failed to delete workflow");
    }
  };

  const handleCreateNew = () => {
    setSelectedWorkflow(null);
    setShowBuilder(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setSelectedWorkflow(null);
    fetchWorkflows();
  };

  if (!user) {
    return (
      <PageLayout title="Workflows" icon={WorkflowIcon}>
        <PageEmptyState
          icon={WorkflowIcon}
          title="Sign in to create workflows"
          description="Create automated workflows that chain tools together with AI-powered logic."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Workflows" 
      icon={WorkflowIcon}
      actions={
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Workflow List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <PageEmptyState
                icon={WorkflowIcon}
                title="No workflows yet"
                description="Create your first workflow to automate repetitive tasks"
                action={
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEdit(workflow)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {workflow.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(workflow); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); runWorkflow(workflow.id); }}>
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); deleteWorkflow(workflow.id); }}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trigger Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {getTriggerIcon(workflow.trigger_type)}
                      {getTriggerLabel(workflow.trigger_type)}
                    </Badge>
                    <Badge variant="outline">{workflow._count?.steps || 0} steps</Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{workflow._count?.executions || 0} runs</span>
                    {(workflow._count?.executions || 0) > 0 && (
                      <span className="text-green-600">
                        {Math.round(
                          ((workflow._count?.successfulExecutions || 0) /
                            (workflow._count?.executions || 1)) *
                            100
                        )}
                        % success
                      </span>
                    )}
                  </div>

                  {/* Recent Executions */}
                  {recentExecutions[workflow.id]?.length > 0 && (
                    <div className="flex items-center gap-1">
                      {recentExecutions[workflow.id].slice(0, 5).map((exec) => (
                        <div
                          key={exec.id}
                          className={`h-2 w-2 rounded-full ${
                            exec.status === "completed"
                              ? "bg-green-500"
                              : exec.status === "failed"
                              ? "bg-red-500"
                              : exec.status === "running"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-gray-300"
                          }`}
                          title={`${exec.status} - ${new Date(exec.started_at).toLocaleString()}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {workflow.is_active ? "Active" : "Paused"}
                    </span>
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={(checked) => {
                        toggleWorkflow(workflow.id, checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh] p-0">
          <WorkflowBuilder
            workflow={selectedWorkflow}
            onClose={handleBuilderClose}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
