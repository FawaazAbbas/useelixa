import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, Loader2, Rocket, Users, Zap } from "lucide-react";
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
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-2xl">
        {!submitted ? (
          <div className="relative overflow-hidden">
            {/* Colorful top accent bar */}
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
            
            <div className="p-8">
              {/* Header */}
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-2">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Get Early Access
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Be among the first to experience the future of AI-powered workspaces
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-violet-500" />
                    <span>2,400+ waiting</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Launching Q1 2025</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-violet-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-violet-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-medium">
                      Industry <span className="text-violet-500">*</span>
                    </Label>
                    <Select value={industry} onValueChange={setIndustry} required>
                      <SelectTrigger className="h-11 rounded-xl border-border focus:ring-violet-500/20">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px] z-50">
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind} className="cursor-pointer">
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Max Monthly Budget</Label>
                      <span className="text-lg font-bold text-violet-600">£{maxPay[0]}</span>
                    </div>
                    <div className="pt-1 px-1">
                      <Slider
                        value={maxPay}
                        onValueChange={setMaxPay}
                        min={20}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-500 [&_[role=slider]]:shadow-md"
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
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.01] mt-6 rounded-xl"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Join the Waitlist
                    </>
                  )}
                </Button>
                
                <p className="text-center text-muted-foreground text-xs mt-4">
                  No credit card required. We'll only email you about early access.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="py-16 px-8 flex flex-col items-center justify-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">You're In!</h3>
              <p className="text-muted-foreground">
                We'll be in touch very soon.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};