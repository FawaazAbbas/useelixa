import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plug, Search, CheckCircle2, Loader2, ExternalLink, Plus, User, Lock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout, PageEmptyState, SectionHeader, CardGrid } from "@/components/PageLayout";
import { getOAuthUrl } from "@/config/oauth";
import { toast } from "sonner";
import { ShopifyConnectDialog } from "@/components/connections/ShopifyConnectDialog";
import { logAdminAction } from "@/utils/auditLog";

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
  bundle_type: string | null;
  account_email: string | null;
  scopes: string[] | null;
  connected_at: string;
}

interface OrgLimits {
  connector_limit: number | null;
  plan: string;
}

// OAuth mapping - including Google services (each Google service is independent)
const INTEGRATION_OAUTH_MAP: Record<string, { provider: string; credentialType: string; bundleType?: string }> = {
  // Google services - each has its own unique bundle type for independent connections
  "gmail": { provider: "google", credentialType: "googleOAuth2Api", bundleType: "gmail" },
  "google-calendar": { provider: "google", credentialType: "googleOAuth2Api", bundleType: "google_calendar" },
  "google-ads": { provider: "google", credentialType: "googleOAuth2Api", bundleType: "google_ads" },
  "google-analytics": { provider: "google", credentialType: "googleOAuth2Api", bundleType: "google_analytics" },
  "google-sheets": { provider: "google", credentialType: "googleOAuth2Api", bundleType: "google_sheets" },
  // Other providers
  "notion": { provider: "notion", credentialType: "notionApi" },
  "slack": { provider: "slack", credentialType: "slackOAuth2Api" },
  "microsoft-teams": { provider: "microsoft", credentialType: "microsoftOAuth2Api", bundleType: "teams" },
  "outlook": { provider: "microsoft", credentialType: "microsoftOAuth2Api", bundleType: "outlook" },
  "onedrive": { provider: "microsoft", credentialType: "microsoftOAuth2Api", bundleType: "onedrive" },
  "calendly": { provider: "calendly", credentialType: "calendlyApi" },
  "mailchimp": { provider: "mailchimp", credentialType: "mailchimpOAuth2Api" },
  "shopify": { provider: "shopify", credentialType: "shopifyApi" },
};

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [credentials, setCredentials] = useState<UserCredential[]>([]);
  const [orgLimits, setOrgLimits] = useState<OrgLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false);

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
      // Fetch credentials
      const { data: credentialsData } = await supabase
        .from("user_credentials")
        .select("id, credential_type, bundle_type, account_email, scopes, created_at")
        .eq("user_id", user.id);

      if (credentialsData) {
        setCredentials(credentialsData.map(c => ({
          ...c,
          bundle_type: c.bundle_type || null,
          scopes: c.scopes || null,
          connected_at: c.created_at
        })));
      }

      // Fetch org limits for connector restrictions
      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (membership?.org_id) {
        const { data: org } = await supabase
          .from("orgs")
          .select("connector_limit, plan")
          .eq("id", membership.org_id)
          .single();

        if (org) {
          setOrgLimits(org as OrgLimits);
        }
      }
    }
    setLoading(false);
  };

  // Get ALL credentials for an integration (supports multiple accounts)
  const getCredentialsForIntegration = (integration: Integration): UserCredential[] => {
    const mapping = INTEGRATION_OAUTH_MAP[integration.slug];
    if (!mapping) return [];
    
    return credentials.filter(c => {
      if (c.credential_type !== mapping.credentialType) return false;
      if (mapping.bundleType) {
        return c.bundle_type === mapping.bundleType;
      }
      return true;
    });
  };

  // Check if integration has at least one connected account
  const isIntegrationConnected = (integration: Integration): boolean => {
    return getCredentialsForIntegration(integration).length > 0;
  };

  // Connector limit - will be calculated after connectedIntegrations is defined
  const connectorLimit = orgLimits?.connector_limit;

  const handleConnect = async (integration: Integration, connectedCount: number) => {
    if (!user) {
      toast.error("Please sign in to connect integrations");
      navigate("/auth");
      return;
    }

    // Check connector limit before connecting
    const limitReached = connectorLimit !== null && connectedCount >= connectorLimit;
    if (limitReached) {
      toast.error("Connector limit reached", {
        description: "Upgrade your plan to connect more integrations.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/billing"),
        },
      });
      return;
    }

    const mapping = INTEGRATION_OAUTH_MAP[integration.slug];
    if (!mapping) {
      toast.error(`OAuth not configured for ${integration.name}`);
      return;
    }

    // Special handling for Shopify - show domain input dialog
    if (mapping.provider === "shopify") {
      setShopifyDialogOpen(true);
      return;
    }

    setConnectingId(integration.id);

    // Use the bundle type from the mapping if available
    const bundleType = mapping.bundleType;

    const oauthUrl = await getOAuthUrl(mapping.provider, bundleType);
    
    if (!oauthUrl) {
      toast.error(`OAuth URL not available for ${integration.name}`);
      setConnectingId(null);
      return;
    }

    window.location.href = oauthUrl;
  };

  const handleDisconnect = async (credential: UserCredential, integrationName: string) => {
    setDisconnectingId(credential.id);

    try {
      const { error } = await supabase
        .from("user_credentials")
        .delete()
        .eq("id", credential.id);

      if (error) throw error;

      const accountLabel = credential.account_email || integrationName;
      
      // Log admin action for disconnect
      await logAdminAction({
        actionType: "integration_disconnect",
        entityType: "user_credentials",
        entityId: credential.id,
        oldValue: { 
          integration: integrationName, 
          account_email: credential.account_email,
          credential_type: credential.credential_type,
        },
      });

      toast.success(`Disconnected ${accountLabel}`);
      setCredentials(prev => prev.filter(c => c.id !== credential.id));
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error(`Failed to disconnect account`);
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

  const connectedIntegrations = filtered.filter(i => isIntegrationConnected(i));
  const availableIntegrations = filtered.filter(i => !isIntegrationConnected(i));

  // Check if connector limit is reached (after connectedIntegrations is calculated)
  const isLimitReached = connectorLimit !== null && connectedIntegrations.length >= connectorLimit;
  const canAddConnector = connectorLimit === null || connectedIntegrations.length < connectorLimit;

  return (
    <PageLayout
      title="Connections"
      icon={Plug}
      badge={connectorLimit !== null && connectorLimit !== undefined
        ? `${connectedIntegrations.length}/${connectorLimit} connected`
        : connectedIntegrations.length > 0 
          ? `${connectedIntegrations.length} connected` 
          : undefined
      }
      fullWidth
    >
      {/* Connector limit warning */}
      {isLimitReached && (
        <Alert variant="default" className="mb-6 border-amber-500/50 bg-amber-500/10">
          <Lock className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You've reached your connector limit ({connectorLimit}). Upgrade to connect more integrations.
            </span>
            <Button size="sm" onClick={() => navigate("/billing")} className="ml-4">
              Upgrade Plan
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                  const integrationCredentials = getCredentialsForIntegration(integration);
                  const accountCount = integrationCredentials.length;
                  
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">{integration.category}</Badge>
                              {accountCount > 1 && (
                                <Badge variant="outline" className="text-[10px]">
                                  <User className="h-3 w-3 mr-1" />
                                  {accountCount} accounts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {/* List all connected accounts */}
                        <div className="space-y-2">
                          {integrationCredentials.map((credential) => (
                            <div 
                              key={credential.id} 
                              className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border border-border/50"
                            >
                              <p className="text-xs text-muted-foreground truncate flex-1">
                                {credential.account_email || "Connected account"}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDisconnect(credential, integration.name)}
                                disabled={disconnectingId === credential.id}
                              >
                                {disconnectingId === credential.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : "Remove"}
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add another account button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleConnect(integration, connectedIntegrations.length)}
                          disabled={connectingId === integration.id}
                        >
                          {connectingId === integration.id ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                          ) : (
                            <><Plus className="h-4 w-4 mr-2" />Add another account</>
                          )}
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
                    variant={hasOAuth && canAddConnector ? "default" : "secondary"}
                    size="sm"
                    className="w-full"
                    onClick={() => hasOAuth && handleConnect(integration, connectedIntegrations.length)}
                    disabled={!hasOAuth || connectingId === integration.id || !canAddConnector}
                  >
                    {connectingId === integration.id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                    ) : !hasOAuth ? (
                      "Coming Soon"
                    ) : !canAddConnector ? (
                      <><Lock className="h-4 w-4 mr-2" />Limit Reached</>
                    ) : (
                      <><ExternalLink className="h-4 w-4 mr-2" />Connect</>
                    )}
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

          {/* Shopify Connect Dialog */}
          <ShopifyConnectDialog 
            open={shopifyDialogOpen} 
            onOpenChange={setShopifyDialogOpen} 
          />
        </>
      )}
    </PageLayout>
  );
};

export default Connections;
