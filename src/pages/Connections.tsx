import { useState, useEffect } from "react";
import { Plug, CheckCircle2, XCircle, Loader2, Search, Star, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConnectionStatus {
  type: string;
  connected: boolean;
  lastConnected?: string;
}

const CREDENTIAL_INFO = {
  googleOAuth2Api: { 
    name: "Google Workspace",
    shortName: "Google",
    description: "Gmail, Calendar, Drive, Sheets, Docs, Forms, Tasks",
    category: "Productivity",
    icon: "🔗",
    color: "bg-blue-500",
    popular: true
  },
  notionApi: { 
    name: "Notion",
    shortName: "Notion",
    description: "Manage pages, databases, and team wikis",
    category: "Productivity",
    icon: "📝",
    color: "bg-gray-800",
    popular: true
  },
  slackApi: { 
    name: "Slack",
    shortName: "Slack",
    description: "Team messaging and channel management",
    category: "Communication",
    icon: "💬",
    color: "bg-purple-600",
    popular: true
  },
  quickbooksApi: {
    name: "QuickBooks Online",
    shortName: "QuickBooks",
    description: "Accounting, invoicing, expenses, and financial reports",
    category: "Finance",
    icon: "💰",
    color: "bg-green-600",
    popular: true
  },
  microsoftOAuth2Api: {
    name: "Microsoft 365",
    shortName: "Microsoft",
    description: "Outlook, OneDrive, Teams, Excel, Word",
    category: "Productivity",
    icon: "📊",
    color: "bg-blue-600",
    popular: true
  },
  calendlyApi: {
    name: "Calendly",
    shortName: "Calendly",
    description: "Meeting scheduling and appointment booking",
    category: "Scheduling",
    icon: "📅",
    color: "bg-blue-400",
    popular: true
  },
  hubspotOAuth2Api: {
    name: "HubSpot CRM",
    shortName: "HubSpot",
    description: "Contact management, deals pipeline, and marketing automation",
    category: "CRM",
    icon: "🎯",
    color: "bg-orange-500",
    popular: true
  },
  mailchimpOAuth2Api: {
    name: "Mailchimp",
    shortName: "Mailchimp",
    description: "Email marketing, newsletters, and campaign management",
    category: "Marketing",
    icon: "📧",
    color: "bg-yellow-500",
    popular: true
  },
  facebookOAuth2Api: {
    name: "Meta Business Suite",
    shortName: "Meta",
    description: "Facebook Pages, Instagram Business, and ad management",
    category: "Marketing",
    icon: "📱",
    color: "bg-blue-700",
    popular: false
  },
  stripeApi: {
    name: "Stripe",
    shortName: "Stripe",
    description: "Payment processing, subscriptions, and invoicing",
    category: "Payments",
    icon: "💳",
    color: "bg-indigo-600",
    popular: true
  },
  twilioApi: {
    name: "Twilio",
    shortName: "Twilio",
    description: "SMS messaging, phone calls, and WhatsApp integration",
    category: "Communication",
    icon: "📞",
    color: "bg-red-600",
    popular: false
  },
  typeformApi: {
    name: "Typeform",
    shortName: "Typeform",
    description: "Forms, surveys, and customer feedback collection",
    category: "Forms",
    icon: "📋",
    color: "bg-pink-500",
    popular: false
  },
  shopifyApi: {
    name: "Shopify",
    shortName: "Shopify",
    description: "E-commerce store management and product catalog",
    category: "E-commerce",
    icon: "🛒",
    color: "bg-green-700",
    popular: true
  },
};

export default function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
      case "quickbooksApi":
        authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${import.meta.env.VITE_QUICKBOOKS_CLIENT_ID || 'YOUR_QUICKBOOKS_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=com.intuit.quickbooks.accounting&state=${state}`;
        break;
      case "microsoftOAuth2Api":
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('User.Read Mail.ReadWrite Calendars.ReadWrite Files.ReadWrite.All')}&state=${state}`;
        break;
      case "calendlyApi":
        authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${import.meta.env.VITE_CALENDLY_CLIENT_ID || 'YOUR_CALENDLY_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        break;
      case "hubspotOAuth2Api":
        authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${import.meta.env.VITE_HUBSPOT_CLIENT_ID || 'YOUR_HUBSPOT_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=contacts%20crm.objects.contacts.read&state=${state}`;
        break;
      case "mailchimpOAuth2Api":
        authUrl = `https://login.mailchimp.com/oauth2/authorize?client_id=${import.meta.env.VITE_MAILCHIMP_CLIENT_ID || 'YOUR_MAILCHIMP_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        break;
      case "facebookOAuth2Api":
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID || 'YOUR_FACEBOOK_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_show_list,pages_read_engagement,instagram_basic&state=${state}`;
        break;
      case "stripeApi":
        authUrl = `https://connect.stripe.com/oauth/authorize?client_id=${import.meta.env.VITE_STRIPE_CLIENT_ID || 'YOUR_STRIPE_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read_write&state=${state}`;
        break;
      case "twilioApi":
        authUrl = `https://www.twilio.com/authorize?client_id=${import.meta.env.VITE_TWILIO_CLIENT_ID || 'YOUR_TWILIO_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=messaging%20calls&state=${state}`;
        break;
      case "typeformApi":
        authUrl = `https://api.typeform.com/oauth/authorize?client_id=${import.meta.env.VITE_TYPEFORM_CLIENT_ID || 'YOUR_TYPEFORM_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=accounts:read%20forms:read%20responses:read&state=${state}`;
        break;
      case "shopifyApi":
        const shopDomain = prompt("Enter your Shopify store domain (e.g., mystore.myshopify.com):");
        if (!shopDomain) {
          setConnecting(null);
          return;
        }
        authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${import.meta.env.VITE_SHOPIFY_CLIENT_ID || 'YOUR_SHOPIFY_CLIENT_ID'}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read_products,write_products,read_orders&state=${state}`;
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

  const categories = ["Productivity", "Communication", "Finance", "CRM", "Marketing", "Payments", "E-commerce", "Scheduling", "Forms"];

  const filteredConnections = connections.filter((connection) => {
    const info = CREDENTIAL_INFO[connection.type as keyof typeof CREDENTIAL_INFO];
    
    const matchesSearch = 
      info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      info.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularConnections = filteredConnections.filter(c => 
    CREDENTIAL_INFO[c.type as keyof typeof CREDENTIAL_INFO].popular
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your connections...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Plug className="h-10 w-10" />
              Plugin Connections
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect once, use across all agents. {connections.filter(c => c.connected).length} of {connections.length} connected
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="hidden md:flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {connections.filter(c => c.connected).length}
              </div>
              <div className="text-xs text-muted-foreground">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {connections.filter(c => !c.connected).length}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Popular Connections Section */}
      {selectedCategory === "all" && searchQuery === "" && popularConnections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular Connections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularConnections.map((connection) => {
              const info = CREDENTIAL_INFO[connection.type as keyof typeof CREDENTIAL_INFO];
              return (
                <Card 
                  key={connection.type}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    connection.connected && "ring-2 ring-green-500/20"
                  )}
                >
                  <div className={cn("absolute top-0 left-0 right-0 h-2", info.color)} />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{info.icon}</div>
                      {connection.connected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <CardTitle className="text-lg">{info.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {info.category}
                    </Badge>
                    
                    <CardDescription className="text-xs mt-2 line-clamp-2">
                      {info.description}
                    </CardDescription>
                    
                    {connection.connected && connection.lastConnected && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected {new Date(connection.lastConnected).toLocaleDateString()}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {connection.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect(connection.type)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(connection.type)}
                        disabled={connecting === connection.type}
                      >
                        {connecting === connection.type ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Connections Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          All Available Connections ({filteredConnections.length})
        </h2>
        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((connection) => {
              const info = CREDENTIAL_INFO[connection.type as keyof typeof CREDENTIAL_INFO];
              return (
                <Card 
                  key={connection.type}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    connection.connected && "ring-2 ring-green-500/20"
                  )}
                >
                  <div className={cn("absolute top-0 left-0 right-0 h-2", info.color)} />
                  
                  {info.popular && (
                    <Badge variant="outline" className="absolute top-4 right-4 text-xs">
                      <Star className="h-3 w-3 mr-1" /> Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{info.icon}</div>
                      {connection.connected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <CardTitle className="text-lg">{info.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {info.category}
                    </Badge>
                    
                    <CardDescription className="text-xs mt-2 line-clamp-2">
                      {info.description}
                    </CardDescription>
                    
                    {connection.connected && connection.lastConnected && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected {new Date(connection.lastConnected).toLocaleDateString()}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {connection.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect(connection.type)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(connection.type)}
                        disabled={connecting === connection.type}
                      >
                        {connecting === connection.type ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No connections found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
