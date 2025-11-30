import { useState, useEffect } from "react";
import { Plug, CheckCircle2, Loader2, Search, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { OAUTH_CLIENT_IDS } from "@/config/oauth";
import { GOOGLE_BUNDLES, getBundleScopes } from "@/config/googleBundles";

interface ConnectionStatus {
  type: string;
  connected: boolean;
  lastConnected?: string;
  expiresAt?: string;
  isExpired?: boolean;
  bundleType?: string;
  accountEmail?: string;
  accountLabel?: string;
  id?: string;
}

const CREDENTIAL_INFO: Record<string, {
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  logo: string;
  companyName: string;
}> = {
  notionApi: {
    name: 'Notion Workspace',
    description: 'Connect your Notion workspace for document management and collaboration',
    category: 'Productivity',
    icon: '📝',
    color: 'bg-gray-800',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    companyName: 'Notion',
  },
  slackOAuth2Api: {
    name: 'Slack Workspace',
    description: 'Connect your Slack workspace for team communication and notifications',
    category: 'Communication',
    icon: '💬',
    color: 'bg-purple-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    companyName: 'Slack',
  },
  microsoftOAuth2Api: {
    name: 'Microsoft 365',
    description: 'Access Outlook, OneDrive, Teams, and other Microsoft services',
    category: 'Productivity',
    icon: '🪟',
    color: 'bg-blue-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    companyName: 'Microsoft',
  },
  calendlyApi: {
    name: 'Calendly',
    description: 'Schedule and manage meetings with Calendly integration',
    category: 'Scheduling',
    icon: '📅',
    color: 'bg-blue-500',
    logo: 'https://images.ctfassets.net/k0lk9kiuza3o/5UdSwOx0Q3FxtxlzmYEJLh/9c5fcd2c6e01a5af9d7fef7ad7e56d40/calendly-logo-square.png',
    companyName: 'Calendly',
  },
  mailchimpOAuth2Api: {
    name: 'Mailchimp',
    description: 'Connect Mailchimp for email marketing and campaign management',
    category: 'Marketing',
    icon: '🐵',
    color: 'bg-yellow-500',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Mailchimp_Logo.svg/320px-Mailchimp_Logo.svg.png',
    companyName: 'Mailchimp',
  },
  shopifyOAuth2Api: {
    name: 'Shopify Store',
    description: 'Connect your Shopify store for e-commerce automation',
    category: 'E-commerce',
    icon: '🛍️',
    color: 'bg-green-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
    companyName: 'Shopify',
  },
  metaBusinessApi: {
    name: 'Meta Business Suite',
    description: 'Connect Facebook and Instagram for social media management',
    category: 'Social Media',
    icon: '📱',
    color: 'bg-blue-500',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    companyName: 'Meta',
  },
  twilioApi: {
    name: 'Twilio',
    description: 'Connect Twilio for SMS, voice, and messaging automation',
    category: 'Communication',
    icon: '📞',
    color: 'bg-red-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo-red.svg',
    companyName: 'Twilio',
  },
  typeformOAuth2Api: {
    name: 'Typeform',
    description: 'Connect Typeform for form and survey automation',
    category: 'Forms',
    icon: '📋',
    color: 'bg-gray-900',
    logo: 'https://images.typeform.com/images/FN7WnMAzJRu3',
    companyName: 'Typeform',
  },
};

export default function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

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
        .select("id, credential_type, updated_at, expires_at, bundle_type, account_email, account_label")
        .eq("user_id", user.id);

      if (error) throw error;

      const statusList: ConnectionStatus[] = data?.map(cred => ({
        type: cred.credential_type,
        connected: true,
        lastConnected: cred.updated_at,
        expiresAt: cred.expires_at || undefined,
        isExpired: cred.expires_at ? new Date(cred.expires_at).getTime() < Date.now() : false,
        bundleType: cred.bundle_type || undefined,
        accountEmail: cred.account_email || undefined,
        accountLabel: cred.account_label || undefined,
        id: cred.id,
      })) || [];

      setConnections(statusList);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (credentialType: string, bundleType?: string) => {
    if (!user) return;

    const state = btoa(JSON.stringify({
      userId: user.id,
      credentialType,
      bundleType,
      scopes: bundleType ? getBundleScopes(bundleType).join(' ') : undefined,
      returnTo: "/connections",
    }));

    const redirectUri = `${window.location.origin}/oauth/callback`;
    let authUrl = "";

    switch (credentialType) {
      case "googleOAuth2Api":
        if (!bundleType) {
          toast.error("Please specify which Google bundle to connect");
          return;
        }
        const scopes = getBundleScopes(bundleType);
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CLIENT_IDS.GOOGLE}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent&state=${state}`;
        break;
      case "notionApi":
        authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.NOTION}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&owner=user&state=${state}`;
        break;
      case "slackOAuth2Api":
        authUrl = `https://slack.com/oauth/v2/authorize?client_id=${OAUTH_CLIENT_IDS.SLACK}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=channels:read,chat:write,users:read&state=${state}`;
        break;
      case "microsoftOAuth2Api":
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OAUTH_CLIENT_IDS.MICROSOFT}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('User.Read Mail.ReadWrite Calendars.ReadWrite Files.ReadWrite.All')}&state=${state}`;
        break;
      case "calendlyApi":
        authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.CALENDLY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        break;
      case "mailchimpOAuth2Api":
        authUrl = `https://login.mailchimp.com/oauth2/authorize?client_id=${OAUTH_CLIENT_IDS.MAILCHIMP}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        break;
      case "shopifyOAuth2Api":
        const shopDomain = prompt("Enter your Shopify store domain (e.g., mystore.myshopify.com):");
        if (!shopDomain) return;
        authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.SHOPIFY}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read_products,write_products,read_orders&state=${state}`;
        break;
      case "metaBusinessApi":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${OAUTH_CLIENT_IDS.META}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&state=${state}`;
        break;
      case "twilioApi":
        authUrl = `https://www.twilio.com/authorize?client_id=${OAUTH_CLIENT_IDS.TWILIO}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=account&state=${state}`;
        break;
      case "typeformOAuth2Api":
        authUrl = `https://api.typeform.com/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.TYPEFORM}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=forms:read,responses:read&state=${state}`;
        break;
    }

    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleDisconnect = async (credentialId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_credentials")
        .delete()
        .eq("id", credentialId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Connection removed");
      fetchConnections();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    }
  };

  const categories = ['all', ...new Set(Object.values(CREDENTIAL_INFO).map(info => info.category))];

  // Flatten all connections into one array
  const allConnectionItems = [
    // Google bundles as separate items
    ...Object.values(GOOGLE_BUNDLES).map(bundle => {
      const bundleCredentials = connections.filter(
        c => c.type === 'googleOAuth2Api' && c.bundleType === bundle.id
      );
      return {
        type: `google_${bundle.id}`,
        isGoogleBundle: true,
        bundle,
        credentials: bundleCredentials,
        info: {
          name: bundle.serviceName,
          description: bundle.description,
          category: 'Productivity',
          icon: bundle.icon,
          color: bundle.color,
          logo: bundle.logo,
          companyName: bundle.companyName,
        },
        connection: bundleCredentials.length > 0 ? bundleCredentials[0] : undefined,
      };
    }),
    // Other connections
    ...Object.entries(CREDENTIAL_INFO).map(([type, info]) => ({
      type,
      isGoogleBundle: false,
      info,
      connection: connections.find(c => c.type === type && !c.bundleType),
    })),
  ];

  // Filter logic
  const filteredConnections = allConnectionItems.filter((item) => {
    const matchesSearch = 
      item.info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.info.category === selectedCategory;
    
    const isConnected = item.isGoogleBundle 
      ? (item as any).credentials?.length > 0
      : !!item.connection;
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'connected' && isConnected) ||
      (selectedStatus === 'not-connected' && !isConnected);
    
    const matchesProvider = selectedProvider === 'all' ||
      (selectedProvider === 'google' && item.isGoogleBundle) ||
      (selectedProvider === 'third-party' && !item.isGoogleBundle);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesProvider;
  });

  const connectedCount = allConnectionItems.filter(item => 
    item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection
  ).length;
  const availableCount = allConnectionItems.length - connectedCount;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Checking your connections...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl overflow-y-auto h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Connections</h1>
            <p className="text-muted-foreground">
              Connect your tools and services to enable powerful automations
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="not-connected">Not Connected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== 'all').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="third-party">Third-Party</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Connected: <span className="font-semibold text-foreground">{connectedCount}</span></span>
              <span>•</span>
              <span>Available: <span className="font-semibold text-foreground">{availableCount}</span></span>
              <span>•</span>
              <span>Total: <span className="font-semibold text-foreground">{allConnectionItems.length}</span></span>
            </div>
          </div>
        </div>

        {/* Unified Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnections.map((item) => {
            const isConnected = item.isGoogleBundle 
              ? (item as any).credentials?.length > 0
              : !!item.connection;

            return (
              <Card key={item.type} className={`hover:shadow-lg transition-shadow ${isConnected ? 'ring-2 ring-green-500/20' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <img 
                          src={item.info.logo} 
                          alt={item.info.companyName}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-tight">{item.info.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">by {item.info.companyName}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <CardDescription className="text-sm">{item.info.description}</CardDescription>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">{item.info.category}</Badge>
                    {isConnected && (
                      <Badge variant="default" className="text-xs bg-green-500">Connected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {item.isGoogleBundle ? (
                    // Google bundle with multiple accounts
                    <>
                      {(item as any).credentials.length > 0 ? (
                        <>
                          <div className="space-y-2 mb-3">
                            {(item as any).credentials.map((cred: any) => (
                              <div key={cred.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs truncate">{cred.accountEmail}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDisconnect(cred.id!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnect('googleOAuth2Api', (item as any).bundle.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Account
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleConnect('googleOAuth2Api', (item as any).bundle.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </>
                  ) : (
                    // Regular connection
                    <>
                      {item.connection ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(item.connection!.id!)}
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(item.type)}
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredConnections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No connections found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
