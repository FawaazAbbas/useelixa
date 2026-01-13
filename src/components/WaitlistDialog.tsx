import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Sparkles, Users } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackWaitlistSignup, trackWaitlistPopupClose } from "@/utils/analytics";
import { ReferralCodeInput } from "@/components/referral/ReferralCodeInput";
import { ReferralShareDialog } from "@/components/referral/ReferralShareDialog";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
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

  const isFormValid = name.trim() && email.trim() && industry && position.trim();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
        if (signupError.code === '23505') {
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

  const handleClose = () => {
    trackWaitlistPopupClose(1);
    onOpenChange(false);
  };

  const handleShareDialogClose = (open: boolean) => {
    setShowShareDialog(open);
    if (!open) {
      // Reset form when share dialog closes
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setIndustry("");
        setPosition("");
        setReferralCode("");
        setUserReferralCode("");
        onOpenChange(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        className="sm:max-w-[440px] max-w-[92vw] p-0 border border-border bg-background shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden"
      >
        {!submitted ? (
          <div className="relative">
            {/* Progress bar */}
            <div className="h-1 bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                style={{ width: "100%" }}
              />
            </div>

            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="text-center space-y-2 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <ElixaLogo size={16} color="#ffffff" className="sm:w-5" />
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-violet-500 uppercase tracking-wider mb-0.5">
                    Enjoying the Demo?
                  </p>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">Be invited to use Elixa now!</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Full name <span className="text-violet-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 rounded-lg border-border focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Contact email <span className="text-violet-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 rounded-lg border-border focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="industry" className="text-xs font-medium">
                    Industry <span className="text-violet-500">*</span>
                  </Label>
                  <Input
                    id="industry"
                    placeholder="Your industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    className="h-9 rounded-lg border-border focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="position" className="text-xs font-medium">
                    Position <span className="text-violet-500">*</span>
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g. CEO, Marketing Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    className="h-9 rounded-lg border-border focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                  />
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
                  className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] mt-1 rounded-lg text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Join Elixa"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-center text-muted-foreground hover:text-foreground text-xs mt-1 transition-colors"
                >
                  Scale your success with Elixa • No credit card required
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Thank you so much for joining!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please feel free to explore the app
              </p>
            </div>

            {/* Waitlist Position */}
            {userWaitlistPosition && (
              <div className="bg-muted/50 rounded-xl p-4 w-full max-w-xs text-center">
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
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/workspace");
                }}
                className="flex-1 h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25"
              >
                Go to Workspace
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/talent-pool");
                }}
                variant="outline"
                className="flex-1 h-10 border-violet-500/30 hover:bg-violet-500/10"
              >
                Explore Talent Pool
              </Button>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShowShareDialog(true)}
              className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1 mt-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Share to move up the queue
            </button>
          </div>
        )}
      </DialogContent>

      {/* Referral Share Dialog */}
      <ReferralShareDialog
        open={showShareDialog}
        onOpenChange={handleShareDialogClose}
        referralCode={userReferralCode}
        userName={name}
        referralCount={0}
        waitlistPosition={userWaitlistPosition}
      />
    </Dialog>
  );
};