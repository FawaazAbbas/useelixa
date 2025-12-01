import { useState } from "react";
import { Plug, CheckCircle2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GOOGLE_BUNDLES } from "@/config/googleBundles";
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
  id?: string;
}

const CREDENTIAL_INFO: Record<
  string,
  {
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    logo: string;
    companyName: string;
  }
> = {
  notionApi: {
    name: "Notion Workspace",
    description: "Connect your Notion workspace for document management and collaboration",
    category: "Productivity",
    icon: "📝",
    color: "bg-gray-800",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/NotionLogo.png`,
    companyName: "Notion",
  },
  slackOAuth2Api: {
    name: "Slack Workspace",
    description: "Connect your Slack workspace for team communication and notifications",
    category: "Communication",
    icon: "💬",
    color: "bg-purple-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/SlackLogo.png`,
    companyName: "Slack",
  },
  microsoftOAuth2Api: {
    name: "Microsoft 365",
    description: "Access Outlook, OneDrive, Teams, and other Microsoft services",
    category: "Productivity",
    icon: "🪟",
    color: "bg-blue-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/MicrosoftLogo.webp`,
    companyName: "Microsoft",
  },
  calendlyApi: {
    name: "Calendly",
    description: "Schedule and manage meetings with Calendly integration",
    category: "Scheduling",
    icon: "📅",
    color: "bg-blue-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/CalendlyLogo.png`,
    companyName: "Calendly",
  },
  mailchimpOAuth2Api: {
    name: "Mailchimp",
    description: "Connect Mailchimp for email marketing and campaign management",
    category: "Marketing",
    icon: "🐵",
    color: "bg-yellow-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/mailchimp.png`,
    companyName: "Mailchimp",
  },
  shopifyOAuth2Api: {
    name: "Shopify Store",
    description: "Connect your Shopify store for e-commerce automation",
    category: "E-commerce",
    icon: "🛍️",
    color: "bg-green-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/ShopifyLogo.png`,
    companyName: "Shopify",
  },
  metaBusinessApi: {
    name: "Meta Business Suite",
    description: "Connect Facebook and Instagram for social media management",
    category: "Social Media",
    icon: "📱",
    color: "bg-blue-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/MetaLogo.png`,
    companyName: "Meta",
  },
  twilioApi: {
    name: "Twilio",
    description: "Connect Twilio for SMS, voice, and messaging automation",
    category: "Communication",
    icon: "📞",
    color: "bg-red-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/TwilioLogo.png`,
    companyName: "Twilio",
  },
  typeformOAuth2Api: {
    name: "Typeform",
    description: "Connect Typeform for form and survey automation",
    category: "Forms",
    icon: "📋",
    color: "bg-gray-900",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/TypeFormLogo.png`,
    companyName: "Typeform",
  },
};

export default function Connections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const connections: ConnectionStatus[] = [
    {
      type: "googleOAuth2Api",
      connected: true,
      lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bundleType: "email_workspace",
      accountEmail: "demo@example.com",
      accountLabel: "Work Account",
      id: "conn-1",
    },
    {
      type: "notionApi",
      connected: true,
      lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "demo@example.com",
      accountLabel: "Main Workspace",
      id: "conn-2",
    },
    {
      type: "slackOAuth2Api",
      connected: true,
      lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "demo@company.slack.com",
      accountLabel: "Company Workspace",
      id: "conn-3",
    },
  ];

  const handleConnect = () => {
    setWaitlistOpen(true);
  };

  const handleDisconnect = () => {
    toast.error("Disconnect feature disabled in demo mode");
  };

  const categories = ["all", ...new Set(Object.values(CREDENTIAL_INFO).map((info) => info.category))];

  const allConnectionItems = [
    ...Object.values(GOOGLE_BUNDLES).map((bundle) => {
      const bundleCredentials = connections.filter((c) => c.type === "googleOAuth2Api" && c.bundleType === bundle.id);
      return {
        type: `google_${bundle.id}`,
        isGoogleBundle: true,
        bundle,
        credentials: bundleCredentials,
        info: {
          name: bundle.serviceName,
          description: bundle.description,
          category: "Productivity",
          icon: bundle.icon,
          color: bundle.color,
          logo: bundle.logo,
          companyName: bundle.companyName,
        },
        connection: bundleCredentials.length > 0 ? bundleCredentials[0] : undefined,
      };
    }),
    ...Object.entries(CREDENTIAL_INFO).map(([type, info]) => ({
      type,
      isGoogleBundle: false,
      info,
      connection: connections.find((c) => c.type === type && !c.bundleType),
    })),
  ];

  const filteredConnections = allConnectionItems.filter((item) => {
    const matchesSearch =
      item.info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || item.info.category === selectedCategory;

    const isConnected = item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "connected" && isConnected) ||
      (selectedStatus === "not-connected" && !isConnected);

    const matchesProvider =
      selectedProvider === "all" ||
      (selectedProvider === "google" && item.isGoogleBundle) ||
      (selectedProvider === "third-party" && !item.isGoogleBundle);

    return matchesSearch && matchesCategory && matchesStatus && matchesProvider;
  });

  const connectedCount = allConnectionItems.filter((item) =>
    item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection,
  ).length;
  const availableCount = allConnectionItems.length - connectedCount;

  return (
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      <div className="py-6 px-4 md:py-8 pb-20 md:pb-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">Connections</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {connectedCount} connected • {availableCount} available
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Connect your tools and services to enable powerful automations</p>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search connections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
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
                      {categories
                        .filter((c) => c !== "all")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((item) => {
              const isConnected = item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection;

              return (
                <Card
                  key={item.type}
                  className={`hover:shadow-xl hover:scale-[1.02] transition-all duration-200 animate-fade-in ${isConnected ? "ring-2 ring-green-500/20" : ""}`}
                  style={{ animationDelay: `${filteredConnections.indexOf(item) * 30}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 p-1">
                          <img
                            src={item.info.logo}
                            alt={item.info.companyName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base leading-tight">{item.info.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">by {item.info.companyName}</p>
                        </div>
                      </div>
                      {isConnected && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    </div>
                    <CardDescription className="text-sm">{item.info.description}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {item.info.category}
                      </Badge>
                      {isConnected && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          Connected
                        </Badge>
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
