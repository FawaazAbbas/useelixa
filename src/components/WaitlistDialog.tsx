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
import { Sparkles, Check, Loader2, Zap } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          name,
          email,
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
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        {!submitted ? (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-violet-500/20 animate-pulse" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/30 rounded-full blur-3xl" />
            
            <div className="relative p-6">
              <DialogHeader className="space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-violet-500 flex items-center justify-center shadow-lg shadow-primary/40 animate-bounce">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Get Early Access
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm">
                  Join the future of AI-powered workspaces
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Industry
                  </Label>
                  <Select value={industry} onValueChange={setIndustry} required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20 [&>span]:text-slate-400 [&[data-state=open]>span]:text-white">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-[280px]">
                      {industries.map((ind) => (
                        <SelectItem 
                          key={ind} 
                          value={ind}
                          className="text-slate-200 focus:bg-primary/20 focus:text-white cursor-pointer"
                        >
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Monthly Budget
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
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/50 [&_.relative]:bg-white/10 [&_[data-orientation=horizontal]>.bg-primary]:bg-gradient-to-r [&_[data-orientation=horizontal]>.bg-primary]:from-primary [&_[data-orientation=horizontal]>.bg-primary]:to-violet-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>£20</span>
                    <span>£50</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !industry}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] mt-2"
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
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-primary/20" />
            <div className="relative py-16 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-scale-in">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">You're In!</h3>
                <p className="text-slate-300">
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