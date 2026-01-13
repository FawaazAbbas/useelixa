import { useState, useEffect } from "react";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralStatsCards } from "@/components/referral/ReferralStatsCards";
import { InvitedFriendsList } from "@/components/referral/InvitedFriendsList";
import { ShareButtons } from "@/components/referral/ShareButtons";
import { EmailInviteForm } from "@/components/referral/EmailInviteForm";
import { RewardCelebration } from "@/components/referral/RewardCelebration";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { Search, Gift, Sparkles, Users, Trophy, Mail, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/utils/analytics";

interface ReferralStats {
  referral_code: string;
  referral_count: number;
  invites_sent: number;
  reward_unlocked: boolean;
  waitlist_position: number | null;
  invites: Array<{
    email: string;
    status: string;
    created_at: string;
    converted_at?: string;
  }> | null;
  referred_signups: Array<{
    name: string;
    email: string;
    created_at: string;
  }> | null;
}

const Referral = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousRewardStatus, setPreviousRewardStatus] = useState(false);
  const { toast } = useToast();

  // Check for email in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      handleLookup(emailParam);
    }
  }, []);

  const handleLookup = async (lookupEmail?: string) => {
    const emailToLookup = lookupEmail || email;
    if (!emailToLookup.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    trackEvent({ action: "referral_dashboard_lookup", category: "engagement", label: emailToLookup.split("@")[1] });

    try {
      // Fetch referral stats
      const { data, error } = await supabase.rpc("get_referral_stats", {
        user_email: emailToLookup.trim().toLowerCase(),
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'referral_code' in data) {
        const statsData = data as unknown as ReferralStats;
        setStats(statsData);
        
        // Check if reward was just unlocked (compare with previous state)
        if (statsData.reward_unlocked && !previousRewardStatus && searched) {
          setShowCelebration(true);
        }
        setPreviousRewardStatus(statsData.reward_unlocked);
        
        // Fetch user name and waitlist position for display
        const { data: userData } = await supabase
          .from("waitlist_signups")
          .select("name, waitlist_position")
          .eq("email", emailToLookup.trim().toLowerCase())
          .single();
        
        if (userData) {
          setUserName(userData.name);
          // Update stats with waitlist position from DB
          setStats(prev => prev ? { ...prev, waitlist_position: userData.waitlist_position } : prev);
        }
      } else {
        setStats(null);
        toast({
          title: "Not found",
          description: "This email isn't on our waitlist yet. Sign up first!",
        });
      }
    } catch (err) {
      console.error("Lookup error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = stats ? `https://elixa.app/signup?ref=${stats.referral_code}` : "";

  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />
      <RewardCelebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background" />
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-purple-500/15 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Gift className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Referral Program
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Invite Friends,
            </span>
            <br />
            <span className="text-foreground">Get Rewarded</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Refer 3 friends to the waitlist and unlock <span className="text-violet-500 font-semibold">3 free AI agents</span> when Elixa launches!
          </p>

          {/* Lookup Form */}
          <Card className="max-w-md mx-auto bg-card/95 backdrop-blur-xl border-violet-500/20">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Enter your email to view your referral dashboard
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                      className="h-11"
                    />
                    <Button
                      onClick={() => handleLookup()}
                      disabled={loading}
                      className="h-11 px-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Look Up
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats & Dashboard */}
      {stats && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Waitlist Position Card */}
            {stats.waitlist_position && (
              <Card className="p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 border-violet-500/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Waitlist Position</p>
                      <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                        #{stats.waitlist_position.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground">
                      Each referral <span className="text-violet-500 font-semibold">halves</span> your position!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Move up faster by inviting friends
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Stats Cards */}
            <ReferralStatsCards
              referralCode={stats.referral_code}
              referralCount={stats.referral_count}
              rewardUnlocked={stats.reward_unlocked}
            />

            {/* Share & Invite Section */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <h3 className="text-lg font-semibold">Share & Invite</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your unique link with friends. When they join, you both benefit!
                </p>
                
                {/* Referral Link Display */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">YOUR REFERRAL LINK</p>
                  <p className="font-mono text-sm break-all text-foreground">{referralLink}</p>
                </div>
                
                {/* Share Buttons */}
                <ShareButtons
                  referralCode={stats.referral_code}
                  referralLink={referralLink}
                  userName={userName}
                />
                
                {/* Email Invite Form */}
                <div className="border-t pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-violet-500" />
                    <h4 className="text-sm font-medium">Invite by Email</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter your friend's email and we'll send them a personalized invite with your code.
                  </p>
                  <EmailInviteForm
                    inviterEmail={email}
                    inviterName={userName}
                    referralCode={stats.referral_code}
                  />
                </div>
              </div>
            </Card>

            {/* Friends List */}
            <InvitedFriendsList
              invites={stats.invites || []}
              referredSignups={stats.referred_signups || []}
            />

            {/* Rewards Section - Mobile Friendly */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold mb-1">Your Rewards</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Complete milestones to unlock exclusive rewards
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className={`p-3 sm:p-4 rounded-lg border ${stats.reward_unlocked ? "bg-green-500/10 border-green-500/30" : "bg-muted/30 border-border"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl sm:text-2xl">🤖</span>
                        <span className="font-semibold text-sm sm:text-base">3 Free AI Agents</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Refer 3 friends to unlock</p>
                      <div className={`mt-2 text-xs font-medium ${stats.reward_unlocked ? "text-green-600" : "text-muted-foreground"}`}>
                        {stats.reward_unlocked ? "✓ Unlocked!" : `${stats.referral_count}/3 referrals`}
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-lg border ${stats.referral_count >= 10 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-muted/30 border-border"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl sm:text-2xl">👑</span>
                        <span className="font-semibold text-sm sm:text-base">Free For Life</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Refer 10 friends to unlock</p>
                      <div className={`mt-2 text-xs font-medium ${stats.referral_count >= 10 ? "text-yellow-600" : "text-muted-foreground"}`}>
                        {stats.referral_count >= 10 ? "✓ Unlocked!" : `${stats.referral_count}/10 referrals`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Not Found State */}
      {searched && !stats && !loading && (
        <section className="py-12 px-4 text-center">
          <div className="max-w-md mx-auto">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Not on the waitlist yet?</h3>
            <p className="text-muted-foreground mb-4">
              Join the Elixa waitlist to get your own referral code and start earning rewards!
            </p>
            <Button
              onClick={() => window.location.href = "/signup"}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              Join the Waitlist
            </Button>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-500">1</span>
              </div>
              <h3 className="font-semibold mb-2">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Get your unique referral code and share it with friends via email, social media, or messaging.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-500">2</span>
              </div>
              <h3 className="font-semibold mb-2">Friends Join Waitlist</h3>
              <p className="text-sm text-muted-foreground">
                When your friends sign up using your code, they're added to the waitlist and you get credit.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-500">3</span>
              </div>
              <h3 className="font-semibold mb-2">Unlock Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Reach milestones to unlock rewards: 3 referrals = 3 free agents, 10 referrals = free lifetime account!
              </p>
            </div>
          </div>
        </div>
      </section>

      <TalentPoolFooter hideTopSpacing />
    </div>
  );
};

export default Referral;
