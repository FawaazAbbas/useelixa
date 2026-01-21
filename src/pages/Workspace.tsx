import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ElixaLogo } from "@/components/ElixaLogo";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plug, Key, Activity } from "lucide-react";

const Workspace = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, loading: workspaceLoading } = useWorkspace();

  if (authLoading || workspaceLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <ElixaLogo size={48} className="animate-pulse" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <ElixaLogo size={32} />
          <span className="font-bold text-xl">Elixa Workspace</span>
        </div>
      </header>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center py-12">
              <ElixaLogo size={64} className="mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Welcome to Elixa</h1>
              <p className="text-muted-foreground mb-8">
                Your Tool Hub + MCP Connector Platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/connections")}>
                <CardContent className="pt-6 text-center">
                  <Plug className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">Connections</h3>
                  <p className="text-sm text-muted-foreground">Browse and connect integrations</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/settings")}>
                <CardContent className="pt-6 text-center">
                  <Key className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">MCP Access</h3>
                  <p className="text-sm text-muted-foreground">Manage API tokens</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/logs")}>
                <CardContent className="pt-6 text-center">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">Activity Logs</h3>
                  <p className="text-sm text-muted-foreground">View tool call history</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
  );
};

export default Workspace;
