import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Building2, Upload, Bot, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { ToolScopeSettings } from "@/components/settings/ToolScopeSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isOrgOwner, setIsOrgOwner] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadOrganization();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || user.email?.split("@")[0] || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
    } else {
      setDisplayName(user.email?.split("@")[0] || "");
    }
  };

  const loadOrganization = async () => {
    if (!user) return;

    const { data: orgMember } = await supabase
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .single();

    if (orgMember) {
      setIsOrgOwner(orgMember.role === "owner");
      setOrgId(orgMember.org_id);

      const { data: org } = await supabase
        .from("orgs")
        .select("name")
        .eq("id", orgMember.org_id)
        .single();

      if (org) {
        setOrgName(org.name);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!orgId || !isOrgOwner) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("orgs")
        .update({ name: orgName })
        .eq("id", orgId);

      if (error) throw error;
      toast.success("Organization updated successfully");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-muted/20">
      <MainNavSidebar />
      
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="py-6 px-4 md:py-8 max-w-4xl mx-auto animate-fade-in">
          <Button 
            variant="ghost" 
            className="gap-2 mb-6"
            onClick={() => navigate("/chat")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your account, organization, and integrations
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
            <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 h-auto">
              <TabsTrigger value="profile" className="text-xs md:text-sm py-3 touch-manipulation">
                <User className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="organization" className="text-xs md:text-sm py-3 touch-manipulation">
                <Building2 className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Org
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-xs md:text-sm py-3 touch-manipulation">
                <CreditCard className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs md:text-sm py-3 touch-manipulation">
                <Bot className="h-4 w-4 mr-1.5 hidden sm:inline" />
                AI
              </TabsTrigger>
              <TabsTrigger value="scopes" className="text-xs md:text-sm py-3 touch-manipulation hidden md:flex">
                <Shield className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Scopes
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs md:text-sm py-3 touch-manipulation hidden md:flex">
                <Lock className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and how others see you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {displayName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Upload new avatar
                        </div>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" value={user?.email || ""} disabled className="h-11" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="w-full sm:w-auto h-11 touch-manipulation"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organization">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your organization details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-sm">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Enter organization name"
                      disabled={!isOrgOwner}
                      className="h-11"
                    />
                    {!isOrgOwner && (
                      <p className="text-xs text-muted-foreground">
                        Only organization owners can change this
                      </p>
                    )}
                  </div>

                  {isOrgOwner && (
                    <Button 
                      onClick={handleUpdateOrganization} 
                      disabled={loading}
                      className="w-full sm:w-auto h-11 touch-manipulation"
                    >
                      {loading ? "Saving..." : "Update Organization"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription, view usage, and purchase credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      View your current plan, usage statistics, and manage your subscription from the Billing page.
                    </p>
                    <Button onClick={() => navigate("/billing")} className="w-full sm:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Go to Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Password Reset</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click the button below to receive a password reset link via email.
                    </p>
                    <Button onClick={handleChangePassword} variant="outline">
                      Send Password Reset Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scopes">
              <ToolScopeSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;