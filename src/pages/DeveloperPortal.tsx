import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BarChart3, Bot, Plus, ScrollText, BookOpen, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeveloperPortal } from "@/hooks/useDeveloperPortal";
import { DeveloperSidebar, type DeveloperSection } from "@/components/developer/DeveloperSidebar";
import { DeveloperOverview } from "@/components/developer/DeveloperOverview";
import { AgentList } from "@/components/developer/AgentList";
import { AgentSubmissionForm } from "@/components/developer/AgentSubmissionForm";
import { ExecutionLogs } from "@/components/developer/ExecutionLogs";
import { ApiDocsPage } from "@/components/developer/ApiDocsPage";
import { DeveloperSettings } from "@/components/developer/DeveloperSettings";
import { Badge } from "@/components/ui/badge";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

const sectionMeta: Record<DeveloperSection, { title: string; icon: React.ElementType }> = {
  overview: { title: "Overview", icon: BarChart3 },
  agents: { title: "My Agents", icon: Bot },
  submit: { title: "Submit Agent", icon: Plus },
  logs: { title: "Execution Logs", icon: ScrollText },
  docs: { title: "API Documentation", icon: BookOpen },
  settings: { title: "Settings", icon: Settings },
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
    updateAgent,
    duplicateAgent,
    submitForReview,
    deleteAgent,
    validateAgent,
  } = useDeveloperPortal();

  useEffect(() => {
    if (!loading && !user) navigate("/developer/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !isDeveloper) navigate("/developer/auth");
  }, [loading, user, isDeveloper, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/developer/auth");
  };

  const handleDuplicate = async (agent: AgentSubmission) => {
    await duplicateAgent(agent);
    setActiveSection("agents");
  };

  const { title, icon: SectionIcon } = sectionMeta[activeSection];

  return (
    <div className="flex h-screen bg-background">
      <DeveloperSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 border-b bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between gap-4 md:pl-6 pl-16">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <SectionIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            {activeSection === "agents" && agents.length > 0 && (
              <Badge variant="secondary" className="flex-shrink-0">{agents.length}</Badge>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
          <div className="mx-auto max-w-6xl">
            {activeSection === "overview" && (
              <DeveloperOverview agents={agents} onNavigate={setActiveSection} />
            )}
            {activeSection === "agents" && (
              <AgentList
                agents={agents}
                onSubmitForReview={submitForReview}
                onDelete={deleteAgent}
                onValidate={validateAgent}
                onUpdate={updateAgent}
                onDuplicate={handleDuplicate}
              />
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
    </div>
  );
};

export default DeveloperPortal;
