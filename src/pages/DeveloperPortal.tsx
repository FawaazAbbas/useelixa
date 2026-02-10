import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeveloperPortal } from "@/hooks/useDeveloperPortal";
import { DeveloperStats } from "@/components/developer/DeveloperStats";
import { AgentList } from "@/components/developer/AgentList";
import { AgentSubmissionForm } from "@/components/developer/AgentSubmissionForm";
import { DeveloperProfileForm } from "@/components/developer/DeveloperProfileForm";

const DeveloperPortal = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    agents,
    loading,
    isDeveloper,
    updateProfile,
    createAgent,
    submitForReview,
    deleteAgent,
  } = useDeveloperPortal();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/developer/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !isDeveloper) {
      navigate("/developer/auth");
    }
  }, [loading, user, isDeveloper, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/developer/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Developer Portal</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="submit">Submit Agent</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DeveloperStats agents={agents} />
          </TabsContent>

          <TabsContent value="agents">
            <AgentList agents={agents} onSubmitForReview={submitForReview} onDelete={deleteAgent} />
          </TabsContent>

          <TabsContent value="submit">
            <AgentSubmissionForm onSubmit={createAgent} userId={user?.id} />
          </TabsContent>

          <TabsContent value="profile">
            <DeveloperProfileForm profile={profile} onUpdate={updateProfile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeveloperPortal;
