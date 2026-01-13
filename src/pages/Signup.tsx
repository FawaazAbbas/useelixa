import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, Users, Bot, Sparkles } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackWaitlistSignup } from "@/utils/analytics";
import { ReferralCodeInput } from "@/components/referral/ReferralCodeInput";
import { ReferralShareDialog } from "@/components/referral/ReferralShareDialog";

const Waitlist = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState("");
  const [userWaitlistPosition, setUserWaitlistPosition] = useState<number | null>(null);
  const { toast } = useToast();

  // Check URL for ref param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  const isFormValid = name.trim() && email.trim() && industry.trim() && position.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);

    try {
      const insertData: {
        name: string;
        email: string;
        company: string | null;
        use_case: string;
        referred_by_code?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
        company: industry || null,
        use_case: position.trim(),
      };

      // Add referral code if valid
      if (referralCode.trim() && isReferralValid) {
        insertData.referred_by_code = referralCode.trim().toUpperCase();
      }

      const { data: signupData, error: signupError } = await supabase
        .from("waitlist_signups")
        .insert([insertData])
        .select("referral_code, waitlist_position")
        .single();

      if (signupError) {
        // Check for duplicate email error (unique constraint violation)
        if (signupError.code === "23505") {
          toast({
            title: "Already on the list!",
            description: "This email is already registered for early access.",
          });
          setIsLoading(false);
          return;
        }
        throw signupError;
      }

      // Sync to EmailOctopus with waitlist position (fire-and-forget)
      supabase.functions.invoke("sync-emailoctopus", {
        body: {
          email: email.trim(),
          name: name.trim(),
          company: industry || undefined,
          position: position.trim(),
          referral_code: signupData?.referral_code,
          referred_by_code: referralCode.trim() && isReferralValid ? referralCode.trim().toUpperCase() : undefined,
          waitlist_position: signupData?.waitlist_position,
          referral_count: 0,
        },
      }).then(({ error }) => {
        if (error) console.error("EmailOctopus sync error:", error);
        else console.log("Successfully synced to EmailOctopus");
      });

      // If this signup used a referral code, update the referrer's EmailOctopus data
      if (referralCode.trim() && isReferralValid) {
        const referrerCode = referralCode.trim().toUpperCase();
        // Fetch the referrer's updated data
        supabase
          .from("waitlist_signups")
          .select("email, waitlist_position, referral_count")
          .eq("referral_code", referrerCode)
          .single()
          .then(({ data: referrerData, error: referrerError }) => {
            if (referrerError) {
              console.error("Error fetching referrer data:", referrerError);
              return;
            }
            if (referrerData) {
              // Update referrer's EmailOctopus with new position and milestone tags
              supabase.functions.invoke("update-waitlist-position", {
                body: {
                  email: referrerData.email,
                  waitlist_position: referrerData.waitlist_position,
                  referral_count: referrerData.referral_count,
                },
              }).then(({ error }) => {
                if (error) console.error("Error updating referrer in EmailOctopus:", error);
                else console.log("Successfully updated referrer in EmailOctopus");
              });
            }
          });
      }

      trackWaitlistSignup(email.trim());
      
      // Store the user's referral code and position
      if (signupData?.referral_code) {
        setUserReferralCode(signupData.referral_code);
      }
      if (signupData?.waitlist_position) {
        setUserWaitlistPosition(signupData.waitlist_position);
      }
      
      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll reach out soon with early access details.",
      });
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />

      {/* Main Section - Hero + Form integrated */}
      <section className="relative pt-20 sm:pt-24 pb-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background" />
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-purple-500/15 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Content */}
            <div className="text-center lg:text-left pt-4 lg:pt-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                  Limited Early Access
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                  The Team That
                </span>
                <br />
                <span className="text-foreground">Never Sleeps</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
                Join thousands waiting to transform their operations with AI employees that actually get work done.
              </p>

              {/* Stats - horizontal on mobile */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-6 lg:mb-0">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span className="font-medium">2,400+ waiting</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="font-medium">95+ agents</span>
                </div>
              </div>
            </div>

            {/* Right: Form Card - integrated, not separate */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="bg-card/95 backdrop-blur-xl border-violet-500/20 shadow-2xl shadow-violet-500/10 overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                    style={{ width: "100%" }}
                  />
                </div>

                <CardContent className="p-5 sm:p-6">
                  {!submitted ? (
                    <>
                      {/* Header */}
                      <div className="text-center space-y-3 mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                          <ElixaLogo size={22} color="#ffffff" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-foreground">Join the Waitlist</h2>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium">
                              Full name <span className="text-violet-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder="Your full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="h-10 rounded-lg border-border bg-background text-sm focus:border-violet-500 focus:ring-violet-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium">
                              Email <span className="text-violet-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@company.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-10 rounded-lg border-border bg-background text-sm focus:border-violet-500 focus:ring-violet-500/20"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="industry" className="text-xs font-medium">
                                Industry <span className="text-violet-500">*</span>
                              </Label>
                              <Input
                                id="industry"
                                placeholder="e.g. Tech"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                required
                                className="h-10 rounded-lg border-border bg-background text-sm focus:border-violet-500 focus:ring-violet-500/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="position" className="text-xs font-medium">
                                Position <span className="text-violet-500">*</span>
                              </Label>
                              <Input
                                id="position"
                                placeholder="e.g. CEO"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                required
                                className="h-10 rounded-lg border-border bg-background text-sm focus:border-violet-500 focus:ring-violet-500/20"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Referral Code Input */}
                        <ReferralCodeInput
                          value={referralCode}
                          onChange={setReferralCode}
                          onValidChange={(valid) => setIsReferralValid(valid)}
                        />

                        <Button
                          type="submit"
                          disabled={!isFormValid || isLoading}
                          className="w-full h-11 text-sm bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl rounded-lg"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Elixa"}
                        </Button>

                        <p className="text-center text-muted-foreground text-[10px]">
                          No credit card required • Free forever
                        </p>
                      </form>
                    </>
                  ) : (
                    <div className="text-center py-6 animate-in fade-in duration-500">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Thank you so much for joining!</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Please feel free to explore the app
                      </p>
                      
                      {/* Waitlist Position */}
                      {userWaitlistPosition && (
                        <div className="bg-muted/50 rounded-xl p-4 mb-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-violet-500" />
                            <span className="text-xs font-medium text-muted-foreground">Your position</span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            #{userWaitlistPosition.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Sparkles className="w-3 h-3 inline mr-1 text-violet-500" />
                            Invite friends to move up!
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => navigate("/workspace")}
                          className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25"
                        >
                          Go to Workspace
                        </Button>
                        <Button
                          onClick={() => navigate("/talent-pool")}
                          variant="outline"
                          className="w-full h-10 border-violet-500/30 hover:bg-violet-500/10"
                        >
                          Explore Talent Pool
                        </Button>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={() => setShowShareDialog(true)}
                        className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center justify-center gap-1 mt-4 mx-auto transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        Share to move up the queue
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <TalentPoolFooter hideTopSpacing />

      {/* Referral Share Dialog */}
      <ReferralShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        referralCode={userReferralCode}
        userName={name}
        referralCount={0}
        waitlistPosition={userWaitlistPosition}
      />
    </div>
  );
};

export default Waitlist;
