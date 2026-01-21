import { useState, useEffect } from "react";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Check, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface McpToken {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export const McpAccessSettings = () => {
  const [tokens, setTokens] = useState<McpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenLabel, setNewTokenLabel] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const mcpServerUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp`;

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('mcp-tokens', {
        body: null,
        headers: { Authorization: `Bearer ${session.access_token}` },
        method: 'GET',
      });

      // For GET requests, use query params
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-tokens?action=list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.tokens) {
        setTokens(result.tokens);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!newTokenLabel.trim()) {
      toast.error('Please enter a label for the token');
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to create tokens');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-tokens?action=create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: newTokenLabel.trim() }),
      });

      const result = await response.json();
      if (result.token) {
        setNewToken(result.token);
        setShowToken(true);
        fetchTokens();
        toast.success('Token created successfully');
      } else {
        toast.error(result.error || 'Failed to create token');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-tokens?action=revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId }),
      });

      const result = await response.json();
      if (result.success) {
        fetchTokens();
        toast.success('Token revoked');
      } else {
        toast.error(result.error || 'Failed to revoke token');
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      toast.error('Failed to revoke token');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewTokenLabel("");
    setNewToken(null);
    setShowToken(false);
  };

  const activeTokens = tokens.filter(t => !t.revoked_at);
  const revokedTokens = tokens.filter(t => t.revoked_at);

  return (
    <div className="space-y-6">
      {/* MCP Server Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            MCP Server Configuration
          </CardTitle>
          <CardDescription>
            Connect external AI clients like Claude Desktop or Cursor to Elixa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">MCP Server URL</Label>
            <div className="flex gap-2">
              <Input 
                value={mcpServerUrl} 
                readOnly 
                className="font-mono text-sm bg-muted"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(mcpServerUrl)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Quick Setup:</strong> Add this to your MCP client configuration with a Bearer token from below.
              <br />
              <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                Authorization: Bearer elixa_your_token_here
              </code>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.elixa.ai/mcp" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Tokens */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Tokens</CardTitle>
              <CardDescription>
                Create tokens to authenticate MCP clients
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Token</DialogTitle>
                  <DialogDescription>
                    Give your token a descriptive label to identify its use
                  </DialogDescription>
                </DialogHeader>
                
                {!newToken ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Token Label</Label>
                      <Input
                        placeholder="e.g., Claude Desktop, Cursor IDE"
                        value={newTokenLabel}
                        onChange={(e) => setNewTokenLabel(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                      <Button onClick={createToken} disabled={creating}>
                        {creating ? "Creating..." : "Create Token"}
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <Alert className="border-green-500/50 bg-green-500/10">
                      <Check className="h-4 w-4 text-green-500" />
                      <AlertDescription>
                        Token created! Copy it now — you won't be able to see it again.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label>Your Token</Label>
                      <div className="flex gap-2">
                        <Input
                          value={showToken ? newToken : '•'.repeat(40)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(newToken)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleDialogClose}>Done</Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active tokens</p>
              <p className="text-sm">Create a token to connect MCP clients</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.label}</span>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(token.created_at), 'MMM d, yyyy')}
                      {token.last_used_at && (
                        <> • Last used {format(new Date(token.last_used_at), 'MMM d, yyyy')}</>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeToken(token.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {revokedTokens.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">Revoked Tokens</p>
              <div className="space-y-2">
                {revokedTokens.slice(0, 3).map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-muted-foreground"
                  >
                    <span className="text-sm">{token.label}</span>
                    <Badge variant="outline" className="text-xs">Revoked</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
