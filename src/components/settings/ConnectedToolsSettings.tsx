import { useState, useEffect } from "react";
import { Plug, Check, ExternalLink, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string;
  category: string;
  auth_type: string;
  status: string;
  is_connected: boolean;
  connected_at: string | null;
}

export const ConnectedToolsSettings = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // For demo mode, show integrations from database
        const { data } = await supabase
          .from('integrations')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (data) {
          setIntegrations(data.map(i => ({ ...i, is_connected: false, connected_at: null })));
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-integrations?action=list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.integrations) {
        setIntegrations(result.integrations);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setConnectingId(integrationId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to connect tools');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-integrations?action=connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrationId }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Tool connected successfully');
        fetchIntegrations();
      } else {
        toast.error(result.error || 'Failed to connect tool');
      }
    } catch (error) {
      console.error('Error connecting tool:', error);
      toast.error('Failed to connect tool');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-integrations?action=disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrationId }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Tool disconnected');
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error disconnecting tool:', error);
      toast.error('Failed to disconnect tool');
    }
  };

  const filteredIntegrations = integrations.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedTools = filteredIntegrations.filter(i => i.is_connected);
  const availableTools = filteredIntegrations.filter(i => !i.is_connected);

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Connected Tools */}
          {connectedTools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Connected Tools ({connectedTools.length})
                </CardTitle>
                <CardDescription>
                  Tools that are enabled and available via MCP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {connectedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-green-500/5 border-green-500/20"
                    >
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool.name}</span>
                          <Badge variant="secondary" className="text-xs">{tool.category}</Badge>
                        </div>
                        {tool.description && (
                          <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(tool.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Available Tools ({availableTools.length})
              </CardTitle>
              <CardDescription>
                Connect tools to expose them via the MCP protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No tools match your search" : "All available tools are connected"}
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool.name}</span>
                          <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                          {tool.status === 'coming_soon' && (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                          )}
                          {tool.status === 'beta' && (
                            <Badge className="text-xs bg-blue-500">Beta</Badge>
                          )}
                        </div>
                        {tool.description && (
                          <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConnect(tool.id)}
                        disabled={connectingId === tool.id || tool.status === 'coming_soon'}
                      >
                        {connectingId === tool.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
