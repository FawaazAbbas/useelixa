import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ElixaLogo } from "@/components/ElixaLogo";
import { Card, CardContent } from "@/components/ui/card";
import { Plug, Key, Activity, LayoutDashboard } from "lucide-react";
import { PageLayout, PageEmptyState, CardGrid } from "@/components/PageLayout";

const Workspace = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, loading: workspaceLoading } = useWorkspace();

  if (authLoading || workspaceLoading) {
    return (
      <PageLayout title="Workspace" icon={LayoutDashboard}>
        <div className="flex items-center justify-center py-16">
          <ElixaLogo size={48} className="animate-pulse" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <PageLayout title="Workspace" icon={LayoutDashboard}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <ElixaLogo size={64} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Elixa</h2>
          <p className="text-muted-foreground">
            Your Tool Hub + MCP Connector Platform
          </p>
        </div>

        <CardGrid columns={3}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/30" onClick={() => navigate("/connections")}>
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                <Plug className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Connections</h3>
              <p className="text-sm text-muted-foreground">Browse and connect integrations</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/30" onClick={() => navigate("/settings")}>
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                <Key className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">MCP Access</h3>
              <p className="text-sm text-muted-foreground">Manage API tokens</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/30" onClick={() => navigate("/logs")}>
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Activity Logs</h3>
              <p className="text-sm text-muted-foreground">View tool call history</p>
            </CardContent>
          </Card>
        </CardGrid>
      </div>
    </PageLayout>
  );
};

export default Workspace;
