import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import type { AIEmployee } from "@/pages/AIEmployees";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: AIEmployee | null;
  existingEmployees: AIEmployee[];
}

const ROLES = [
  { value: "researcher", label: "Research Assistant", description: "Searches and summarizes information" },
  { value: "writer", label: "Content Writer", description: "Creates documents, notes, and reports" },
  { value: "analyst", label: "Data Analyst", description: "Analyzes data and creates insights" },
  { value: "coordinator", label: "Task Coordinator", description: "Breaks down and assigns tasks" },
  { value: "sales_rep", label: "Sales Representative", description: "Handles customer communications" },
];

const AVAILABLE_TOOLS = [
  { category: "Email", tools: ["gmail_send_email", "gmail_search_emails", "gmail_get_labels"] },
  { category: "Calendar", tools: ["calendar_list_events", "calendar_create_event"] },
  { category: "Notes", tools: ["notes_create", "notes_update", "notes_list", "notes_search"] },
  { category: "Knowledge Base", tools: ["search_knowledge_base", "create_document"] },
  { category: "Notion", tools: ["notion_query_database", "notion_create_page"] },
  { category: "Shopify", tools: ["shopify_get_orders", "shopify_get_products"] },
  { category: "Stripe", tools: ["stripe_list_customers", "stripe_list_invoices"] },
];

const ROLE_TEMPLATES: Record<string, { tools: string[]; prompt: string }> = {
  researcher: {
    tools: ["search_knowledge_base", "notes_search", "gmail_search_emails"],
    prompt: `You are a meticulous Research Assistant. Your role is to:
- Search and gather relevant information from the knowledge base and emails
- Summarize findings clearly and concisely
- Provide sources and citations when available
- Ask clarifying questions if the research scope is unclear
Always be thorough but efficient in your research.`,
  },
  writer: {
    tools: ["notes_create", "notes_update", "notion_create_page"],
    prompt: `You are a skilled Content Writer. Your role is to:
- Create clear, well-structured documents and notes
- Adapt your writing style to the audience and purpose
- Proofread and edit content for clarity
- Organize information logically with proper headings
Always aim for clarity and readability in your writing.`,
  },
  analyst: {
    tools: ["shopify_get_orders", "shopify_get_products", "stripe_list_customers", "stripe_list_invoices"],
    prompt: `You are an insightful Data Analyst. Your role is to:
- Analyze data from Shopify, Stripe, and other sources
- Identify trends, patterns, and anomalies
- Create clear visualizations and reports
- Provide actionable recommendations based on data
Always back your insights with concrete data points.`,
  },
  coordinator: {
    tools: ["notes_create", "calendar_create_event", "gmail_send_email"],
    prompt: `You are an efficient Task Coordinator. Your role is to:
- Break down complex projects into manageable tasks
- Assign priorities and deadlines appropriately
- Track progress and follow up on pending items
- Coordinate communication between team members
Always keep the big picture in mind while managing details.`,
  },
  sales_rep: {
    tools: ["gmail_send_email", "gmail_search_emails", "stripe_list_customers", "calendar_create_event"],
    prompt: `You are a professional Sales Representative. Your role is to:
- Handle customer inquiries and communications
- Follow up on leads and opportunities
- Schedule meetings and calls with prospects
- Track customer interactions and history
Always be professional, helpful, and solution-oriented.`,
  },
};

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  employee,
  existingEmployees,
}: CreateEmployeeDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [canDelegateTo, setCanDelegateTo] = useState<string[]>([]);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
      setDescription(employee.description || "");
      setSystemPrompt(employee.system_prompt || "");
      setAllowedTools(employee.allowed_tools || []);
      setCanDelegateTo(employee.can_delegate_to || []);
    } else {
      resetForm();
    }
  }, [employee, open]);

  const resetForm = () => {
    setName("");
    setRole("");
    setDescription("");
    setSystemPrompt("");
    setAllowedTools([]);
    setCanDelegateTo([]);
    setActiveTab("basic");
  };

  const applyTemplate = () => {
    if (role && ROLE_TEMPLATES[role]) {
      const template = ROLE_TEMPLATES[role];
      setAllowedTools(template.tools);
      setSystemPrompt(template.prompt);
      toast.success("Template applied");
    }
  };

  const toggleTool = (tool: string) => {
    setAllowedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const toggleDelegate = (employeeId: string) => {
    setCanDelegateTo((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
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

      if (!orgMember) {
        toast.error("Organization not found");
        return;
      }

      const employeeData = {
        name,
        role,
        description,
        system_prompt: systemPrompt,
        allowed_tools: allowedTools,
        can_delegate_to: canDelegateTo,
        org_id: orgMember.org_id,
        created_by: user?.id,
      };

      if (employee) {
        const { error } = await supabase
          .from("ai_employees")
          .update(employeeData)
          .eq("id", employee.id);

        if (error) throw error;
        toast.success("Employee updated");
      } else {
        const { error } = await supabase.from("ai_employees").insert(employeeData);

        if (error) throw error;
        toast.success("Employee created");
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit AI Employee" : "Create AI Employee"}</DialogTitle>
          <DialogDescription>
            Configure a specialized AI agent with specific capabilities
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="tools">Tools & Permissions</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="basic" className="space-y-4 px-1">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex the Researcher"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div>
                          <p className="font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this employee does..."
                  rows={3}
                />
              </div>

              {role && (
                <Button variant="outline" onClick={applyTemplate} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply {ROLES.find((r) => r.value === role)?.label} Template
                </Button>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4 px-1">
              <div className="space-y-3">
                <Label>Allowed Tools</Label>
                <p className="text-sm text-muted-foreground">
                  Select which tools this employee can use
                </p>

                {AVAILABLE_TOOLS.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {category.category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.tools.map((tool) => (
                        <Badge
                          key={tool}
                          variant={allowedTools.includes(tool) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTool(tool)}
                        >
                          {tool.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {existingEmployees.filter((e) => e.id !== employee?.id).length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label>Can Delegate To</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this employee to delegate subtasks to others
                  </p>
                  <div className="space-y-2">
                    {existingEmployees
                      .filter((e) => e.id !== employee?.id)
                      .map((emp) => (
                        <div key={emp.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`delegate-${emp.id}`}
                            checked={canDelegateTo.includes(emp.id)}
                            onCheckedChange={() => toggleDelegate(emp.id)}
                          />
                          <label
                            htmlFor={`delegate-${emp.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {emp.name} ({emp.role.replace("_", " ")})
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4 px-1">
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <p className="text-sm text-muted-foreground">
                  Define this employee's personality, expertise, and guidelines
                </p>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {employee ? "Update" : "Create"} Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
