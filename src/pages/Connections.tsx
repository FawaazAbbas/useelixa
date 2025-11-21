import { useState, useEffect } from "react";
import { Plug, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ConnectionStatus {
  type: string;
  connected: boolean;
  lastConnected?: string;
}

const CREDENTIAL_INFO = {
  googleOAuth2Api: {
    name: "Google (Gmail, Calendar, Drive)",
    description: "Connect your Google account to enable Gmail, Google Calendar, and Google Drive integrations",
    icon: "🔗",
  },
  notionApi: {
    name: "Notion",
    description: "Connect Notion to manage pages, databases, and content",
    icon: "📝",
  },
  slackApi: {
    name: "Slack",
    description: "Connect Slack to send messages and manage channels",
    icon: "💬",
  },
};

export default function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_credentials")
        .select("credential_type, updated_at")
        .eq("user_id", user.id);

      if (error) throw error;

      const connectedTypes = new Set(data?.map(c => c.credential_type) || []);
      const statusList = Object.keys(CREDENTIAL_INFO).map(type => ({
        type,
        connected: connectedTypes.has(type),
        lastConnected: data?.find(c => c.credential_type === type)?.updated_at,
      }));

      setConnections(statusList);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (credentialType: string) => {
    if (!user) return;

    setConnecting(credentialType);

    const state = btoa(JSON.stringify({
      userId: user.id,
      credentialType,
      returnTo: "/connections",
    }));

    const redirectUri = `${window.location.origin}/oauth/callback`;
    let authUrl = "";

    switch (credentialType) {
      case "googleOAuth2Api":
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/tasks')}&access_type=offline&prompt=consent&state=${state}`;
        break;
      case "notionApi":
        authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${import.meta.env.VITE_NOTION_CLIENT_ID || 'YOUR_NOTION_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&owner=user&state=${state}`;
        break;
      case "slackApi":
        authUrl = `https://slack.com/oauth/v2/authorize?client_id=${import.meta.env.VITE_SLACK_CLIENT_ID || 'YOUR_SLACK_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=chat:write,channels:read&state=${state}`;
        break;
    }

    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleDisconnect = async (credentialType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_credentials")
        .delete()
        .eq("user_id", user.id)
        .eq("credential_type", credentialType);

      if (error) throw error;

      toast.success(`${CREDENTIAL_INFO[credentialType as keyof typeof CREDENTIAL_INFO].name} disconnected`);
      fetchConnections();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Plug className="h-8 w-8" />
          Connections
        </h1>
        <p className="text-muted-foreground">
          Manage your service connections. Connect once, use across all agents.
        </p>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => {
          const info = CREDENTIAL_INFO[connection.type as keyof typeof CREDENTIAL_INFO];
          return (
            <Card key={connection.type}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{info.icon}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {info.name}
                        {connection.connected ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                      {connection.connected && connection.lastConnected && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Connected {new Date(connection.lastConnected).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {connection.connected ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(connection.type)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect(connection.type)}
                        disabled={connecting === connection.type}
                      >
                        {connecting === connection.type ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
