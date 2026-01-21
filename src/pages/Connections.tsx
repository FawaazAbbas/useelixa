import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plug, Search, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { getOAuthUrl } from "@/config/oauth";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logo_url: string;
  status: string | null;
  auth_type: string;
  credential_type: string;
}

interface UserCredential {
  id: string;
  credential_type: string;
  account_email: string | null;
  connected_at: string;
}

// Map integration slugs to OAuth providers and credential types
const INTEGRATION_OAUTH_MAP: Record<string, { provider: string; credentialType: string }> = {
  "google-drive": { provider: "google", credentialType: "googleOAuth2Api" },
  "gmail": { provider: "google", credentialType: "googleOAuth2Api" },
  "google-calendar": { provider: "google", credentialType: "googleOAuth2Api" },
  "google-sheets": { provider: "google", credentialType: "googleOAuth2Api" },
  "notion": { provider: "notion", credentialType: "notionApi" },
  "slack": { provider: "slack", credentialType: "slackOAuth2Api" },
  "microsoft-teams": { provider: "microsoft", credentialType: "microsoftOAuth2Api" },
  "outlook": { provider: "microsoft", credentialType: "microsoftOAuth2Api" },
  "onedrive": { provider: "microsoft", credentialType: "microsoftOAuth2Api" },
  "calendly": { provider: "calendly", credentialType: "calendlyApi" },
  "mailchimp": { provider: "mailchimp", credentialType: "mailchimpOAuth2Api" },
  "shopify": { provider: "shopify", credentialType: "shopifyApi" },
};

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [credentials, setCredentials] = useState<UserCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch integrations
    const { data: integrationsData, error: integrationsError } = await supabase
      .from("integrations")
      .select("*")
      .eq("status", "live")
      .order("display_order");

    if (!integrationsError && integrationsData) {
      setIntegrations(integrationsData);
    }

    // Fetch user credentials if logged in
    if (user) {
      const { data: credentialsData, error: credentialsError } = await supabase
        .from("user_credentials")
        .select("id, credential_type, account_email, created_at")
        .eq("user_id", user.id);

      if (!credentialsError && credentialsData) {
        setCredentials(credentialsData.map(c => ({
          ...c,
          connected_at: c.created_at
        })));
      }
    }

    setLoading(false);
  };

  const getCredentialForIntegration = (integration: Integration): UserCredential | undefined => {
    const mapping = INTEGRATION_OAUTH_MAP[integration.slug];
    if (!mapping) return undefined;
    return credentials.find(c => c.credential_type === mapping.credentialType);
  };

  const handleConnect = async (integration: Integration) => {
    if (!user) {
      toast.error("Please sign in to connect integrations");
      navigate("/auth");
      return;
    }

    const mapping = INTEGRATION_OAUTH_MAP[integration.slug];
    if (!mapping) {
      toast.error(`OAuth not configured for ${integration.name}`);
      return;
    }

    setConnectingId(integration.id);

    // Determine bundle type for Google integrations
    let bundleType: string | undefined;
    if (mapping.provider === "google") {
      if (integration.slug === "gmail") bundleType = "email_workspace";
      else if (integration.slug === "google-drive") bundleType = "email_workspace";
      else if (integration.slug === "google-calendar") bundleType = "email_workspace";
      else if (integration.slug === "google-sheets") bundleType = "email_workspace";
    }

    const oauthUrl = getOAuthUrl(mapping.provider, bundleType);
    
    if (!oauthUrl) {
      toast.error(`OAuth URL not available for ${integration.name}`);
      setConnectingId(null);
      return;
    }

    // Redirect to OAuth provider
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async (integration: Integration) => {
    const credential = getCredentialForIntegration(integration);
    if (!credential) return;

    setDisconnectingId(integration.id);

    try {
      const { error } = await supabase
        .from("user_credentials")
        .delete()
        .eq("id", credential.id);

      if (error) throw error;

      toast.success(`Disconnected from ${integration.name}`);
      setCredentials(prev => prev.filter(c => c.id !== credential.id));
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error(`Failed to disconnect from ${integration.name}`);
    } finally {
      setDisconnectingId(null);
    }
  };

  const categories = [...new Set(integrations.map(i => i.category))].sort();
  
  const filtered = integrations.filter(i => {
    const matchesSearch = !searchQuery || 
      i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Separate connected and available integrations
  const connectedIntegrations = filtered.filter(i => getCredentialForIntegration(i));
  const availableIntegrations = filtered.filter(i => !getCredentialForIntegration(i));

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-card/80 sticky top-0 z-20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl">Connections</span>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Search and filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Connected integrations */}
              {connectedIntegrations.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Connected ({connectedIntegrations.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {connectedIntegrations.map(integration => {
                      const credential = getCredentialForIntegration(integration);
                      return (
                        <Card key={integration.id} className="border-primary/30 bg-primary/5">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <img
                                src={integration.logo_url}
                                alt={integration.name}
                                className="h-10 w-10 rounded object-contain bg-muted p-1"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/elixa-logo.png"; }}
                              />
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {integration.name}
                                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                </CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {credential?.account_email && (
                              <p className="text-xs text-muted-foreground mb-2 truncate">
                                {credential.account_email}
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDisconnect(integration)}
                              disabled={disconnectingId === integration.id}
                            >
                              {disconnectingId === integration.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Disconnecting...
                                </>
                              ) : (
                                "Disconnect"
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available integrations */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Available Integrations ({availableIntegrations.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableIntegrations.map(integration => {
                    const hasOAuth = !!INTEGRATION_OAUTH_MAP[integration.slug];
                    return (
                      <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={integration.logo_url}
                              alt={integration.name}
                              className="h-10 w-10 rounded object-contain bg-muted p-1"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/elixa-logo.png"; }}
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-2 text-xs mb-3">
                            {integration.description || `Connect ${integration.name}`}
                          </CardDescription>
                          <Button
                            variant={hasOAuth ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={() => hasOAuth && handleConnect(integration)}
                            disabled={!hasOAuth || connectingId === integration.id}
                          >
                            {connectingId === integration.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : hasOAuth ? (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Connect
                              </>
                            ) : (
                              "Coming Soon"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No integrations found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
