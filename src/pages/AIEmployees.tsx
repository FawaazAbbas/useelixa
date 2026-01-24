import { useState, useEffect } from "react";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Loader2
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
import { Json } from "@/integrations/supabase/types";
import { CreateEmployeeDialog } from "@/components/ai-employees/CreateEmployeeDialog";
import { EmployeeChat } from "@/components/ai-employees/EmployeeChat";
import { EmptyState } from "@/components/EmptyState";

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
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AIEmployee | null>(null);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch stats for each employee
      const employeesWithStats = await Promise.all(
        (data || []).map(async (employee) => {
          const { count: tasksCount } = await supabase
            .from("ai_employee_tasks")
            .select("*", { count: "exact", head: true })
            .eq("employee_id", employee.id)
            .eq("status", "completed");

          return {
            ...employee,
            _stats: {
              tasksCompleted: tasksCount || 0,
              activeChats: 0,
            },
          };
        })
      );

      setEmployees(employeesWithStats);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load AI employees");
    } finally {
      setLoading(false);
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
    fetchEmployees();
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
      <div className="space-y-6">
        {/* Employee Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : employees.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <PageEmptyState
                icon={Bot}
                title="No AI Employees yet"
                description="Create your first AI employee to handle specific tasks"
                action={
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Employee
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className={`transition-all hover:shadow-md ${
                  !employee.is_active ? "opacity-60" : ""
                }`}
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
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${ROLE_COLORS[employee.role] || ""}`}
                        >
                          {ROLE_ICONS[employee.role] || <Bot className="h-3 w-3" />}
                          {employee.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartChat(employee)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(employee)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleEmployee(employee.id, !employee.is_active)}
                        >
                          {employee.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteEmployee(employee.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">
                    {employee.description || "No description provided"}
                  </CardDescription>

                  {/* Tools */}
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

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{employee._stats?.tasksCompleted || 0} tasks completed</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartChat(employee)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Employee Dialog */}
      <CreateEmployeeDialog
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        employee={editingEmployee}
        existingEmployees={employees}
      />

      {/* Employee Chat Sheet */}
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
