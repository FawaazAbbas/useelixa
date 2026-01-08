import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Copy, Check, Sparkles, Users, Trophy } from "lucide-react";
import { useState } from "react";
import { ShareButtons } from "./ShareButtons";
import { trackEvent } from "@/utils/analytics";

interface ReferralShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
  userName: string;
  referralCount?: number;
}

export const ReferralShareDialog = ({
  open,
  onOpenChange,
  referralCode,
  userName,
  referralCount = 0,
}: ReferralShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://elixa.app/signup?ref=${referralCode}`;
  const progress = Math.min((referralCount / 3) * 100, 100);
  const friendsNeeded = Math.max(3 - referralCount, 0);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      trackEvent({ action: "referral_code_copied", category: "engagement", label: "code" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRemindLater = () => {
    trackEvent({ action: "referral_remind_later", category: "engagement" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-violet-500/20">
        {/* Confetti background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Animated sparkles */}
        <div className="absolute top-4 left-8 animate-pulse">
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="absolute top-8 right-12 animate-pulse" style={{ animationDelay: "0.5s" }}>
          <Sparkles className="w-3 h-3 text-violet-400" />
        </div>
        <div className="absolute top-12 left-16 animate-pulse" style={{ animationDelay: "1s" }}>
          <Sparkles className="w-3 h-3 text-pink-400" />
        </div>

        <div className="relative p-6 pt-8">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Gift className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">
                🎉 You're on the list!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Now unlock <span className="text-violet-500 font-semibold">3 free AI agents</span>
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-muted/50 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="font-medium">Friends invited</span>
              </div>
              <span className="font-bold text-violet-600">{referralCount}/3</span>
            </div>
            <Progress value={progress} className="h-2.5 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {friendsNeeded > 0 ? (
                <>Invite <span className="font-semibold text-foreground">{friendsNeeded} more friend{friendsNeeded !== 1 ? 's' : ''}</span> to unlock your reward!</>
              ) : (
                <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Reward unlocked! 🎉
                </span>
              )}
            </p>
          </div>

          {/* Your Code */}
          <div className="mb-5">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">YOUR REFERRAL CODE</p>
            <div 
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl py-4 px-6 cursor-pointer hover:border-violet-500/40 transition-all group"
            >
              <span className="text-2xl font-mono font-bold tracking-[0.2em] text-foreground">
                {referralCode}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-violet-500/20"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground text-center">SHARE VIA</p>
            <ShareButtons 
              referralCode={referralCode} 
              referralLink={referralLink}
              userName={userName}
            />
          </div>

          {/* Reward Preview */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">3x</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Free AI Agents</p>
                  <p className="text-xs text-muted-foreground">Yours when 3 friends join</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                friendsNeeded === 0 
                  ? "bg-green-500/10 text-green-600" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {friendsNeeded === 0 ? "Unlocked!" : "Locked"}
              </div>
            </div>
          </div>

          {/* Remind Later */}
          <button
            onClick={handleRemindLater}
            className="w-full text-center text-muted-foreground hover:text-foreground text-xs mt-4 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
