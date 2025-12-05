import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          name,
          email,
          company: company || null,
          use_case: useCase || null,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll reach out soon with early access details.",
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setCompany("");
        setUseCase("");
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error('Waitlist signup error:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-2xl shadow-primary/10">
        {!submitted ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 animate-scale-in">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Get Your Own Elixa
              </DialogTitle>
              <DialogDescription className="text-center text-base text-muted-foreground">
                Join the waitlist for early access to Elixa—your AI-powered workspace
                that brings intelligent agents to life.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-sm font-medium">
                  How would you use Elixa?
                </Label>
                <Textarea
                  id="useCase"
                  placeholder="Tell us about your ideal use case..."
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors min-h-[100px] resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Joining..." : "Join the Waitlist"}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                We'll never share your information. Early access spots are limited.
              </p>
            </form>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 animate-scale-in">
              <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">You're In!</h3>
              <p className="text-muted-foreground">
                Welcome to the future of AI workspaces. Check your email soon.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
