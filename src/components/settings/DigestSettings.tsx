import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface DigestConfig {
  id: string;
  is_enabled: boolean;
  delivery_time: string;
  timezone: string;
  include_emails: boolean;
  include_tasks: boolean;
  include_calendar: boolean;
  include_metrics: boolean;
  include_ai_suggestions: boolean;
  email_delivery: boolean;
}

interface DigestSettingsProps {
  onClose: () => void;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export function DigestSettings({ onClose }: DigestSettingsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DigestConfig | null>(null);

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("digest_configs")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setConfig(data);
      } else {
        // Create default config
        setConfig({
          id: "",
          is_enabled: true,
          delivery_time: "08:00",
          timezone: "UTC",
          include_emails: true,
          include_tasks: true,
          include_calendar: true,
          include_metrics: true,
          include_ai_suggestions: true,
          email_delivery: false,
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);

      const configData = {
        user_id: user?.id,
        is_enabled: config.is_enabled,
        delivery_time: config.delivery_time,
        timezone: config.timezone,
        include_emails: config.include_emails,
        include_tasks: config.include_tasks,
        include_calendar: config.include_calendar,
        include_metrics: config.include_metrics,
        include_ai_suggestions: config.include_ai_suggestions,
        email_delivery: config.email_delivery,
      };

      const { error } = await supabase.from("digest_configs").upsert(configData, {
        onConflict: "user_id",
      });

      if (error) throw error;

      toast.success("Settings saved");
      onClose();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6 py-4">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Daily Digest</Label>
          <p className="text-sm text-muted-foreground">
            Receive a daily summary of your activity
          </p>
        </div>
        <Switch
          checked={config.is_enabled}
          onCheckedChange={(checked) => setConfig({ ...config, is_enabled: checked })}
        />
      </div>

      <Separator />

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Schedule</h3>

        <div className="space-y-2">
          <Label>Delivery Time</Label>
          <Input
            type="time"
            value={config.delivery_time}
            onChange={(e) => setConfig({ ...config, delivery_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={config.timezone}
            onValueChange={(value) => setConfig({ ...config, timezone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Content to Include</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Emails</Label>
            <Switch
              checked={config.include_emails}
              onCheckedChange={(checked) =>
                setConfig({ ...config, include_emails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Tasks</Label>
            <Switch
              checked={config.include_tasks}
              onCheckedChange={(checked) =>
                setConfig({ ...config, include_tasks: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Calendar</Label>
            <Switch
              checked={config.include_calendar}
              onCheckedChange={(checked) =>
                setConfig({ ...config, include_calendar: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Business Metrics</Label>
            <Switch
              checked={config.include_metrics}
              onCheckedChange={(checked) =>
                setConfig({ ...config, include_metrics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>AI Suggestions</Label>
            <Switch
              checked={config.include_ai_suggestions}
              onCheckedChange={(checked) =>
                setConfig({ ...config, include_ai_suggestions: checked })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Delivery */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Delivery</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label>Email Delivery</Label>
            <p className="text-sm text-muted-foreground">
              Also send digest via email
            </p>
          </div>
          <Switch
            checked={config.email_delivery}
            onCheckedChange={(checked) =>
              setConfig({ ...config, email_delivery: checked })
            }
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={saveConfig} disabled={saving} className="flex-1">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
