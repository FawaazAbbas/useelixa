import { useState, useEffect, useMemo } from "react";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  MessageSquare,
  Settings,
  Trash2,
  Users,
  Bot,
  Briefcase,
  Search,
  FileText,
  BarChart3,
  Loader2,
  Globe,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { CreateEmployeeDialog } from "@/components/ai-employees/CreateEmployeeDialog";
import { EmployeeChat } from "@/components/ai-employees/EmployeeChat";
import { AgentMarketplace } from "@/components/ai-employees/AgentMarketplace";

export interface AIEmployee {
  id: string;
  org_id: string;
  name: string;
  role: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
  allowed_tools: string[] | null;
  can_delegate_to: string[] | null;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  source?: "native" | "endpoint";
  developer_name?: string;
  _stats?: {
    tasksCompleted: number;
    activeChats: number;
  };
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  researcher: <Search className="h-4 w-4" />,
  writer: <FileText className="h-4 w-4" />,
  analyst: <BarChart3 className="h-4 w-4" />,
  coordinator: <Briefcase className="h-4 w-4" />,
  sales_rep: <MessageSquare className="h-4 w-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  researcher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  writer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  analyst: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  coordinator: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  sales_rep: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

export default function AIEmployees() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [allEndpointAgents, setAllEndpointAgents] = useState<AIEmployee[]>([]);
  const [installedAgentIds, setInstalledAgentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AIEmployee | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, workspaceId]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Get user's org_id first
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user!.id)
        .single();

      const userOrgId = orgMember?.org_id;

      const [nativeResult, endpointResult, installationsResult] = await Promise.all([
        supabase
          .from("ai_employees")
          .select("*")
          .eq("org_id", userOrgId)
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_submissions")
          .select("*, developer_profiles(company_name)")
          .eq("status", "approved")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_installations")
          .select("agent_id")
          .eq("user_id", user!.id),
      ]);

      if (nativeResult.error) throw nativeResult.error;

      // Build installed set
      const installedIds = new Set<string>(
        (installationsResult.data || []).map((i) => i.agent_id)
      );
      setInstalledAgentIds(installedIds);

      // Map native employees with stats
      const nativeEmployees: AIEmployee[] = await Promise.all(
        (nativeResult.data || []).map(async (employee) => {
          const { count: tasksCount } = await supabase
            .from("ai_employee_tasks")
            .select("*", { count: "exact", head: true })
            .eq("employee_id", employee.id)
            .eq("status", "completed");

          return {
            ...employee,
            source: "native" as const,
            _stats: {
              tasksCompleted: tasksCount || 0,
              activeChats: 0,
            },
          };
        })
      );

      // Map ALL endpoint agents
      const endpointAgents: AIEmployee[] = (endpointResult.data || []).map((agent) => ({
        id: agent.id,
        org_id: "",
        name: agent.name,
        role: agent.category || "agent",
        description: agent.description,
        avatar_url: agent.icon_url,
        system_prompt: agent.system_prompt,
        allowed_tools: agent.allowed_tools,
        can_delegate_to: null,
        is_active: agent.execution_status === "ready",
        is_template: false,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        source: "endpoint" as const,
        developer_name: (agent.developer_profiles as any)?.company_name || undefined,
      }));

      setAllEndpointAgents(endpointAgents);

      // My Agents = native + installed endpoint agents
      const installedEndpoint = endpointAgents.filter((a) => installedIds.has(a.id));
      setEmployees([...nativeEmployees, ...installedEndpoint]);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load AI employees");
    } finally {
      setLoading(false);
    }
  };

  const installAgent = async (agentId: string) => {
    if (!workspaceId || !user) {
      toast.error("No workspace found. Please set up your workspace first.");
      return;
    }
    try {
      setInstallingId(agentId);
      const { error } = await supabase.from("agent_installations").insert({
        agent_id: agentId,
        workspace_id: workspaceId,
        user_id: user.id,
      });
      if (error) throw error;

      setInstalledAgentIds((prev) => new Set([...prev, agentId]));
      // Add to My Agents
      const agent = allEndpointAgents.find((a) => a.id === agentId);
      if (agent) {
        setEmployees((prev) => [...prev, agent]);
      }
      toast.success("Agent installed");
    } catch (error) {
      console.error("Error installing agent:", error);
      toast.error("Failed to install agent");
    } finally {
      setInstallingId(null);
    }
  };

  const uninstallAgent = async (agentId: string) => {
    if (!user) return;
    try {
      setInstallingId(agentId);
      const { error } = await supabase
        .from("agent_installations")
        .delete()
        .eq("agent_id", agentId)
        .eq("user_id", user.id);
      if (error) throw error;

      setInstalledAgentIds((prev) => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
      setEmployees((prev) => prev.filter((e) => !(e.source === "endpoint" && e.id === agentId)));
      toast.success("Agent uninstalled");
    } catch (error) {
      console.error("Error uninstalling agent:", error);
      toast.error("Failed to uninstall agent");
    } finally {
      setInstallingId(null);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from("ai_employees")
        .delete()
        .eq("id", employeeId);
      if (error) throw error;
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
      toast.success("AI Employee deleted");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const toggleEmployee = async (employeeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("ai_employees")
        .update({ is_active: isActive })
        .eq("id", employeeId);
      if (error) throw error;
      setEmployees((prev) =>
        prev.map((e) => (e.id === employeeId ? { ...e, is_active: isActive } : e))
      );
      toast.success(isActive ? "Employee activated" : "Employee deactivated");
    } catch (error) {
      console.error("Error toggling employee:", error);
      toast.error("Failed to update employee");
    }
  };

  const handleStartChat = (employee: AIEmployee) => {
    setSelectedEmployee(employee);
    setShowChat(true);
  };

  const handleEdit = (employee: AIEmployee) => {
    setEditingEmployee(employee);
    setShowCreateDialog(true);
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setEditingEmployee(null);
    fetchAll();
  };

  if (!user) {
    return (
      <PageLayout title="AI Employees" icon={Users}>
        <PageEmptyState
          icon={Users}
          title="Sign in to manage AI Employees"
          description="Create specialized AI agents that work together on complex tasks."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="AI Employees"
      icon={Users}
      actions={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Employee
        </Button>
      }
    >
      <Tabs defaultValue="my-agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="browse" className="gap-1">
            <Download className="h-4 w-4" />
            Browse Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-agents">
          <MyAgentsGrid
            employees={employees}
            loading={loading}
            onStartChat={handleStartChat}
            onEdit={handleEdit}
            onDelete={deleteEmployee}
            onToggle={toggleEmployee}
            onUninstall={uninstallAgent}
            onCreateClick={() => setShowCreateDialog(true)}
          />
        </TabsContent>

        <TabsContent value="browse">
          <AgentMarketplace
            agents={allEndpointAgents}
            installedAgentIds={installedAgentIds}
            installingId={installingId}
            onInstall={installAgent}
            onUninstall={uninstallAgent}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      <CreateEmployeeDialog
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        employee={editingEmployee}
        existingEmployees={employees}
      />

      {selectedEmployee && (
        <EmployeeChat
          open={showChat}
          onOpenChange={setShowChat}
          employee={selectedEmployee}
        />
      )}
    </PageLayout>
  );
}

/* ── My Agents Grid (extracted for clarity) ── */

interface MyAgentsGridProps {
  employees: AIEmployee[];
  loading: boolean;
  onStartChat: (e: AIEmployee) => void;
  onEdit: (e: AIEmployee) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onUninstall: (id: string) => void;
  onCreateClick: () => void;
}

function MyAgentsGrid({
  employees,
  loading,
  onStartChat,
  onEdit,
  onDelete,
  onToggle,
  onUninstall,
  onCreateClick,
}: MyAgentsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <PageEmptyState
            icon={Bot}
            title="No AI Employees yet"
            description="Create your first AI employee or browse agents to install"
            action={
              <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create Employee
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {employees.map((employee) => (
        <Card
          key={`${employee.source}-${employee.id}`}
          className={`transition-all hover:shadow-md ${!employee.is_active ? "opacity-60" : ""}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {employee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={`gap-1 ${ROLE_COLORS[employee.role] || ""}`}
                    >
                      {ROLE_ICONS[employee.role] || <Bot className="h-3 w-3" />}
                      {employee.role.replace("_", " ")}
                    </Badge>
                    {employee.source === "endpoint" ? (
                      <Badge variant="outline" className="gap-1 border-accent text-accent-foreground">
                        <Globe className="h-3 w-3" />
                        Endpoint Agent
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        Native
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStartChat(employee)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </DropdownMenuItem>
                  {employee.source === "endpoint" ? (
                    <DropdownMenuItem
                      onClick={() => onUninstall(employee.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Uninstall
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggle(employee.id, !employee.is_active)}
                      >
                        {employee.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(employee.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="line-clamp-2">
              {employee.description || "No description provided"}
            </CardDescription>

            {employee.source === "endpoint" && employee.developer_name && (
              <p className="text-xs text-muted-foreground">
                by {employee.developer_name}
              </p>
            )}

            {employee.allowed_tools && employee.allowed_tools.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {employee.allowed_tools.slice(0, 3).map((tool) => (
                  <Badge key={tool} variant="outline" className="text-xs">
                    {tool.replace(/_/g, " ")}
                  </Badge>
                ))}
                {employee.allowed_tools.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{employee.allowed_tools.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              {employee.source === "endpoint" ? (
                <span className="text-xs">Endpoint Agent</span>
              ) : (
                <span>{employee._stats?.tasksCompleted || 0} tasks completed</span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartChat(employee)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
