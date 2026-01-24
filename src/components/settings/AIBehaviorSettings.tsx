import { useState, useEffect } from "react";
import { Bot, Shield, Sparkles, Clock, Save, RefreshCw, Pause, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAdminAction } from "@/utils/auditLog";

interface OrgSettings {
  id: string;
  org_id: string;
  ai_auto_approve_read: boolean;
  ai_auto_approve_write: boolean;
  ai_response_style: "concise" | "balanced" | "detailed";
  ai_allowed_tools: string[];
  ai_restricted_tools: string[];
  require_approval_for_external: boolean;
  max_ai_calls_per_day: number | null;
  ai_paused?: boolean;
  auto_approved_tools?: string[];
}

const AI_TOOLS = [
  { id: "search_knowledge_base", name: "Search Knowledge Base", description: "Search uploaded documents", isWrite: false },
  { id: "list_calendar_events", name: "Calendar Access", description: "View calendar events", isWrite: false },
  { id: "create_note", name: "Create Notes", description: "Create and save notes", isWrite: true },
  { id: "create_subtask", name: "Create Subtasks", description: "Break tasks into subtasks", isWrite: true },
  { id: "gmail_list", name: "Gmail - List Emails", description: "View email inbox", isWrite: false },
  { id: "gmail_send", name: "Gmail - Send Emails", description: "Send emails", isWrite: true },
  { id: "calendar_create", name: "Calendar - Create Events", description: "Create calendar events", isWrite: true },
  { id: "stripe_list", name: "Stripe - View Data", description: "View payments and customers", isWrite: false },
  { id: "shopify_list", name: "Shopify - View Data", description: "View orders and products", isWrite: false },
];

