import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Lock, Clock, Unlock, ArrowRight } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackWaitlistSignup } from "@/utils/analytics";

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
  const [step1Complete, setStep1Complete] = useState(false);
  const { toast } = useToast();

  const isStep1Valid = name.trim() && email.trim() && industry && position.trim();
  const isStep2Valid = inviteEmail.trim() && inviteEmail.includes("@");

  const handleStep1Continue = () => {
    if (!isStep1Valid) return;
    setStep1Complete(true);
    setTimeout(() => setStep(2), 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) return;

    setIsLoading(true);

    try {
      // Generate the signup id on the client so we don't need a SELECT policy to get it back
      const signupId = crypto.randomUUID();

      // Insert main signup
      const { error: signupError } = await supabase.from("waitlist_signups").insert(
        {
          id: signupId,
          name: name.trim(),
          email: email.trim(),
          company: industry || null,
          use_case: position.trim(),
        },
        { returning: "minimal" },
      );

      if (signupError) throw signupError;

      // Insert invitee email into separate table
      const { error: inviteError } = await supabase.from("waitlist_invites" as any).insert(
        {
          waitlist_signup_id: signupId,
          invitee_email: inviteEmail.trim(),
          inviter_email: email.trim(),
          inviter_name: name.trim(),
        },
        { returning: "minimal" },
      );

      if (inviteError) throw inviteError;

      trackWaitlistSignup(email.trim());

      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll reach out soon with early access details.",
      });

      setTimeout(() => {
        setSubmitted(false);
        setStep(1);
        setStep1Complete(false);
        setName("");
        setEmail("");
        setIndustry("");
        setPosition("");
        setInviteEmail("");
        onOpenChange(false);
      }, 4000);
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
    setStep(1);
    setStep1Complete(false);
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
        className="sm:max-w-[440px] max-w-[92vw] p-0 border border-border bg-background shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden"
      >
        {!submitted ? (
          <div className="relative">
            {/* Progress bar */}
            <div className="h-1 bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>

            <div className="p-4 sm:p-6">
              {/* Step indicator */}
              <div className="flex justify-end mb-3">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted/50 rounded-full">
                  Step {step} of 2
                </span>
              </div>

              {/* Header */}
              <div className="text-center space-y-2 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <ElixaLogo size={16} color="#ffffff" className="sm:w-5" />
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-violet-500 uppercase tracking-wider mb-0.5">
                    Enjoying the Demo?
                  </p>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Be invited to use Elixa in just 2 steps!
                  </h2>
                </div>
              </div>

              {step === 1 && !step1Complete && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
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

                  <Button
                    type="button"
                    onClick={handleStep1Continue}
                    disabled={!isStep1Valid}
                    className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] mt-1 rounded-lg text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-center text-muted-foreground hover:text-foreground text-xs mt-1 transition-colors"
                  >
                    Let me explore first
                  </button>
                </div>
              )}

              {step1Complete && step === 1 && (
                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-semibold text-green-600 mt-2">✓ Step 1 complete</p>
                </div>
              )}

              {step === 2 && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <div className="text-center mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">Unlock access</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Invite one founder to unlock your workspace.</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="inviteEmail" className="text-xs font-medium">
                      Invitee email <span className="text-violet-500">*</span>
                    </Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="founder@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="h-9 rounded-lg border-border focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isStep2Valid}
                    className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-lg text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Elixa
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-center text-muted-foreground hover:text-foreground text-xs mt-1 transition-colors"
                  >
                    Let me explore first
                  </button>

                  {/* Access Status */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Access status
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-600 font-medium">Profile complete</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-muted-foreground">Invite pending</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Workspace locked</span>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-10 px-4 sm:px-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                You've successfully joined the waiting list!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">We'll be in touch very soon.</p>
            </div>

            {/* Final Access Status */}
            <div className="mt-3 pt-3 border-t border-border w-full max-w-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">Profile complete</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">Invite sent</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Unlock className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-violet-600 font-medium">Workspace unlocking soon...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
