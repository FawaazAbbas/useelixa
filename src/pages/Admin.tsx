import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminBlogTab } from "@/components/admin/AdminBlogTab";

interface DeveloperApplication {
  id: string;
  name: string;
  email: string;
  skills: string[] | null;
  message: string | null;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [developerApplications, setDeveloperApplications] = useState<DeveloperApplication[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from("developer_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setDeveloperApplications(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (adminLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <AdminOverviewTab
            waitlistSignups={[]}
            developerApplications={developerApplications}
            onNavigate={setActiveTab}
          />
        );
      case "blog":
        return <AdminBlogTab />;
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview": return "Dashboard Overview";
      case "blog": return "Blog Management";
      default: return "Admin Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={fetchData}
        onSignOut={handleSignOut}
        refreshing={refreshing}
        waitlistCount={0}
        developerCount={developerApplications.length}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