export const AIBehaviorSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [formData, setFormData] = useState({
    ai_auto_approve_read: true,
    ai_auto_approve_write: false,
    ai_response_style: "balanced" as "concise" | "balanced" | "detailed",
    ai_allowed_tools: ["search_knowledge_base", "list_calendar_events", "create_note", "create_subtask"],
    require_approval_for_external: true,
    max_ai_calls_per_day: 100,
    ai_paused: false,
    auto_approved_tools: [] as string[],
  });

  useEffect(() => {
    if (user) {
      loadOrgAndSettings();
    }
  }, [user]);

  const loadOrgAndSettings = async () => {
    if (!user) return;

    try {
      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) {
        setLoading(false);
        return;
      }

      setOrgId(orgMember.org_id);
      setIsAdmin(orgMember.role === "owner" || orgMember.role === "admin");

      // Get org settings
      const { data: orgSettings } = await supabase
        .from("org_settings")
        .select("*")
        .eq("org_id", orgMember.org_id)
        .single();

      if (orgSettings) {
        setSettings(orgSettings as OrgSettings);
        setFormData({
          ai_auto_approve_read: orgSettings.ai_auto_approve_read,
          ai_auto_approve_write: orgSettings.ai_auto_approve_write,
          ai_response_style: orgSettings.ai_response_style as "concise" | "balanced" | "detailed",
          ai_allowed_tools: orgSettings.ai_allowed_tools || [],
          require_approval_for_external: orgSettings.require_approval_for_external,
          max_ai_calls_per_day: orgSettings.max_ai_calls_per_day || 100,
          ai_paused: orgSettings.ai_paused || false,
          auto_approved_tools: orgSettings.auto_approved_tools || [],
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);

    try {
      const updateData = {
        org_id: orgId,
        ai_auto_approve_read: formData.ai_auto_approve_read,
        ai_auto_approve_write: formData.ai_auto_approve_write,
        ai_response_style: formData.ai_response_style,
        ai_allowed_tools: formData.ai_allowed_tools,
        require_approval_for_external: formData.require_approval_for_external,
        max_ai_calls_per_day: formData.max_ai_calls_per_day,
        ai_paused: formData.ai_paused,
        auto_approved_tools: formData.auto_approved_tools,
        updated_at: new Date().toISOString(),
      };

      if (settings) {
        // Update existing
        const { error } = await supabase
          .from("org_settings")
          .update(updateData)
          .eq("id", settings.id);

        if (error) throw error;

        // Log admin action
        const actionType = formData.ai_paused !== settings.ai_paused 
          ? (formData.ai_paused ? "ai_paused" : "ai_resumed")
          : "setting_change";

        await logAdminAction({
          actionType,
          entityType: "org_settings",
          entityId: settings.id,
          oldValue: {
            ai_paused: settings.ai_paused,
            auto_approved_tools: settings.auto_approved_tools,
            ai_response_style: settings.ai_response_style,
            ai_allowed_tools: settings.ai_allowed_tools,
          },
          newValue: {
            ai_paused: formData.ai_paused,
            auto_approved_tools: formData.auto_approved_tools,
            ai_response_style: formData.ai_response_style,
            ai_allowed_tools: formData.ai_allowed_tools,
          },
        });
      } else {
        // Insert new
        const { data: inserted, error } = await supabase
          .from("org_settings")
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;

        // Log admin action for new settings
        await logAdminAction({
          actionType: "setting_created",
          entityType: "org_settings",
          entityId: inserted?.id,
          newValue: {
            ai_paused: formData.ai_paused,
            auto_approved_tools: formData.auto_approved_tools,
            ai_response_style: formData.ai_response_style,
          },
        });
      }

      toast.success("AI settings saved successfully");
      loadOrgAndSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToolToggle = (toolId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      ai_allowed_tools: checked
        ? [...prev.ai_allowed_tools, toolId]
        : prev.ai_allowed_tools.filter((t) => t !== toolId),
    }));
  };

  const handleAutoApproveToggle = (toolId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      auto_approved_tools: checked
        ? [...prev.auto_approved_tools, toolId]
        : prev.auto_approved_tools.filter((t) => t !== toolId),
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!orgId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-1">No Organization</h3>
          <p className="text-muted-foreground text-sm">
            Join an organization to configure AI behavior settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Pause Toggle */}
      <Card className={formData.ai_paused ? "border-destructive/50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.ai_paused ? (
              <Pause className="h-5 w-5 text-destructive" />
            ) : (
              <Play className="h-5 w-5 text-green-500" />
            )}
            AI Status
            {formData.ai_paused && (
              <Badge variant="destructive" className="ml-2">Paused</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Temporarily disable AI assistant for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.ai_paused && (
            <Alert className="mb-4">
              <Pause className="h-4 w-4" />
              <AlertDescription>
                AI assistant is currently paused. Users will see a message that AI is temporarily unavailable.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pause AI Assistant</Label>
              <p className="text-sm text-muted-foreground">
                When paused, the AI will not process any requests
              </p>
            </div>
            <Switch
              checked={formData.ai_paused}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, ai_paused: checked }))
              }
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Approval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Action Approval
          </CardTitle>
          <CardDescription>
            Control which AI actions require your approval before executing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve read operations</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to view data without confirmation (emails, calendar, etc.)
              </p>
            </div>
            <Switch
              checked={formData.ai_auto_approve_read}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, ai_auto_approve_read: checked }))
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve write operations</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to send emails, create events, etc. without confirmation
              </p>
            </div>
            <Switch
              checked={formData.ai_auto_approve_write}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, ai_auto_approve_write: checked }))
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require approval for external services</Label>
              <p className="text-sm text-muted-foreground">
                Always ask before connecting to third-party APIs
              </p>
            </div>
            <Switch
              checked={formData.require_approval_for_external}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, require_approval_for_external: checked }))
              }
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Response Style
          </CardTitle>
          <CardDescription>
            Customize how the AI assistant communicates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Response verbosity</Label>
            <Select
              value={formData.ai_response_style}
              onValueChange={(value: "concise" | "balanced" | "detailed") =>
                setFormData((prev) => ({ ...prev, ai_response_style: value }))
              }
              disabled={!isAdmin}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise - Brief, to-the-point responses</SelectItem>
                <SelectItem value="balanced">Balanced - Standard detail level</SelectItem>
                <SelectItem value="detailed">Detailed - Thorough explanations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tool Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Allowed AI Tools
          </CardTitle>
          <CardDescription>
            Select which tools the AI assistant can use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {AI_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={tool.id}
                  checked={formData.ai_allowed_tools.includes(tool.id)}
                  onCheckedChange={(checked) => handleToolToggle(tool.id, checked as boolean)}
                  disabled={!isAdmin}
                />
                <div className="flex-1">
                  <Label htmlFor={tool.id} className="font-medium cursor-pointer">
                    {tool.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Approved Tools (Skip Confirmation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Approved Tools
          </CardTitle>
          <CardDescription>
            These tools will execute immediately without asking for confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {AI_TOOLS.filter(t => t.isWrite).map((tool) => (
              <div
                key={`auto-${tool.id}`}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`auto-${tool.id}`}
                  checked={formData.auto_approved_tools.includes(tool.id)}
                  onCheckedChange={(checked) => handleAutoApproveToggle(tool.id, checked as boolean)}
                  disabled={!isAdmin}
                />
                <div className="flex-1">
                  <Label htmlFor={`auto-${tool.id}`} className="font-medium cursor-pointer">
                    {tool.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">Write</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Use with caution: Auto-approved tools will execute without human review.
          </p>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usage Limits
          </CardTitle>
          <CardDescription>
            Set daily limits for AI operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="max-calls">Maximum AI calls per day</Label>
            <Input
              id="max-calls"
              type="number"
              value={formData.max_ai_calls_per_day}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  max_ai_calls_per_day: parseInt(e.target.value) || 0,
                }))
              }
              disabled={!isAdmin}
              min={0}
              max={10000}
            />
            <p className="text-sm text-muted-foreground">
              Set to 0 for unlimited. Current: {formData.max_ai_calls_per_day || "Unlimited"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isAdmin && (
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save AI Settings
            </>
          )}
        </Button>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Only organization owners and admins can modify these settings.
        </p>
      )}
    </div>
  );
};