import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Unlock } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackWaitlistSignup, trackWaitlistPopupClose } from "@/utils/analytics";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isFormValid = name.trim() && email.trim() && industry && position.trim();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    
    try {
      const { error: signupError } = await supabase.from("waitlist_signups").insert([
        {
          name: name.trim(),
          email: email.trim(),
          company: industry || null,
          use_case: position.trim(),
        },
      ]);

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
      
      trackWaitlistSignup(email.trim());
      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll reach out soon with early access details.",
      });

      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setIndustry("");
        setPosition("");
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
    trackWaitlistPopupClose(1);
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