import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plug, Search, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout, PageEmptyState, SectionHeader, CardGrid } from "@/components/PageLayout";
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
  scopes: string[] | null;
  connected_at: string;
}

// OAuth mapping - excluding Google services
const INTEGRATION_OAUTH_MAP: Record<string, { provider: string; credentialType: string; bundleType?: string }> = {
  // Other providers
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
    
    const { data: integrationsData } = await supabase
      .from("integrations")
      .select("*")
      .eq("status", "live")
      .order("display_order");

    if (integrationsData) setIntegrations(integrationsData);

    if (user) {
      const { data: credentialsData } = await supabase
        .from("user_credentials")
        .select("id, credential_type, account_email, scopes, created_at")
        .eq("user_id", user.id);

      if (credentialsData) {
        setCredentials(credentialsData.map(c => ({
          ...c,
          scopes: c.scopes || null,
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

    // Use the bundle type from the mapping if available
    const bundleType = mapping.bundleType;

    const oauthUrl = getOAuthUrl(mapping.provider, bundleType);
    
    if (!oauthUrl) {
      toast.error(`OAuth URL not available for ${integration.name}`);
      setConnectingId(null);
      return;
    }

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
    const matchesSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const connectedIntegrations = filtered.filter(i => getCredentialForIntegration(i));
  const availableIntegrations = filtered.filter(i => !getCredentialForIntegration(i));

  return (
    <PageLayout
      title="Connections"
      icon={Plug}
      badge={connectedIntegrations.length > 0 ? `${connectedIntegrations.length} connected` : undefined}
      fullWidth
    >
      {/* Search and filters */}
      <div className="flex flex-wrap gap-4 mb-8">
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
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {connectedIntegrations.length > 0 && (
            <div className="mb-10">
              <SectionHeader title="Connected" count={connectedIntegrations.length} icon={CheckCircle2} />
              <CardGrid columns={4}>
                {connectedIntegrations.map(integration => {
                  const credential = getCredentialForIntegration(integration);
                  return (
                    <Card key={integration.id} className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={integration.logo_url}
                            alt={integration.name}
                            className="h-10 w-10 rounded-lg object-contain bg-background p-1.5 border"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/elixa-logo.png"; }}
                          />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {integration.name}
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px] mt-1">{integration.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {credential?.account_email && (
                          <p className="text-xs text-muted-foreground mb-3 truncate">
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
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Disconnecting...</>
                          ) : "Disconnect"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardGrid>
            </div>
          )}

          <div>
            <SectionHeader title="Available" count={availableIntegrations.length} />
            <CardGrid columns={4}>
              {availableIntegrations.map(integration => {
                const hasOAuth = !!INTEGRATION_OAUTH_MAP[integration.slug];
                return (
                  <Card key={integration.id} className="hover:shadow-md transition-all hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={integration.logo_url}
                          alt={integration.name}
                          className="h-10 w-10 rounded-lg object-contain bg-muted p-1.5"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/elixa-logo.png"; }}
                        />
                        <div className="flex-1">
                          <CardTitle className="text-sm">{integration.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] mt-1">{integration.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-2 text-xs mb-3 min-h-[2.5rem]">
                        {integration.description || `Connect ${integration.name}`}
                      </CardDescription>
                      <Button
                        variant={hasOAuth ? "default" : "secondary"}
                        size="sm"
                        className="w-full"
                        onClick={() => hasOAuth && handleConnect(integration)}
                        disabled={!hasOAuth || connectingId === integration.id}
                      >
                        {connectingId === integration.id ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                        ) : hasOAuth ? (
                          <><ExternalLink className="h-4 w-4 mr-2" />Connect</>
                        ) : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </CardGrid>
          </div>

          {filtered.length === 0 && (
            <PageEmptyState
              icon={Plug}
              title="No integrations found"
              description="Try adjusting your search or filters."
            />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Connections;
