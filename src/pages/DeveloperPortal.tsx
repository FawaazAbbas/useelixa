import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDeveloperPortal } from "@/hooks/useDeveloperPortal";
import { DeveloperSidebar, type DeveloperSection } from "@/components/developer/DeveloperSidebar";
import { DeveloperOverview } from "@/components/developer/DeveloperOverview";
import { AgentList } from "@/components/developer/AgentList";
import { AgentSubmissionForm } from "@/components/developer/AgentSubmissionForm";
import { ExecutionLogs } from "@/components/developer/ExecutionLogs";
import { ApiDocsPage } from "@/components/developer/ApiDocsPage";
import { DeveloperSettings } from "@/components/developer/DeveloperSettings";

const sectionTitles: Record<DeveloperSection, string> = {
  overview: "Overview",
  agents: "My Agents",
  submit: "Submit Agent",
  logs: "Execution Logs",
  docs: "API Documentation",
  settings: "Settings",
};

const DeveloperPortal = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DeveloperSection>("overview");
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
    if (!loading && !user) navigate("/developer/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !isDeveloper) navigate("/developer/auth");
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DeveloperSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userEmail={user?.email}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger />
              <h1 className="font-semibold text-lg">{sectionTitles[activeSection]}</h1>
            </div>
          </header>
          <div className="p-6">
            {activeSection === "overview" && (
              <DeveloperOverview agents={agents} onNavigate={setActiveSection} />
            )}
            {activeSection === "agents" && (
              <AgentList agents={agents} onSubmitForReview={submitForReview} onDelete={deleteAgent} />
            )}
            {activeSection === "submit" && (
              <AgentSubmissionForm onSubmit={createAgent} userId={user?.id} />
            )}
            {activeSection === "logs" && profile && (
              <ExecutionLogs agents={agents} developerId={profile.id} />
            )}
            {activeSection === "docs" && <ApiDocsPage />}
            {activeSection === "settings" && (
              <DeveloperSettings profile={profile} onUpdate={updateProfile} />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DeveloperPortal;
