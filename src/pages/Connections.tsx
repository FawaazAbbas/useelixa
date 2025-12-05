import { useState } from "react";
import { Plug, CheckCircle2, Search, Filter, LayoutGrid, Link2, Unplug } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { GOOGLE_BUNDLES } from "@/config/googleBundles";
import { DemoBanner } from "@/components/DemoBanner";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { cn } from "@/lib/utils";

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
  // Productivity
  notionApi: {
    name: "Notion Workspace",
    description: "Connect your Notion workspace for document management and collaboration",
    category: "Productivity",
    icon: "📝",
    color: "bg-gray-800",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/NotionLogo.png`,
    companyName: "Notion",
  },
  asanaApi: {
    name: "Asana",
    description: "Project management and team collaboration platform",
    category: "Productivity",
    icon: "✅",
    color: "bg-pink-500",
    logo: "/logos/AsanaLogo.png",
    companyName: "Asana",
  },
  linearApi: {
    name: "Linear",
    description: "Issue tracking and project management for software teams",
    category: "Productivity",
    icon: "📊",
    color: "bg-indigo-600",
    logo: "/logos/LinearLogo.png",
    companyName: "Linear",
  },
  clickupApi: {
    name: "ClickUp",
    description: "All-in-one productivity and project management platform",
    category: "Productivity",
    icon: "📋",
    color: "bg-purple-500",
    logo: "/logos/ClickUpLogo.png",
    companyName: "ClickUp",
  },
  figmaApi: {
    name: "Figma",
    description: "Collaborative design and prototyping tool",
    category: "Productivity",
    icon: "🎨",
    color: "bg-purple-600",
    logo: "/logos/FigmaLogo.png",
    companyName: "Figma",
  },
  dropboxApi: {
    name: "Dropbox",
    description: "Cloud storage and file synchronization service",
    category: "Productivity",
    icon: "📦",
    color: "bg-blue-600",
    logo: "/logos/DropboxLogo.png",
    companyName: "Dropbox",
  },
  googleDriveApi: {
    name: "Google Drive",
    description: "Cloud storage and file sharing service",
    category: "Productivity",
    icon: "📁",
    color: "bg-yellow-500",
    logo: "/logos/GoogleDriveLogo.png",
    companyName: "Google",
  },
  n8nApi: {
    name: "n8n",
    description: "Workflow automation and integration platform",
    category: "Productivity",
    icon: "⚡",
    color: "bg-orange-500",
    logo: "/logos/n8nLogo.png",
    companyName: "n8n",
  },

  // Communication
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
    category: "Communication",
    icon: "🪟",
    color: "bg-blue-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/MicrosoftLogo.webp`,
    companyName: "Microsoft",
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
  whatsappBusinessApi: {
    name: "WhatsApp Business",
    description: "Business messaging and customer communication via WhatsApp",
    category: "Communication",
    icon: "💬",
    color: "bg-green-500",
    logo: "/logos/WhatsAppLogo.png",
    companyName: "Meta",
  },
  aircallApi: {
    name: "Aircall",
    description: "Cloud-based phone system for sales and support teams",
    category: "Communication",
    icon: "📱",
    color: "bg-green-600",
    logo: "/logos/AircallLogo.png",
    companyName: "Aircall",
  },

  // Marketing
  mailchimpOAuth2Api: {
    name: "Mailchimp",
    description: "Connect Mailchimp for email marketing and campaign management",
    category: "Marketing",
    icon: "🐵",
    color: "bg-yellow-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/mailchimp.png`,
    companyName: "Mailchimp",
  },
  klaviyoApi: {
    name: "Klaviyo",
    description: "Email and SMS marketing automation for e-commerce",
    category: "Marketing",
    icon: "📧",
    color: "bg-green-600",
    logo: "/logos/KlaviyoLogo.png",
    companyName: "Klaviyo",
  },
  omnisendApi: {
    name: "Omnisend",
    description: "E-commerce marketing automation platform",
    category: "Marketing",
    icon: "📨",
    color: "bg-purple-600",
    logo: "/logos/OmnisendLogo.png",
    companyName: "Omnisend",
  },
  tiktokAdsApi: {
    name: "TikTok Ads",
    description: "Advertising and marketing on TikTok platform",
    category: "Marketing",
    icon: "🎵",
    color: "bg-black",
    logo: "/logos/TikTokLogo.png",
    companyName: "TikTok",
  },
  metaBusinessApi: {
    name: "Meta Business Suite",
    description: "Connect Facebook and Instagram for social media management",
    category: "Marketing",
    icon: "📱",
    color: "bg-blue-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/MetaLogo.png`,
    companyName: "Meta",
  },

  // Analytics
  tripleWhaleApi: {
    name: "Triple Whale",
    description: "E-commerce analytics and attribution platform",
    category: "Analytics",
    icon: "🐋",
    color: "bg-blue-600",
    logo: "/logos/TripleWhaleLogo.png",
    companyName: "Triple Whale",
  },
  northbeamApi: {
    name: "Northbeam",
    description: "Marketing analytics and multi-touch attribution",
    category: "Analytics",
    icon: "📈",
    color: "bg-indigo-600",
    logo: "/logos/NorthbeamLogo.png",
    companyName: "Northbeam",
  },
  bigQueryApi: {
    name: "BigQuery",
    description: "Google Cloud data warehouse for analytics",
    category: "Analytics",
    icon: "📊",
    color: "bg-blue-500",
    logo: "/logos/BigQueryLogo.png",
    companyName: "Google",
  },

  // Influencer & Affiliate
  grinApi: {
    name: "Grin",
    description: "Influencer marketing and creator management platform",
    category: "Influencer & Affiliate",
    icon: "🤝",
    color: "bg-purple-500",
    logo: "/logos/GrinLogo.png",
    companyName: "Grin",
  },
  aspireApi: {
    name: "Aspire",
    description: "Influencer marketing and brand collaboration platform",
    category: "Influencer & Affiliate",
    icon: "⭐",
    color: "bg-pink-500",
    logo: "/logos/AspireLogo.png",
    companyName: "Aspire",
  },
  impactApi: {
    name: "Impact",
    description: "Partnership and affiliate marketing automation",
    category: "Influencer & Affiliate",
    icon: "🎯",
    color: "bg-blue-700",
    logo: "/logos/ImpactLogo.png",
    companyName: "Impact",
  },
  awinApi: {
    name: "Awin",
    description: "Global affiliate marketing network",
    category: "Influencer & Affiliate",
    icon: "🔗",
    color: "bg-blue-600",
    logo: "/logos/AwinLogo.png",
    companyName: "Awin",
  },

  // Optimization
  vwoApi: {
    name: "VWO",
    description: "A/B testing and conversion optimization platform",
    category: "Optimization",
    icon: "🔬",
    color: "bg-blue-500",
    logo: "/logos/VWOLogo.png",
    companyName: "VWO",
  },
  convertApi: {
    name: "Convert",
    description: "A/B testing and personalization platform",
    category: "Optimization",
    icon: "🎯",
    color: "bg-orange-500",
    logo: "/logos/ConvertLogo.png",
    companyName: "Convert",
  },

  // Customer Support
  gorgiasApi: {
    name: "Gorgias",
    description: "Customer service helpdesk for e-commerce",
    category: "Customer Support",
    icon: "🎧",
    color: "bg-blue-600",
    logo: "/logos/GorgiasLogo.png",
    companyName: "Gorgias",
  },
  zendeskApi: {
    name: "Zendesk",
    description: "Customer service and engagement platform",
    category: "Customer Support",
    icon: "💬",
    color: "bg-green-600",
    logo: "/logos/ZendeskLogo.png",
    companyName: "Zendesk",
  },
  freshdeskApi: {
    name: "Freshdesk",
    description: "Cloud-based customer support software",
    category: "Customer Support",
    icon: "🎫",
    color: "bg-green-500",
    logo: "/logos/FreshdeskLogo.png",
    companyName: "Freshworks",
  },

  // Reviews
  trustpilotApi: {
    name: "Trustpilot",
    description: "Customer reviews and reputation management",
    category: "Reviews",
    icon: "⭐",
    color: "bg-green-500",
    logo: "/logos/TrustpilotLogo.png",
    companyName: "Trustpilot",
  },
  judgeMeApi: {
    name: "Judge.me",
    description: "Product reviews for e-commerce stores",
    category: "Reviews",
    icon: "⚖️",
    color: "bg-yellow-500",
    logo: "/logos/JudgeMeLogo.png",
    companyName: "Judge.me",
  },
  yotpoApi: {
    name: "Yotpo",
    description: "Reviews, loyalty, and user-generated content platform",
    category: "Reviews",
    icon: "🌟",
    color: "bg-blue-600",
    logo: "/logos/YotpoLogo.png",
    companyName: "Yotpo",
  },

  // Finance & Payments
  xeroApi: {
    name: "Xero",
    description: "Cloud-based accounting software",
    category: "Finance",
    icon: "📒",
    color: "bg-blue-500",
    logo: "/logos/XeroLogo.png",
    companyName: "Xero",
  },
  quickbooksApi: {
    name: "QuickBooks Online",
    description: "Accounting and business management software",
    category: "Finance",
    icon: "📊",
    color: "bg-green-600",
    logo: "/logos/QuickBooksLogo.png",
    companyName: "Intuit",
  },
  stripeApi: {
    name: "Stripe",
    description: "Online payment processing platform",
    category: "Finance",
    icon: "💳",
    color: "bg-purple-600",
    logo: "/logos/StripeLogo.png",
    companyName: "Stripe",
  },
  paypalApi: {
    name: "PayPal",
    description: "Online payments and money transfers",
    category: "Finance",
    icon: "💰",
    color: "bg-blue-700",
    logo: "/logos/PayPalLogo.png",
    companyName: "PayPal",
  },
  klarnaApi: {
    name: "Klarna",
    description: "Buy now, pay later payment solutions",
    category: "Finance",
    icon: "🛒",
    color: "bg-pink-500",
    logo: "/logos/KlarnaLogo.png",
    companyName: "Klarna",
  },
  clearpayApi: {
    name: "Clearpay",
    description: "Buy now, pay later payment service",
    category: "Finance",
    icon: "💎",
    color: "bg-teal-500",
    logo: "/logos/ClearpayLogo.png",
    companyName: "Clearpay",
  },
  laybuyApi: {
    name: "Laybuy",
    description: "Interest-free payment installments",
    category: "Finance",
    icon: "📆",
    color: "bg-purple-500",
    logo: "/logos/LaybuyLogo.png",
    companyName: "Laybuy",
  },
  trueLayerApi: {
    name: "TrueLayer",
    description: "Open banking API platform",
    category: "Finance",
    icon: "🏦",
    color: "bg-blue-600",
    logo: "/logos/TrueLayerLogo.png",
    companyName: "TrueLayer",
  },
  plaidApi: {
    name: "Plaid",
    description: "Financial data connectivity platform",
    category: "Finance",
    icon: "🔐",
    color: "bg-black",
    logo: "/logos/PlaidLogo.png",
    companyName: "Plaid",
  },
  hmrcMtdApi: {
    name: "HMRC MTD VAT",
    description: "UK tax API for Making Tax Digital",
    category: "Finance",
    icon: "🇬🇧",
    color: "bg-green-700",
    logo: "/logos/HMRCLogo.png",
    companyName: "HMRC",
  },

  // Development
  githubApi: {
    name: "GitHub",
    description: "Code hosting and version control platform",
    category: "Development",
    icon: "🐙",
    color: "bg-gray-900",
    logo: "/logos/GitHubLogo.png",
    companyName: "GitHub",
  },
  gitlabApi: {
    name: "GitLab",
    description: "DevOps platform for software development",
    category: "Development",
    icon: "🦊",
    color: "bg-orange-600",
    logo: "/logos/GitLabLogo.png",
    companyName: "GitLab",
  },
  bitbucketApi: {
    name: "Bitbucket",
    description: "Git-based code hosting and collaboration",
    category: "Development",
    icon: "🪣",
    color: "bg-blue-600",
    logo: "/logos/BitbucketLogo.png",
    companyName: "Atlassian",
  },
  supabaseApi: {
    name: "Supabase",
    description: "Open source Firebase alternative with PostgreSQL",
    category: "Development",
    icon: "⚡",
    color: "bg-green-600",
    logo: "/logos/SupabaseLogo.png",
    companyName: "Supabase",
  },

  // Hosting & Cloud
  vercelApi: {
    name: "Vercel",
    description: "Frontend cloud platform and deployment",
    category: "Hosting & Cloud",
    icon: "▲",
    color: "bg-black",
    logo: "/logos/VercelLogo.png",
    companyName: "Vercel",
  },
  netlifyApi: {
    name: "Netlify",
    description: "Web development platform and hosting",
    category: "Hosting & Cloud",
    icon: "🌐",
    color: "bg-teal-500",
    logo: "/logos/NetlifyLogo.png",
    companyName: "Netlify",
  },
  renderApi: {
    name: "Render",
    description: "Cloud platform for apps and websites",
    category: "Hosting & Cloud",
    icon: "🚀",
    color: "bg-purple-600",
    logo: "/logos/RenderLogo.png",
    companyName: "Render",
  },
  awsApi: {
    name: "Amazon Web Services",
    description: "Cloud computing services by Amazon",
    category: "Hosting & Cloud",
    icon: "☁️",
    color: "bg-orange-500",
    logo: "/logos/AWSLogo.png",
    companyName: "Amazon",
  },
  gcpApi: {
    name: "Google Cloud Platform",
    description: "Cloud computing services by Google",
    category: "Hosting & Cloud",
    icon: "☁️",
    color: "bg-blue-500",
    logo: "/logos/GCPLogo.png",
    companyName: "Google",
  },

  // Monitoring
  sentryApi: {
    name: "Sentry",
    description: "Application monitoring and error tracking",
    category: "Monitoring",
    icon: "🛡️",
    color: "bg-purple-700",
    logo: "/logos/SentryLogo.png",
    companyName: "Sentry",
  },
  logrocketApi: {
    name: "LogRocket",
    description: "Session replay and frontend monitoring",
    category: "Monitoring",
    icon: "🚀",
    color: "bg-purple-600",
    logo: "/logos/LogRocketLogo.png",
    companyName: "LogRocket",
  },
  datadogApi: {
    name: "Datadog",
    description: "Cloud monitoring and security platform",
    category: "Monitoring",
    icon: "🐕",
    color: "bg-purple-500",
    logo: "/logos/DatadogLogo.png",
    companyName: "Datadog",
  },
  newRelicApi: {
    name: "New Relic",
    description: "Observability platform for software monitoring",
    category: "Monitoring",
    icon: "📡",
    color: "bg-green-600",
    logo: "/logos/NewRelicLogo.png",
    companyName: "New Relic",
  },

  // Legal & Compliance
  docusignApi: {
    name: "DocuSign",
    description: "Electronic signature and agreement cloud",
    category: "Legal & Compliance",
    icon: "✍️",
    color: "bg-blue-600",
    logo: "/logos/DocuSignLogo.png",
    companyName: "DocuSign",
  },
  adobeSignApi: {
    name: "Adobe Sign",
    description: "E-signature solution by Adobe",
    category: "Legal & Compliance",
    icon: "📝",
    color: "bg-red-600",
    logo: "/logos/AdobeSignLogo.png",
    companyName: "Adobe",
  },
  oneTrustApi: {
    name: "OneTrust",
    description: "Privacy, security, and data governance",
    category: "Legal & Compliance",
    icon: "🔒",
    color: "bg-green-600",
    logo: "/logos/OneTrustLogo.png",
    companyName: "OneTrust",
  },
  cookiebotApi: {
    name: "Cookiebot",
    description: "Cookie consent and compliance management",
    category: "Legal & Compliance",
    icon: "🍪",
    color: "bg-blue-500",
    logo: "/logos/CookiebotLogo.png",
    companyName: "Cookiebot",
  },

  // E-commerce
  shopifyOAuth2Api: {
    name: "Shopify Store",
    description: "Connect your Shopify store for e-commerce automation",
    category: "E-commerce",
    icon: "🛍️",
    color: "bg-green-600",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/ShopifyLogo.png`,
    companyName: "Shopify",
  },

  // Scheduling
  calendlyApi: {
    name: "Calendly",
    description: "Schedule and manage meetings with Calendly integration",
    category: "Scheduling",
    icon: "📅",
    color: "bg-blue-500",
    logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/CalendlyLogo.png`,
    companyName: "Calendly",
  },

  // Forms
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
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // Demo mode: 26 connected integrations (Google bundles, Finance, Marketing, Customer Support)
  const connections: ConnectionStatus[] = [
    // Google Bundles (6)
    { type: "googleOAuth2Api", connected: true, bundleType: "email_workspace", accountEmail: "demo@techreborn.com", accountLabel: "Work Account", lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "googleOAuth2Api", connected: true, bundleType: "ads_marketing", accountEmail: "ads@techreborn.com", accountLabel: "Ads Account", lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "googleOAuth2Api", connected: true, bundleType: "analytics_reporting", accountEmail: "analytics@techreborn.com", accountLabel: "Analytics", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "googleOAuth2Api", connected: true, bundleType: "cloud_data", accountEmail: "data@techreborn.com", accountLabel: "Cloud Data", lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "googleOAuth2Api", connected: true, bundleType: "firebase_infra", accountEmail: "dev@techreborn.com", accountLabel: "Firebase", lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "googleOAuth2Api", connected: true, bundleType: "android_play", accountEmail: "mobile@techreborn.com", accountLabel: "Play Store", lastConnected: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    // Marketing (4)
    { type: "klaviyoApi", connected: true, accountEmail: "marketing@techreborn.com", accountLabel: "Tech Reborn Marketing", lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "mailchimpOAuth2Api", connected: true, accountEmail: "marketing@techreborn.com", accountLabel: "Main Account", lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "omnisendApi", connected: true, accountEmail: "marketing@techreborn.com", accountLabel: "Ecommerce Store", lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "tiktokAdsApi", connected: true, accountEmail: "ads@techreborn.com", accountLabel: "Tech Reborn Ads", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    // Finance (10)
    { type: "xeroApi", connected: true, accountEmail: "finance@techreborn.com", accountLabel: "Tech Reborn Ltd", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "quickbooksApi", connected: true, accountEmail: "finance@techreborn.com", accountLabel: "US Operations", lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "stripeApi", connected: true, accountEmail: "payments@techreborn.com", accountLabel: "Live Account", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "paypalApi", connected: true, accountEmail: "payments@techreborn.com", accountLabel: "Business Account", lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "klarnaApi", connected: true, accountEmail: "payments@techreborn.com", accountLabel: "EU Store", lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "clearpayApi", connected: true, accountEmail: "payments@techreborn.com", accountLabel: "UK Store", lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "laybuyApi", connected: true, accountEmail: "payments@techreborn.com", accountLabel: "ANZ Store", lastConnected: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "truelayerApi", connected: true, accountEmail: "finance@techreborn.com", accountLabel: "Open Banking", lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "plaidApi", connected: true, accountEmail: "finance@techreborn.com", accountLabel: "Bank Connections", lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "hmrcMtdApi", connected: true, accountEmail: "tax@techreborn.com", accountLabel: "VAT Returns", lastConnected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    // Customer Support (3)
    { type: "gorgiasApi", connected: true, accountEmail: "support@techreborn.com", accountLabel: "Helpdesk", lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "zendeskApi", connected: true, accountEmail: "support@techreborn.com", accountLabel: "Support Portal", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "freshdeskApi", connected: true, accountEmail: "support@techreborn.com", accountLabel: "Customer Service", lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    // Communication (2)
    { type: "slackOAuth2Api", connected: true, accountEmail: "team@techreborn.slack.com", accountLabel: "Company Workspace", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "notionApi", connected: true, accountEmail: "demo@techreborn.com", accountLabel: "Main Workspace", lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    // Reviews (1)
    { type: "trustpilotApi", connected: true, accountEmail: "reviews@techreborn.com", accountLabel: "Tech Reborn Store", lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const handleConnect = () => {
    setWaitlistOpen(true);
  };

  const handleDisconnect = () => {
    toast.error("Disconnect feature disabled in demo mode");
  };

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

  // Get unique categories
  const categories = Array.from(new Set(allConnectionItems.map((item) => item.info.category)));

  // Category counts
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = allConnectionItems.filter((item) => item.info.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Stats
  const stats = {
    total: allConnectionItems.length,
    connected: allConnectionItems.filter((item) =>
      item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection
    ).length,
    available: allConnectionItems.filter((item) =>
      item.isGoogleBundle ? (item as any).credentials?.length === 0 : !item.connection
    ).length,
  };

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
      (selectedStatus === "available" && !isConnected);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusButtons = [
    { key: "all", label: "All", count: stats.total, icon: LayoutGrid },
    { key: "connected", label: "Connected", count: stats.connected, icon: Link2, color: "text-green-500" },
    { key: "available", label: "Available", count: stats.available, icon: Unplug, color: "text-muted-foreground" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl hidden sm:inline">Connections</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {stats.connected} connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm shrink-0">
          <ScrollArea className="flex-1 w-full">
            <div className="py-3 pl-3 pr-4 w-full max-w-full overflow-hidden">
              {/* Status Filters */}
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <Filter className="h-3 w-3 shrink-0" />
                  By Status
                </h3>
                <div className="space-y-0.5 w-full">
                  {statusButtons.map((btn) => (
                    <button
                      key={btn.key}
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        selectedStatus === btn.key 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedStatus(btn.key)}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <btn.icon className={cn("h-3 w-3 shrink-0", selectedStatus !== btn.key && btn.color)} />
                        <span className="truncate">{btn.label}</span>
                      </span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        selectedStatus === btn.key ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {btn.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <LayoutGrid className="h-3 w-3 shrink-0" />
                  By Category
                </h3>
                <div className="space-y-0.5 w-full">
                  <button
                    className={cn(
                      "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                      selectedCategory === "all" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedCategory("all")}
                  >
                    <span className="truncate flex-1 text-left">All Categories</span>
                    <span className={cn(
                      "text-[10px] tabular-nums shrink-0 ml-2",
                      selectedCategory === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {stats.total}
                    </span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        selectedCategory === cat 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                    >
                      <span className="truncate flex-1 text-left min-w-0">{cat}</span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        selectedCategory === cat ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {categoryCounts[cat]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b bg-card/30">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden p-3 border-b flex gap-2 overflow-x-auto">
            {statusButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={selectedStatus === btn.key ? "secondary" : "outline"}
                size="sm"
                className="shrink-0 h-8 text-xs gap-1"
                onClick={() => setSelectedStatus(btn.key)}
              >
                <btn.icon className={cn("h-3 w-3", selectedStatus !== btn.key && btn.color)} />
                {btn.label}
                <Badge variant="secondary" className="ml-1 text-[10px] px-1">{btn.count}</Badge>
              </Button>
            ))}
          </div>

          {/* Content Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {filteredConnections.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Plug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No connections found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No connections match your search" : "Try adjusting your filters"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredConnections.map((item, idx) => {
                    const isConnected = item.isGoogleBundle ? (item as any).credentials?.length > 0 : !!item.connection;

                    return (
                      <Card
                        key={item.type}
                        className={cn(
                          "transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4",
                          isConnected ? "border-l-green-500" : "border-l-muted"
                        )}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 p-1.5">
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
                                <CardTitle className="text-sm leading-tight">{item.info.name}</CardTitle>
                                <p className="text-[11px] text-muted-foreground">by {item.info.companyName}</p>
                              </div>
                            </div>
                            {isConnected && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <CardDescription className="text-xs line-clamp-2">{item.info.description}</CardDescription>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {item.info.category}
                            </Badge>
                            {isConnected && (
                              <Badge className="text-[10px] px-1.5 bg-green-500">
                                Connected
                              </Badge>
                            )}
                          </div>
                          {isConnected ? (
                            <div className="space-y-2">
                              <p className="text-[11px] text-muted-foreground truncate">{item.connection?.accountEmail}</p>
                              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={handleDisconnect}>
                                <Unplug className="h-3 w-3 mr-1.5" />
                                Disconnect
                              </Button>
                            </div>
                          ) : (
                            <Button variant="default" size="sm" className="w-full h-8 text-xs" onClick={handleConnect}>
                              <Plug className="h-3 w-3 mr-1.5" />
                              Connect
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
