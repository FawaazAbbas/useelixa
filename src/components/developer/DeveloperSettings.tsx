import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Copy, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DeveloperProfile } from "@/hooks/useDeveloperPortal";

interface DeveloperSettingsProps {
  profile: DeveloperProfile | null;
  onUpdate: (updates: Partial<DeveloperProfile>) => Promise<void>;
}

export const DeveloperSettings = ({ profile, onUpdate }: DeveloperSettingsProps) => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Notification prefs (local state, placeholder for future DB backing)
  const [notifyApproved, setNotifyApproved] = useState(true);
  const [notifyRejected, setNotifyRejected] = useState(true);
  const [notifyDownloads, setNotifyDownloads] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setWebsite(profile.website || "");
      setBio(profile.developer_bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate({ company_name: companyName, website, developer_bio: bio });
    setSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Developer Profile</CardTitle>
            {profile?.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <CardDescription>Your public developer information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={4} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* API Keys / IDs */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys & IDs</CardTitle>
          <CardDescription>Your developer credentials for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Developer Profile ID</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md truncate">{profile?.id || "—"}</code>
              {profile?.id && (
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(profile.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">User ID</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md truncate">{profile?.user_id || "—"}</code>
              {profile?.user_id && (
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(profile.user_id)}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what email notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Agent Approved</p>
              <p className="text-xs text-muted-foreground">When your agent is approved by reviewers</p>
            </div>
            <Switch checked={notifyApproved} onCheckedChange={setNotifyApproved} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Agent Rejected</p>
              <p className="text-xs text-muted-foreground">When your agent is rejected with feedback</p>
            </div>
            <Switch checked={notifyRejected} onCheckedChange={setNotifyRejected} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Download Milestones</p>
              <p className="text-xs text-muted-foreground">When your agent reaches download milestones</p>
            </div>
            <Switch checked={notifyDownloads} onCheckedChange={setNotifyDownloads} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Deleting your developer account will remove all your agents and data. This action cannot be undone.
          </p>
          <Button variant="destructive" size="sm" disabled>
            Delete Developer Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
