import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

interface MobileShareButtonProps {
  referralCode: string;
  referralLink: string;
}

export const MobileShareButton = ({ referralCode, referralLink }: MobileShareButtonProps) => {
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    trackEvent({ action: "referral_native_share_clicked", category: "engagement", label: "mobile" });
    
    try {
      await navigator.share({
        title: "Join Elixa - Get 3 Free AI Agents!",
        text: `I just joined the Elixa waitlist - AI employees that actually work! Join with my code ${referralCode} and we both get 3 free AI agents.`,
        url: referralLink,
      });
      trackEvent({ action: "referral_native_share_completed", category: "engagement", label: "mobile" });
    } catch (err) {
      // User cancelled or share failed - this is normal
      console.log("Share cancelled or failed:", err);
    }
  };

  if (!canShare) return null;

  return (
    <Button
      onClick={handleNativeShare}
      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share with Friends
    </Button>
  );
};
