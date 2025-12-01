import { useState, useEffect } from "react";
import { Plug, CheckCircle2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBanner } from "@/components/DemoBanner";
import { WaitlistDialog } from "@/components/WaitlistDialog";

interface ConnectionStatus {
  type: string;
  connected: boolean;
  lastConnected?: string;
  expiresAt?: string;
  isExpired?: boolean;
  bundleType?: string;
  accountEmail?: string;
  accountLabel?: string;
}

export default function Connections() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching integrations:', error);
        setLoading(false);
        return;
      }
      
      setIntegrations(data || []);
      setLoading(false);
    };

    fetchIntegrations();
  }, []);

  const connections: ConnectionStatus[] = [
    {
      type: "googleOAuth2Api",
      connected: true,
      lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bundleType: "email_workspace",
      accountEmail: "demo@example.com",
      accountLabel: "Work Account",
    },
    {
      type: "notionApi",
      connected: true,
      lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "demo@example.com",
      accountLabel: "Main Workspace",
    },
    {
      type: "slackOAuth2Api",
      connected: true,
      lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "demo@company.slack.com",
      accountLabel: "Company Workspace",
    },
  ];

  const handleConnect = () => {
    setWaitlistOpen(true);
  };

  const handleDisconnect = () => {
    setWaitlistOpen(true);
  };

  const categories = ['all', ...new Set(integrations.map(integration => integration.category))];

  const allConnectionItems = integrations.map(integration => {
    const isGoogleBundle = integration.is_google_bundle;
    const credentialType = isGoogleBundle 
      ? 'googleOAuth2Api' 
      : integration.credential_type;
    
    const matchingConnections = connections.filter(
      c => c.type === credentialType && 
           (!isGoogleBundle || c.bundleType === integration.bundle_type)
    );

    return {
      type: integration.credential_type,
      isGoogleBundle: integration.is_google_bundle,
      credentials: matchingConnections,
      info: {
        name: integration.name,
        description: integration.description,
        category: integration.category,
        icon: integration.icon,
        color: integration.color,
        logo: integration.logo_url,
        companyName: integration.company_name,
      },
      connection: matchingConnections.length > 0 ? matchingConnections[0] : undefined,
    };
  });

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
      <div className="flex-1 w-full overflow-y-auto">
        <DemoBanner />
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading connections...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto">
      <DemoBanner />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Connections</h1>
              <p className="text-muted-foreground">
                Connect your tools and services to enable powerful automations
              </p>
            </div>

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

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Connected: <span className="font-semibold text-foreground">{connectedCount}</span></span>
                <span>•</span>
                <span>Available: <span className="font-semibold text-foreground">{availableCount}</span></span>
                <span>•</span>
                <span>Total: <span className="font-semibold text-foreground">{allConnectionItems.length}</span></span>
              </div>
            </div>
          </div>

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
                    {isConnected ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-2">{item.connection?.accountEmail}</p>
                        <Button variant="outline" size="sm" className="w-full" onClick={handleDisconnect}>
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button variant="default" size="sm" className="w-full" onClick={handleConnect}>
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
