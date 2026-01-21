import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Key, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { McpAccessSettings } from "@/components/settings/McpAccessSettings";
import { ConnectedToolsSettings } from "@/components/settings/ConnectedToolsSettings";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.email?.split("@")[0] || "User");
  const [bio, setBio] = useState("");

  const handleUpdateProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleChangePassword = () => {
    toast.info("Password change email sent");
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-muted/20">
      <MainNavSidebar />
      
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="py-6 px-4 md:py-8 max-w-4xl mx-auto animate-fade-in">
          <Button 
            variant="ghost" 
            className="gap-2 mb-6"
            onClick={() => navigate("/workspace")}
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
              Manage your account, tools, and MCP access
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
            <TabsList className="w-full grid grid-cols-4 h-auto">
              <TabsTrigger value="profile" className="text-xs md:text-sm py-3 touch-manipulation">
                <User className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs md:text-sm py-3 touch-manipulation">
                <Lock className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Security
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs md:text-sm py-3 touch-manipulation">
                <Plug className="h-4 w-4 mr-1.5 hidden sm:inline" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="mcp" className="text-xs md:text-sm py-3 touch-manipulation">
                <Key className="h-4 w-4 mr-1.5 hidden sm:inline" />
                MCP Access
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
                <CardContent className="space-y-4">
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
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="h-11"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} className="w-full sm:w-auto h-11 touch-manipulation">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="h-11"
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full sm:w-auto h-11 touch-manipulation">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <ConnectedToolsSettings />
            </TabsContent>

            <TabsContent value="mcp">
              <McpAccessSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
