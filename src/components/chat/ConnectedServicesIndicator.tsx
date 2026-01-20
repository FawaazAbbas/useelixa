import { useState, useEffect } from "react";
import { Link2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ConnectedService {
  name: string;
  credentialType: string;
  accountEmail?: string;
  status: "connected" | "expired";
  icon?: string;
}

const SERVICE_ICONS: Record<string, string> = {
  googleOAuth2Api: "/logos/GoogleDriveLogo.png",
  notionApi: "/logos/NotionLogo.svg",
  slackOAuth2Api: "/logos/SlackLogo.svg",
  calendlyApi: "/logos/calendar.svg",
  microsoftOAuth2Api: "/logos/TeamsLogo.svg",
  hubspotOAuth2Api: "/logos/HubSpotLogo.svg",
  mailchimpOAuth2Api: "/logos/MailchimpLogo.svg",
};

const SERVICE_NAMES: Record<string, string> = {
  googleOAuth2Api: "Google",
  notionApi: "Notion",
  slackOAuth2Api: "Slack",
  calendlyApi: "Calendly",
  microsoftOAuth2Api: "Microsoft",
  hubspotOAuth2Api: "HubSpot",
  mailchimpOAuth2Api: "Mailchimp",
};

interface Props {
  userId: string;
}

export function ConnectedServicesIndicator({ userId }: Props) {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnectedServices();
  }, [userId]);

  const fetchConnectedServices = async () => {
    try {
      const { data: credentials, error } = await supabase
        .from("user_credentials")
        .select("credential_type, expires_at, account_email")
        .eq("user_id", userId);

      if (error) throw error;

      const serviceMap = new Map<string, ConnectedService>();

      for (const cred of credentials || []) {
        const credType = cred.credential_type;
        const isExpired = cred.expires_at && new Date(cred.expires_at) < new Date();

        if (!serviceMap.has(credType)) {
          serviceMap.set(credType, {
            name: SERVICE_NAMES[credType] || credType,
            credentialType: credType,
            accountEmail: cred.account_email || undefined,
            status: isExpired ? "expired" : "connected",
            icon: SERVICE_ICONS[credType],
          });
        }
      }

      setServices(Array.from(serviceMap.values()));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const connectedCount = services.filter((s) => s.status === "connected").length;
  const expiredCount = services.filter((s) => s.status === "expired").length;

  if (services.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/connections")}
      >
        <Link2 className="h-4 w-4" />
        <span className="text-xs">Connect services</span>
      </Button>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-4 w-4" />
          <span className="text-xs">
            {connectedCount} connected
            {expiredCount > 0 && (
              <span className="text-yellow-500 ml-1">({expiredCount} expired)</span>
            )}
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute top-full left-0 mt-1 z-50 w-64 bg-popover border rounded-lg shadow-lg p-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Elixa can use these services:
          </p>
          {services.map((service) => (
            <div
              key={service.credentialType}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
            >
              {service.icon ? (
                <img src={service.icon} alt="" className="h-4 w-4" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{service.name}</p>
                {service.accountEmail && (
                  <p className="text-xs text-muted-foreground truncate">
                    {service.accountEmail}
                  </p>
                )}
              </div>
              {service.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                  Expired
                </Badge>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate("/connections")}
          >
            Manage connections
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
