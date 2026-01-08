import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/utils/analytics";

interface ShareButtonsProps {
  referralCode: string;
  referralLink: string;
  userName?: string;
}

export const ShareButtons = ({ referralCode, referralLink, userName }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const shareMessage = `I just joined the Elixa waitlist - AI employees that actually work! Join with my code ${referralCode} and we both get 3 free AI agents: ${referralLink}`;
  
  const emailSubject = encodeURIComponent("Join me on Elixa - Get 3 Free AI Agents!");
  const emailBody = encodeURIComponent(
    `Hey!\n\n${userName ? `${userName} thinks` : "I think"} you'd love Elixa - they're building AI employees that actually get work done.\n\nI just joined their waitlist and wanted to share my invite code with you. If you sign up using my code, we both get 3 free AI agents when Elixa launches!\n\nUse my code: ${referralCode}\nOr join directly: ${referralLink}\n\nSee you there!`
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      trackEvent({ action: "referral_code_copied", category: "engagement", label: "link" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: string) => {
    trackEvent({ action: "referral_share_clicked", category: "engagement", label: platform });
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        break;
      case "email":
        url = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-violet-500/10 hover:border-violet-500/50"
        onClick={() => handleShare("email")}
      >
        <Mail className="w-4 h-4 text-violet-500" />
        <span className="text-[10px] text-muted-foreground">Email</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-500/10 hover:border-green-500/50"
        onClick={() => handleShare("whatsapp")}
      >
        <MessageCircle className="w-4 h-4 text-green-500" />
        <span className="text-[10px] text-muted-foreground">WhatsApp</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-sky-500/10 hover:border-sky-500/50"
        onClick={() => handleShare("twitter")}
      >
        <Twitter className="w-4 h-4 text-sky-500" />
        <span className="text-[10px] text-muted-foreground">Twitter</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-500/10 hover:border-blue-500/50"
        onClick={() => handleShare("linkedin")}
      >
        <Linkedin className="w-4 h-4 text-blue-600" />
        <span className="text-[10px] text-muted-foreground">LinkedIn</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={`flex flex-col items-center gap-1 h-auto py-3 transition-all ${
          copied ? "bg-green-500/10 border-green-500/50" : "hover:bg-muted"
        }`}
        onClick={handleCopyLink}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-[10px] text-muted-foreground">{copied ? "Copied!" : "Copy"}</span>
      </Button>
    </div>
  );
};
