import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, Users, Gift, Trophy } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/utils/analytics";

interface ReferralStatsCardsProps {
  referralCode: string;
  referralCount: number;
  rewardUnlocked: boolean;
}

export const ReferralStatsCards = ({
  referralCode,
  referralCount,
  rewardUnlocked,
}: ReferralStatsCardsProps) => {
  const [copied, setCopied] = useState(false);
  const progress = Math.min((referralCount / 3) * 100, 100);
  const friendsNeeded = Math.max(3 - referralCount, 0);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      trackEvent({ action: "referral_code_copied", category: "engagement", label: "dashboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Your Code Card */}
      <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="w-4 h-4 text-violet-500" />
            <span>Your Referral Code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold tracking-wider text-foreground">
              {referralCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-violet-500/20"
              onClick={handleCopyCode}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-violet-500" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this code with friends
          </p>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-violet-500" />
              <span>Friends Invited</span>
            </div>
            <span className="text-lg font-bold text-violet-600">{referralCount}/3</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {friendsNeeded > 0 ? (
              <>{friendsNeeded} more to unlock your reward</>
            ) : (
              <span className="text-green-600 font-medium">All friends invited! 🎉</span>
            )}
          </p>
        </div>
      </Card>

      {/* Status Card */}
      <Card className={`p-5 ${rewardUnlocked ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20" : ""}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-violet-500" />
            <span>Reward Status</span>
          </div>
          {rewardUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">Unlocked!</span>
              <span className="text-2xl">🎉</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-muted-foreground">Locked</span>
              <span className="text-lg">🔒</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {rewardUnlocked ? "3 free AI agents ready!" : "3 free AI agents when unlocked"}
          </p>
        </div>
      </Card>
    </div>
  );
};
