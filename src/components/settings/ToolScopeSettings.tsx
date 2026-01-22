import { useState, useEffect } from "react";
import { Shield, Eye, Edit, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Credential {
  id: string;
  credential_type: string;
  bundle_type: string | null;
  scopes: string[] | null;
  created_at: string;
}

interface ToolScope {
  id: string;
  name: string;
  description: string;
  type: "read" | "write";
}

const TOOL_SCOPES: Record<string, ToolScope[]> = {
  microsoftOAuth2Api: [
    { id: "Mail.Read", name: "Read emails", description: "View Outlook emails", type: "read" },
    { id: "Mail.Send", name: "Send emails", description: "Send Outlook emails", type: "write" },
    { id: "Calendars.Read", name: "Read calendar", description: "View calendar events", type: "read" },
    { id: "Calendars.ReadWrite", name: "Manage calendar", description: "Create and edit events", type: "write" },
    { id: "Files.Read", name: "Read files", description: "View OneDrive files", type: "read" },
    { id: "Files.ReadWrite", name: "Manage files", description: "Create and edit files", type: "write" },
  ],
  notionOAuth2Api: [
    { id: "read_content", name: "Read content", description: "View Notion pages and databases", type: "read" },
    { id: "insert_content", name: "Insert content", description: "Add new content to pages", type: "write" },
    { id: "update_content", name: "Update content", description: "Modify existing content", type: "write" },
  ],
  slackOAuth2Api: [
    { id: "channels:read", name: "Read channels", description: "View channel information", type: "read" },
    { id: "chat:write", name: "Post messages", description: "Send messages to channels", type: "write" },
    { id: "users:read", name: "Read users", description: "View user information", type: "read" },
  ],
};

const CREDENTIAL_LABELS: Record<string, string> = {
  microsoftOAuth2Api: "Microsoft 365",
  notionOAuth2Api: "Notion",
  slackOAuth2Api: "Slack",
};

export const ToolScopeSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [expandedCredentials, setExpandedCredentials] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_credentials")
        .select("id, credential_type, bundle_type, scopes, created_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setCredentials((data || []) as Credential[]);
    } catch (error) {
      console.error("Error loading credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (credId: string) => {
    const newSet = new Set(expandedCredentials);
    if (newSet.has(credId)) {
      newSet.delete(credId);
    } else {
      newSet.add(credId);
    }
    setExpandedCredentials(newSet);
  };

  const hasScope = (credential: Credential, scopeId: string): boolean => {
    if (!credential.scopes || credential.scopes.length === 0) return false;
    return credential.scopes.some(s => 
      s.toLowerCase().includes(scopeId.toLowerCase())
    );
  };

  const handleRevokeCredential = async (credentialId: string) => {
    try {
      const { error } = await supabase
        .from("user_credentials")
        .delete()
        .eq("id", credentialId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Integration disconnected");
      loadCredentials();
    } catch (error) {
      console.error("Error revoking credential:", error);
      toast.error("Failed to disconnect integration");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (credentials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-1">No Connected Tools</h3>
          <p className="text-muted-foreground text-sm text-center">
            Connect integrations from the Connections page to manage their permissions here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.map((credential) => {
        const scopes = TOOL_SCOPES[credential.credential_type] || [];
        const isExpanded = expandedCredentials.has(credential.id);
        const label = CREDENTIAL_LABELS[credential.credential_type] || credential.credential_type;

        return (
          <Card key={credential.id}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(credential.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <CardTitle className="text-lg">{label}</CardTitle>
                    {credential.bundle_type && (
                      <Badge variant="secondary" className="text-xs">
                        {credential.bundle_type}
                      </Badge>
                    )}
                  </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRevokeCredential(credential.id)}
                  >
                    Disconnect
                  </Button>
                </div>
                <CardDescription>
                  Connected {new Date(credential.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {scopes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No granular scope settings available for this integration.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        {scopes.map((scope) => {
                          const granted = hasScope(credential, scope.id);
                          return (
                            <div
                              key={scope.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                {scope.type === "read" ? (
                                  <Eye className="h-4 w-4 text-primary" />
                                ) : (
                                  <Edit className="h-4 w-4 text-warning" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{scope.name}</span>
                                    <Badge
                                      variant={scope.type === "read" ? "secondary" : "outline"}
                                      className="text-xs"
                                    >
                                      {scope.type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{scope.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {granted ? (
                                  <Badge className="bg-primary/10 text-primary border-primary/20">
                                    Granted
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Not granted
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-xs text-muted-foreground mt-4">
                        To modify permissions, disconnect and reconnect the integration with updated scope selection.
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};