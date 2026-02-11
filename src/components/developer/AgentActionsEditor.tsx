import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

export interface AgentActionDraft {
  action_name: string;
  path: string;
  method: string;
  description: string;
}

interface AgentActionsEditorProps {
  actions: AgentActionDraft[];
  onChange: (actions: AgentActionDraft[]) => void;
  baseUrl?: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const AgentActionsEditor = ({ actions, onChange, baseUrl }: AgentActionsEditorProps) => {
  const updateAction = (index: number, field: keyof AgentActionDraft, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addAction = () => {
    onChange([...actions, { action_name: "", path: "/", method: "POST", description: "" }]);
  };

  const removeAction = (index: number) => {
    if (actions.length <= 1) return;
    onChange(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Agent Actions</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Define the operations your agent exposes. Each action maps to a path relative to your base URL.
        </p>
      </div>

      {actions.map((action, index) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={METHOD_COLORS[action.method] || ""}>{action.method}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {baseUrl ? `${baseUrl.replace(/\/$/, '')}${action.path}` : action.path}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeAction(index)}
              disabled={actions.length <= 1}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Action Name *</Label>
              <Input
                value={action.action_name}
                onChange={(e) => updateAction(index, "action_name", e.target.value)}
                placeholder="e.g. plan"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Path *</Label>
              <Input
                value={action.path}
                onChange={(e) => updateAction(index, "path", e.target.value)}
                placeholder="/plan"
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">HTTP Method</Label>
              <Select value={action.method} onValueChange={(v) => updateAction(index, "method", v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={action.description}
                onChange={(e) => updateAction(index, "description", e.target.value)}
                placeholder="What this action does"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addAction} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Action
      </Button>
    </div>
  );
};
