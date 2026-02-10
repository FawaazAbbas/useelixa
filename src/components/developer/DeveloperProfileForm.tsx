import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import type { DeveloperProfile } from "@/hooks/useDeveloperPortal";

interface DeveloperProfileFormProps {
  profile: DeveloperProfile | null;
  onUpdate: (updates: Partial<DeveloperProfile>) => Promise<void>;
}

export const DeveloperProfileForm = ({ profile, onUpdate }: DeveloperProfileFormProps) => {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setWebsite(profile.website || "");
      setBio(profile.developer_bio || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate({ company_name: companyName, website, developer_bio: bio });
    setSaving(false);
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};
