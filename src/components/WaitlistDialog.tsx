import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Send, Sparkles, Users } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  trackWaitlistSignup,
  trackWaitlistStep1Complete,
  trackWaitlistStep2Complete,
  trackWaitlistPopupClose,
} from "@/utils/analytics";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupId, setSignupId] = useState<string | null>(null);
  const { toast } = useToast();

  const isStep1Valid = name.trim() && email.trim() && industry && position.trim();
  const isStep2Valid = inviteEmail.trim() && inviteEmail.includes("@");

  const handleStep1Submit = async () => {
    if (!isStep1Valid) return;
    
    setIsLoading(true);
    
    try {
      // Generate the signup id on the client
      const newSignupId = crypto.randomUUID();

      // Insert main signup immediately
      const { error: signupError } = await supabase.from("waitlist_signups").insert([
        {
          id: newSignupId,
          name: name.trim(),
          email: email.trim(),
          company: industry || null,
          use_case: position.trim(),
        },
      ]);

      if (signupError) throw signupError;

      setSignupId(newSignupId);
      trackWaitlistStep1Complete();
      
      // Move to step 2
      setStep(2);
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

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid || !signupId) return;

    setIsLoading(true);

    try {
      // Insert invitee email into separate table
      const { error: inviteError } = await supabase.from("waitlist_invites").insert([
        {
          waitlist_signup_id: signupId,
          invitee_email: inviteEmail.trim(),
          inviter_email: email.trim(),
          inviter_name: name.trim(),
        },
      ]);

      if (inviteError) throw inviteError;

      trackWaitlistSignup(email.trim());
      trackWaitlistStep2Complete();

      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll reach out soon with early access details.",
      });

      setTimeout(() => {
        setSubmitted(false);
        setStep(1);
        setSignupId(null);
        setName("");
        setEmail("");
        setIndustry("");
        setPosition("");
        setInviteEmail("");
        onOpenChange(false);
      }, 4000);
    } catch (error) {
      console.error("Invite error:", error);
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
    trackWaitlistPopupClose(step);
    setStep(1);
    setSignupId(null);
    onOpenChange(false);
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
        className="sm:max-w-[420px] max-w-[92vw] p-0 border-0 bg-background shadow-2xl rounded-2xl overflow-hidden"
      >
        {!submitted ? (
          <div className="relative">
            {/* Gradient header accent */}
            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500" />

            <div className="p-5 sm:p-6">
              {step === 1 ? (
                /* Step 1: Profile */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="text-center space-y-3 mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg shadow-purple-500/30">
                      <ElixaLogo size={20} color="#ffffff" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-foreground">Join Elixa</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Be first to access your AI-powered workspace
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                          Full name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="position" className="text-xs font-medium text-muted-foreground">
                          Position
                        </Label>
                        <Input
                          id="position"
                          placeholder="e.g. CEO"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          required
                          className="h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                        Work email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="industry" className="text-xs font-medium text-muted-foreground">
                        Industry
                      </Label>
                      <Input
                        id="industry"
                        placeholder="e.g. E-commerce, SaaS"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                        className="h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStep1Submit}
                    disabled={!isStep1Valid || isLoading}
                    className="w-full h-11 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl rounded-xl mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Join Elixa
                      </>
                    )}
                  </Button>

                  {/* Trust signals */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      No credit card required
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      Cancel anytime
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-center text-muted-foreground hover:text-foreground text-xs transition-colors pt-1"
                  >
                    Let me explore first
                  </button>
                </div>
              ) : (
                /* Step 2: Invite */
                <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Header */}
                  <div className="text-center space-y-3 mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/30">
                      <Users className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-foreground">Elixa is invite-only</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Invite a founder or decision-maker to unlock your access
                      </p>
                    </div>
                  </div>

                  {/* Invite explanation */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We're building an exclusive community of forward-thinking leaders. 
                      To join, invite someone who would benefit from AI-powered operations.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inviteEmail" className="text-xs font-medium text-muted-foreground">
                      Their email address
                    </Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="founder@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="h-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isStep2Valid}
                    className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invite & Unlock Access
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-center text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    I'll do this later
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="py-10 px-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                You're on the list!
              </h3>
              <p className="text-sm text-muted-foreground">
                We'll notify you when your workspace is ready.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
