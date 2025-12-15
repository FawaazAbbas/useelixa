import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Download,
  Loader2,
  Sparkles,
  Calendar,
  Bot,
  Users,
  Zap,
  MessageSquare,
  Plug,
  Shield,
  CheckCircle2,
  Clock,
  Brain,
  Target,
  Workflow,
  Globe,
  Mail,
  FileText,
  Database,
  BarChart3,
  Settings2,
  Lock,
  Unlock,
  Megaphone,
  Headphones,
  DollarSign,
  Package,
  Code,
  Palette,
  Scale,
  Smartphone,
  ClipboardList,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AgentOAuthSetup } from "@/components/AgentOAuthSetup";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { StarBreakdown } from "@/components/StarBreakdown";
import { ReviewCard } from "@/components/ReviewCard";
import { RelatedAgents } from "@/components/RelatedAgents";
import { TalentPoolNavbar, TalentPoolBreadcrumb } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { DeveloperDialog } from "@/components/DeveloperDialog";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { mockAgents } from "@/data/mockAgents";
import { getReviewsByAgent, getRatingDistribution } from "@/data/mockReviews";

// Category visual config matching AgentCard
const categoryConfig: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    accent: string;
    badgeBg: string;
    icon: React.ReactNode;
  }
> = {
  "Marketing & Growth": {
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    iconText: "text-white",
    accent: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    icon: <Megaphone className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "Customer Support": {
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    iconText: "text-white",
    accent: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: <Headphones className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Sales: {
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    iconText: "text-white",
    accent: "from-orange-500 to-amber-600",
    badgeBg: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: <Target className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Finance: {
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    iconText: "text-white",
    accent: "from-green-500 to-emerald-600",
    badgeBg: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: <DollarSign className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Operations: {
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    iconText: "text-white",
    accent: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <Package className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "HR & People": {
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconText: "text-white",
    accent: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    icon: <Users className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Development: {
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    iconText: "text-white",
    accent: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: <Code className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "Design & Creative": {
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    iconText: "text-white",
    accent: "from-pink-500 to-rose-600",
    badgeBg: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    icon: <Palette className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "Analytics & Data": {
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    iconText: "text-white",
    accent: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <BarChart3 className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "Legal & Compliance": {
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    iconText: "text-white",
    accent: "from-slate-500 to-gray-600",
    badgeBg: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    icon: <Scale className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Product: {
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    iconText: "text-white",
    accent: "from-violet-500 to-purple-600",
    badgeBg: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    icon: <Smartphone className="h-8 w-8 md:h-10 md:w-10" />,
  },
  "Project Management": {
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    iconText: "text-white",
    accent: "from-indigo-500 to-blue-600",
    badgeBg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: <ClipboardList className="h-8 w-8 md:h-10 md:w-10" />,
  },
  Ecommerce: {
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    iconText: "text-white",
    accent: "from-teal-500 to-cyan-600",
    badgeBg: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    icon: <ShoppingCart className="h-8 w-8 md:h-10 md:w-10" />,
  },
};

const defaultCategoryConfig = {
  iconBg: "bg-gradient-to-br from-primary to-primary/80",
  iconText: "text-primary-foreground",
  accent: "from-primary to-primary/80",
  badgeBg: "bg-primary/10 text-primary border-primary/20",
  icon: <Bot className="h-8 w-8 md:h-10 md:w-10" />,
};

// Plugin display mapping - converts API credential types to user-friendly names
const pluginDisplayMap: Record<string, { name: string; logo: string; color: string }> = {
  // Google Services
  googleAdsOAuth2Api: {
    name: "Google Ads",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-blue-500/20 to-green-500/20",
  },
  googleAnalyticsOAuth2Api: {
    name: "Google Analytics",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-orange-500/20 to-yellow-500/20",
  },
  googleCalendarOAuth2Api: {
    name: "Google Calendar",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-blue-500/20 to-blue-600/20",
  },
  googleDocsOAuth2Api: {
    name: "Google Docs",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  googleDriveOAuth2Api: {
    name: "Google Drive",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-green-500/20 to-blue-500/20",
  },
  googleSheetsOAuth2Api: {
    name: "Google Sheets",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-green-500/20 to-emerald-500/20",
  },
  googleSearchConsoleOAuth2Api: {
    name: "Search Console",
    logo: "/logos/GoogleDriveLogo.png",
    color: "from-red-500/20 to-orange-500/20",
  },
  bigQueryOAuth2Api: { name: "BigQuery", logo: "/logos/BigQueryLogo.png", color: "from-blue-600/20 to-indigo-600/20" },
  youtubeOAuth2Api: { name: "YouTube", logo: "/logos/YouTubeLogo.svg", color: "from-red-500/20 to-red-600/20" },

  // Marketing & Ads
  metaAdsOAuth2Api: { name: "Meta Ads", logo: "/logos/MetaLogo.svg", color: "from-blue-600/20 to-indigo-600/20" },
  tiktokAdsApi: { name: "TikTok Ads", logo: "/logos/TikTokLogo.png", color: "from-pink-500/20 to-purple-500/20" },
  klaviyoApi: { name: "Klaviyo", logo: "/logos/KlaviyoLogo.png", color: "from-green-500/20 to-emerald-500/20" },
  mailchimpOAuth2Api: {
    name: "Mailchimp",
    logo: "/logos/MailchimpLogo.svg",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  omnisendApi: { name: "Omnisend", logo: "/logos/OmnisendLogo.png", color: "from-purple-500/20 to-violet-500/20" },
  linkedInOAuth2Api: { name: "LinkedIn", logo: "/logos/LinkedInLogo.svg", color: "from-blue-700/20 to-blue-800/20" },
  bufferApi: { name: "Buffer", logo: "/logos/BufferLogo.svg", color: "from-slate-500/20 to-gray-500/20" },
  semrushApi: { name: "SEMrush", logo: "/logos/SEMrushLogo.svg", color: "from-orange-500/20 to-red-500/20" },
  ahrefsApi: { name: "Ahrefs", logo: "/elixa-logo.png", color: "from-blue-500/20 to-indigo-500/20" },
  lookerApi: { name: "Looker", logo: "/logos/LookerLogo.svg", color: "from-blue-500/20 to-indigo-500/20" },
  grammarly: { name: "Grammarly", logo: "/logos/GrammarlyLogo.svg", color: "from-green-500/20 to-emerald-500/20" },

  // Finance & Payments
  xeroOAuth2Api: { name: "Xero", logo: "/logos/XeroLogo.png", color: "from-cyan-500/20 to-blue-500/20" },
  quickBooksOAuth2Api: {
    name: "QuickBooks",
    logo: "/logos/QuickBooksLogo.png",
    color: "from-green-600/20 to-emerald-600/20",
  },
  stripeApi: { name: "Stripe", logo: "/logos/StripeLogo.png", color: "from-purple-500/20 to-indigo-500/20" },
  paypalApi: { name: "PayPal", logo: "/logos/PayPalLogo.png", color: "from-blue-600/20 to-sky-600/20" },
  plaidApi: { name: "Plaid", logo: "/logos/PlaidLogo.png", color: "from-slate-600/20 to-gray-600/20" },
  klarnaApi: { name: "Klarna", logo: "/logos/KlarnaLogo.png", color: "from-pink-500/20 to-rose-500/20" },
  truelayerApi: { name: "TrueLayer", logo: "/logos/TrueLayerLogo.png", color: "from-blue-500/20 to-indigo-500/20" },

  // Communication
  slackOAuth2Api: { name: "Slack", logo: "/logos/SlackLogo.svg", color: "from-purple-500/20 to-pink-500/20" },
  gmailOAuth2Api: { name: "Gmail", logo: "/logos/GoogleDriveLogo.png", color: "from-red-500/20 to-orange-500/20" },
  teamsApi: { name: "Microsoft Teams", logo: "/logos/TeamsLogo.svg", color: "from-purple-500/20 to-indigo-500/20" },
  whatsappApi: { name: "WhatsApp", logo: "/logos/WhatsAppLogo.png", color: "from-green-500/20 to-emerald-500/20" },
  aircallApi: { name: "Aircall", logo: "/logos/AircallLogo.png", color: "from-green-500/20 to-teal-500/20" },

  // Productivity
  notionOAuth2Api: { name: "Notion", logo: "/logos/NotionLogo.svg", color: "from-slate-500/20 to-gray-500/20" },
  asanaOAuth2Api: { name: "Asana", logo: "/logos/AsanaLogo.png", color: "from-pink-500/20 to-rose-500/20" },
  clickupApi: { name: "ClickUp", logo: "/logos/ClickUpLogo.png", color: "from-purple-500/20 to-violet-500/20" },
  linearApi: { name: "Linear", logo: "/logos/LinearLogo.png", color: "from-indigo-500/20 to-purple-500/20" },

  // Development
  githubOAuth2Api: { name: "GitHub", logo: "/logos/GitHubLogo.png", color: "from-slate-700/20 to-gray-700/20" },
  gitlabOAuth2Api: { name: "GitLab", logo: "/logos/GitLabLogo.png", color: "from-orange-500/20 to-red-500/20" },
  bitbucketApi: { name: "Bitbucket", logo: "/logos/BitbucketLogo.png", color: "from-blue-500/20 to-indigo-500/20" },
  jiraOAuth2Api: { name: "Jira", logo: "/logos/JiraLogo.svg", color: "from-blue-600/20 to-indigo-600/20" },
  vercelApi: { name: "Vercel", logo: "/logos/VercelLogo.png", color: "from-slate-600/20 to-gray-600/20" },
  netlifyApi: { name: "Netlify", logo: "/logos/NetlifyLogo.png", color: "from-teal-500/20 to-cyan-500/20" },
  renderApi: { name: "Render", logo: "/logos/RenderLogo.png", color: "from-purple-500/20 to-violet-500/20" },
  sentryApi: { name: "Sentry", logo: "/logos/SentryLogo.png", color: "from-purple-500/20 to-pink-500/20" },
  datadogApi: { name: "Datadog", logo: "/logos/DatadogLogo.png", color: "from-purple-500/20 to-violet-500/20" },
  newrelicApi: { name: "New Relic", logo: "/logos/NewRelicLogo.png", color: "from-green-500/20 to-teal-500/20" },
  logrocketApi: { name: "LogRocket", logo: "/logos/LogRocketLogo.png", color: "from-purple-500/20 to-indigo-500/20" },
  awsApi: { name: "AWS", logo: "/logos/AWSLogo.png", color: "from-orange-500/20 to-amber-500/20" },
  gcpApi: { name: "Google Cloud", logo: "/logos/GCPLogo.png", color: "from-blue-500/20 to-red-500/20" },
  supabaseApi: { name: "Supabase", logo: "/logos/SupabaseLogo.png", color: "from-green-500/20 to-emerald-500/20" },

  // Design
  figmaApi: { name: "Figma", logo: "/logos/FigmaLogo.png", color: "from-purple-500/20 to-pink-500/20" },
  dropboxOAuth2Api: { name: "Dropbox", logo: "/logos/DropboxLogo.png", color: "from-blue-500/20 to-sky-500/20" },
  adobeSignApi: { name: "Adobe Sign", logo: "/logos/AdobeSignLogo.png", color: "from-red-500/20 to-orange-500/20" },

  // Customer Support
  gorgiasApi: { name: "Gorgias", logo: "/logos/GorgiasLogo.png", color: "from-blue-500/20 to-indigo-500/20" },
  zendeskApi: { name: "Zendesk", logo: "/logos/ZendeskLogo.png", color: "from-green-600/20 to-teal-600/20" },
  freshdeskApi: { name: "Freshdesk", logo: "/logos/FreshdeskLogo.png", color: "from-green-500/20 to-emerald-500/20" },

  // Ecommerce
  shopifyApi: { name: "Shopify", logo: "/logos/ShopifyLogo.svg", color: "from-green-500/20 to-lime-500/20" },
  triplewhaleApi: {
    name: "Triple Whale",
    logo: "/logos/TripleWhaleLogo.png",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  northbeamApi: { name: "Northbeam", logo: "/logos/NorthbeamLogo.png", color: "from-indigo-500/20 to-purple-500/20" },
  yotpoApi: { name: "Yotpo", logo: "/logos/YotpoLogo.png", color: "from-blue-500/20 to-indigo-500/20" },
  judgemeApi: { name: "Judge.me", logo: "/logos/JudgeMeLogo.png", color: "from-green-500/20 to-emerald-500/20" },
  grinApi: { name: "Grin", logo: "/logos/GrinLogo.png", color: "from-pink-500/20 to-rose-500/20" },
  trustpilotApi: {
    name: "Trustpilot",
    logo: "/logos/TrustpilotLogo.png",
    color: "from-green-500/20 to-emerald-500/20",
  },

  // Legal
  docusignApi: { name: "DocuSign", logo: "/logos/DocuSignLogo.png", color: "from-blue-600/20 to-indigo-600/20" },

  // CRM
  hubspotOAuth2Api: { name: "HubSpot", logo: "/logos/HubSpotLogo.svg", color: "from-orange-500/20 to-red-500/20" },
  salesforceOAuth2Api: {
    name: "Salesforce",
    logo: "/logos/SalesforceLogo.svg",
    color: "from-blue-500/20 to-sky-500/20",
  },

  // Compliance/Privacy
  cookiebotApi: { name: "Cookiebot", logo: "/logos/CookiebotLogo.png", color: "from-green-500/20 to-teal-500/20" },
  onetrustApi: { name: "OneTrust", logo: "/logos/OneTrustLogo.png", color: "from-teal-500/20 to-cyan-500/20" },
  vwoApi: { name: "VWO", logo: "/logos/VWOLogo.png", color: "from-blue-500/20 to-indigo-500/20" },
  convertApi: { name: "Convert", logo: "/logos/ConvertLogo.png", color: "from-orange-500/20 to-amber-500/20" },

  // Affiliate
  awinApi: { name: "Awin", logo: "/logos/AwinLogo.png", color: "from-blue-500/20 to-indigo-500/20" },
  impactApi: { name: "Impact", logo: "/logos/ImpactLogo.png", color: "from-purple-500/20 to-violet-500/20" },

  // Tax
  hmrcApi: { name: "HMRC", logo: "/logos/HMRCLogo.png", color: "from-slate-500/20 to-gray-500/20" },
};

const getPluginDisplay = (credentialType: string) => {
  const display = pluginDisplayMap[credentialType];
  if (display) return display;

  // Fallback: clean up the credential type for display
  const cleaned = credentialType
    .replace(/OAuth2Api$/i, "")
    .replace(/Api$/i, "")
    .replace(/([A-Z])/g, " $1")
    .trim();

  return {
    name: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
    logo: "/logos/n8nLogo.png",
    color: "from-primary/20 to-accent/20",
  };
};

const pluginIcons: Record<string, any> = {
  gmail: Mail,
  email: Mail,
  drive: FileText,
  sheets: BarChart3,
  docs: FileText,
  calendar: Calendar,
  notion: FileText,
  slack: MessageSquare,
  database: Database,
  analytics: BarChart3,
  api: Globe,
  default: Plug,
};

const getPluginIcon = (plugin: string) => {
  const lower = plugin.toLowerCase();
  for (const [key, Icon] of Object.entries(pluginIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return pluginIcons.default;
};

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([]);
  const [hasAICapabilities, setHasAICapabilities] = useState(false);
  const [developerDialogOpen, setDeveloperDialogOpen] = useState(false);
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;

      const isMockId = id.startsWith("mock-");

      if (isMockId) {
        const mockAgent = mockAgents.find((a) => a.id === id);
        if (mockAgent) {
          setAgent({
            ...mockAgent,
            agent_categories: { name: mockAgent.category },
            long_description: mockAgent.description,
            capabilities: mockAgent.capabilities || [],
          });
        } else {
          navigate("/talent-pool");
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("agents")
        .select(
          `
          *,
          agent_categories(name)
        `,
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent:", error);
        navigate("/talent-pool");
      } else {
        setAgent(data);
      }
      setLoading(false);
    };

    fetchAgent();
  }, [id, navigate]);

  useEffect(() => {
    if (!user || !id) return;

    const checkInstallation = async () => {
      const { data } = await supabase
        .from("agent_installations")
        .select("id")
        .eq("agent_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsInstalled(!!data);
      setInstallationId(data?.id || null);
    };

    checkInstallation();
  }, [user, id]);

  useEffect(() => {
    if (!agent?.workflow_json) return;

    const credentials = new Set<string>();
    let aiEnabled = false;

    if (agent.workflow_json.nodes) {
      agent.workflow_json.nodes.forEach((node: any) => {
        if (node.type === "n8n-nodes-base.openAi") {
          aiEnabled = true;
        }

        if (node.credentials) {
          Object.keys(node.credentials).forEach((credType) => {
            credentials.add(credType);
          });
        }
      });
    }

    setHasAICapabilities(aiEnabled);
    setRequiredCredentials(Array.from(credentials));
  }, [agent]);

  // Keyboard shortcut to navigate back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" ||
        (e.key === "Backspace" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
      ) {
        navigate("/talent-pool");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleInstall = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setInstalling(true);

    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (workspaceError || !workspaceData) {
        throw new Error("No workspace found");
      }

      const { data: installation, error: installError } = await supabase
        .from("agent_installations")
        .insert({
          agent_id: id,
          user_id: user.id,
          workspace_id: workspaceData.workspace_id,
          install_state: {},
        })
        .select()
        .single();

      if (installError) throw installError;

      const { error: chatSessionError } = await supabase.from("chat_sessions").insert({
        installation_id: installation.id,
        workspace_id: workspaceData.workspace_id,
        agent_id: id,
      });

      if (chatSessionError) throw chatSessionError;

      await supabase
        .from("agents")
        .update({ total_installs: (agent?.total_installs || 0) + 1 })
        .eq("id", id);

      setIsInstalled(true);
      toast({
        title: "Success!",
        description: "Agent installed successfully. Redirecting to your workspace...",
      });

      setTimeout(() => navigate("/workspace"), 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Installation failed",
        description: error.message,
      });
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  const reviews = getReviewsByAgent(agent.id);
  const ratingDistribution = getRatingDistribution(agent.id);

  // Parse required credentials/plugins from agent data
  const plugins = agent.required_credentials || [];
  const supportedFeatures = agent.supported_features || ["text"];
  const isChatCompatible = agent.is_chat_compatible !== false;
  const isWorkflowBased = agent.is_workflow_based || false;

  const categorySlug = (agent.agent_categories?.name || agent.category || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");
  const categoryName = agent.agent_categories?.name || agent.category || "Uncategorized";
  const catConfig = categoryConfig[categoryName] || defaultCategoryConfig;

  const breadcrumbItems = [
    { label: "Talent Pool", href: "/talent-pool" },
    { label: categoryName, href: `/talent-pool/category/${categorySlug}` },
    { label: agent.name },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0 pt-20 sm:pt-16">
      <TalentPoolNavbar showSearch={false} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/talent-pool")}
          className="mb-4 -ml-2 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Talent Pool
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardContent className="relative p-6 md:p-8">
                <div className="space-y-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={catConfig.badgeBg}>
                      {categoryName}
                    </Badge>
                    {hasAICapabilities && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        AI-Powered
                      </Badge>
                    )}
                    {isChatCompatible && (
                      <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat Ready
                      </Badge>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div className="flex items-start gap-5">
                    <div
                      className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl ${catConfig.iconBg} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <span className={catConfig.iconText}>{catConfig.icon}</span>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{agent.name}</h1>
                      <p className="text-muted-foreground leading-relaxed">
                        {agent.short_description || agent.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Developed by{" "}
                        <span 
                          onClick={() => setWaitlistDialogOpen(true)}
                          className="underline cursor-pointer hover:text-primary transition-colors"
                        >
                          Axlerod Agents
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating || 0}</span>
                      <span className="text-muted-foreground">({agent.total_reviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{agent.total_installs || 0} installs</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">~{agent.response_timeout || 30}s response</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3 pt-2">
                    {isInstalled ? (
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 shadow-lg"
                        onClick={() => navigate("/workspace")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open in Workspace
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 shadow-lg"
                        onClick={handleInstall}
                        disabled={installing}
                      >
                        {installing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        View My Workspace
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screenshot Gallery */}
            {agent.screenshots && agent.screenshots.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScreenshotGallery screenshots={agent.screenshots} agentName={agent.name} />
                </CardContent>
              </Card>
            )}

            {/* Tabbed Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-muted/50 backdrop-blur-sm border border-border/50 p-1 overflow-hidden">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="plugins" className="data-[state=active]:bg-background">
                  Plugins
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-background">
                  Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="support" className="data-[state=active]:bg-background">
                  Support
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Description Card */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      What This Agent Does
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {agent.long_description || agent.description}
                    </p>
                  </CardContent>
                </Card>

                {/* AI Capabilities Card */}
                {(hasAICapabilities || agent.ai_personality) && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        AI Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                      <p className="text-sm text-muted-foreground">
                        This agent leverages advanced AI models to understand context, generate intelligent responses,
                        and automate complex tasks.
                      </p>
                      {agent.ai_personality && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Personality
                          </h4>
                          <p className="text-sm text-muted-foreground">{agent.ai_personality}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                          Natural Language
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                          Context Aware
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                          Auto Learning
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Features */}
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Key Capabilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {agent.capabilities.map((capability: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            </div>
                            <span className="text-sm">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Technical Specs */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-muted-foreground" />
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className="text-sm font-medium">~{agent.response_timeout || 30}s</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Chat Compatible</span>
                        <Badge
                          variant="secondary"
                          className={isChatCompatible ? "bg-green-500/10 text-green-600" : "bg-muted"}
                        >
                          {isChatCompatible ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Workflow Based</span>
                        <Badge
                          variant="secondary"
                          className={isWorkflowBased ? "bg-blue-500/10 text-blue-600" : "bg-muted"}
                        >
                          {isWorkflowBased ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Supported Features</span>
                        <div className="flex gap-1">
                          {supportedFeatures.slice(0, 3).map((feature: string) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* OAuth Setup */}
                {isInstalled && agent.is_workflow_based && installationId && requiredCredentials.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Service Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AgentOAuthSetup
                        agentId={agent.id}
                        installationId={installationId}
                        requiredCredentials={requiredCredentials}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Plugins Tab */}
              <TabsContent value="plugins" className="space-y-6 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plug className="h-5 w-5 text-primary" />
                      Required Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This agent connects with the following services to perform its tasks. You'll be prompted to
                      connect these when you install the agent.
                    </p>

                    {plugins && plugins.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {plugins.map((plugin: string, index: number) => {
                          const pluginDisplay = getPluginDisplay(plugin);
                          const PluginIcon = getPluginIcon(plugin);
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${pluginDisplay.color} border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200`}
                            >
                              <div className="h-12 w-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm overflow-hidden">
                                <img
                                  src={pluginDisplay.logo}
                                  alt={pluginDisplay.name}
                                  className="h-7 w-7 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                  }}
                                />
                                <PluginIcon className="h-6 w-6 text-primary hidden" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{pluginDisplay.name}</p>
                                <p className="text-xs text-muted-foreground">Integration Required</p>
                              </div>
                              <Badge variant="outline" className="text-xs bg-background/50">
                                OAuth
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 rounded-xl bg-muted/20 border border-dashed border-border">
                        <Unlock className="h-10 w-10 text-green-500 mx-auto mb-3" />
                        <p className="font-medium">No External Integrations Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This agent works out of the box without any additional setup
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Note */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Secure Connections</h4>
                        <p className="text-sm text-muted-foreground">
                          All integrations use OAuth 2.0 for secure authentication. Your credentials are encrypted and
                          never stored in plain text. You can revoke access at any time from your Connections settings.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StarBreakdown distribution={ratingDistribution} totalReviews={reviews.length} />
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">User Reviews</h3>
                  {reviews.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="text-center py-12">
                        <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this agent!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => <ReviewCard key={review.id} {...review} />)
                  )}
                </div>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-4 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Documentation</div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guides and API references to help you get started
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Email Support</div>
                      <p className="text-sm text-muted-foreground">Contact support@elixa.app for priority assistance</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Community</div>
                      <p className="text-sm text-muted-foreground">
                        Join our Discord community to connect with other users
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Quick Info</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{agent.agent_categories?.name || "General"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{agent.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Installs</span>
                      <span className="font-medium">{agent.total_installs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium">~{agent.response_timeout || 30}s</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Plugins Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Plug className="h-4 w-4" />
                    Integrations
                  </h4>
                  {plugins && plugins.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {plugins.slice(0, 4).map((plugin: string, index: number) => {
                        const pluginDisplay = getPluginDisplay(plugin);
                        return (
                          <Badge key={index} variant="outline" className="text-xs bg-muted/50">
                            {pluginDisplay.name}
                          </Badge>
                        );
                      })}
                      {plugins.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-muted/50">
                          +{plugins.length - 4} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No external integrations required</p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  {isInstalled ? (
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/workspace")}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open in Workspace
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleInstall}
                      disabled={installing}
                    >
                      {installing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      View My Workspace
                    </Button>
                  )}

                  {/* Platform Integration Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-sm"
                      onClick={() => setWaitlistDialogOpen(true)}
                    >
                      <img src="/logos/SlackLogo.svg" alt="Slack" className="h-4 w-4" />
                      Add to Slack
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-sm"
                      onClick={() => setWaitlistDialogOpen(true)}
                    >
                      <img src="/logos/TeamsLogo.svg" alt="Teams" className="h-4 w-4" />
                      Add to Teams
                    </Button>
                  </div>

                  {/* Developer CTA */}
                  <Button
                    variant="outline"
                    className="w-full text-sm border-emerald-500/50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                    onClick={() => setDeveloperDialogOpen(true)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Are you an AI agent developer?
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Agents */}
            <RelatedAgents currentAgentId={agent.id} relatedAgentIds={agent.relatedAgentIds || []} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <TalentPoolFooter />

      {/* Developer Dialog */}
      <DeveloperDialog open={developerDialogOpen} onOpenChange={setDeveloperDialogOpen} />
      <WaitlistDialog open={waitlistDialogOpen} onOpenChange={setWaitlistDialogOpen} />
    </div>
  );
};

export default AgentDetail;
