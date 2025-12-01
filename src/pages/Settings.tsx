import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { DemoBanner } from "@/components/DemoBanner";
import { mockProfile } from "@/data/mockSettings";

const Settings = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(mockProfile.display_name);
  const [bio, setBio] = useState(mockProfile.bio);

  const handleUpdateProfile = () => {
    toast("Demo Mode", {
      description: "Profile changes won't be saved in demo mode",
    });
  };

  const handleChangePassword = () => {
    toast("Demo Mode", {
      description: "Password changes disabled in demo mode",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <DemoBanner />
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Button 
            variant="ghost" 
            className="gap-2 mb-4 md:mb-6"
            onClick={() => navigate("/workspace")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Settings</h1>

          <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
            <TabsList className="w-full grid grid-cols-2 h-auto">
              <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="security" className="text-xs md:text-sm">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={mockProfile.email} disabled />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
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
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      disabled
                    />
                  </div>
                  <Button onClick={handleChangePassword}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
