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
import { Sparkles, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const industries = [
  "Advertising & Marketing",
  "Aerospace & Defense",
  "Agriculture & Farming",
  "Architecture & Design",
  "Automotive",
  "Banking & Financial Services",
  "Biotechnology",
  "Broadcasting & Media",
  "Chemicals & Materials",
  "Construction & Real Estate",
  "Consulting",
  "Consumer Goods & Retail",
  "Education & Training",
  "Electronics & Hardware",
  "Energy & Utilities",
  "Entertainment & Gaming",
  "Environmental Services",
  "Event Planning & Hospitality",
  "Fashion & Apparel",
  "Food & Beverage",
  "Government & Public Sector",
  "Healthcare & Medical",
  "Human Resources & Recruitment",
  "Information Technology",
  "Insurance",
  "Investment & Venture Capital",
  "Legal Services",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Mining & Metals",
  "Non-Profit & NGO",
  "Oil & Gas",
  "Pharmaceutical",
  "Professional Services",
  "Publishing & Journalism",
  "SaaS & Software",
  "Sports & Fitness",
  "Telecommunications",
  "Travel & Tourism",
  "Transportation",
  "Veterinary & Animal Care",
  "Wholesale & Distribution",
  "Other",
];

export const WaitlistDialog = ({ open, onOpenChange }: WaitlistDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [maxPay, setMaxPay] = useState([35]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isFormValid = name.trim() && email.trim() && industry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          name: name.trim(),
          email: email.trim(),
          company: industry || null,
          use_case: `Max monthly budget: £${maxPay[0]}`,
        });

      if (error) throw error;

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
        setMaxPay([35]);
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
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border border-border/50 bg-background shadow-2xl rounded-2xl">
        {!submitted ? (
          <div className="relative bg-background rounded-2xl overflow-hidden">
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />
            
            <div className="relative p-6">
              <DialogHeader className="space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img src="/elixa-logo.png" alt="Elixa" className="h-14 w-14 object-contain" />
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Get Early Access
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Join the future of AI-powered workspaces
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="mt-6">
                {/* Two column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Industry <span className="text-red-500">*</span>
                    </Label>
                    <Select value={industry} onValueChange={setIndustry} required>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground focus:ring-primary/20">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border max-h-[280px] z-50">
                        {industries.map((ind) => (
                          <SelectItem 
                            key={ind} 
                            value={ind}
                            className="text-foreground focus:bg-primary/10 focus:text-foreground cursor-pointer"
                          >
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Max Monthly Budget
                      </Label>
                      <span className="text-lg font-bold text-primary">£{maxPay[0]}</span>
                    </div>
                    <div className="pt-2 px-1">
                      <Slider
                        value={maxPay}
                        onValueChange={setMaxPay}
                        min={20}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/50"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>£20</span>
                      <span>£50</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                  className="w-full h-12 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] mt-6"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative bg-background rounded-2xl overflow-hidden">
            <div className="relative py-16 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-scale-in">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground">You're In!</h3>
                <p className="text-muted-foreground">
                  We'll be in touch soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};