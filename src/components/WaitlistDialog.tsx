import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, Loader2, Rocket, Users, Zap, Crown } from "lucide-react";
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl rounded-3xl">
        {!submitted ? (
          <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 rounded-3xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
            </div>
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            <div className="relative p-8">
              {/* Header */}
              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  Limited Early Access
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Be First in Line
                  </h2>
                  <p className="text-white/60 text-base max-w-md mx-auto">
                    Join the pioneers shaping the future of AI-powered workspaces
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">2,400+ waiting</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Launching Q1 2025</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Two column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-white/80">
                      Name <span className="text-pink-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/20 h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-white/80">
                      Email <span className="text-pink-400">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/20 h-12 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-medium text-white/80">
                      Industry <span className="text-pink-400">*</span>
                    </Label>
                    <Select value={industry} onValueChange={setIndustry} required>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-purple-400/20 h-12 rounded-xl [&>span]:text-white/60 data-[state=open]:border-purple-400">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20 max-h-[280px] z-50">
                        {industries.map((ind) => (
                          <SelectItem 
                            key={ind} 
                            value={ind}
                            className="text-white focus:bg-purple-500/20 focus:text-white cursor-pointer"
                          >
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white/80">
                        Max Monthly Budget
                      </Label>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">£{maxPay[0]}</span>
                    </div>
                    <div className="pt-1 px-1">
                      <Slider
                        value={maxPay}
                        onValueChange={setMaxPay}
                        min={20}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-purple-500 [&_.bg-primary]:to-pink-500"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>£20</span>
                      <span>£50</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                  className="w-full h-14 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-400 hover:via-violet-400 hover:to-pink-400 text-white font-semibold shadow-2xl shadow-purple-500/40 transition-all hover:shadow-purple-500/60 hover:scale-[1.02] mt-8 rounded-xl text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Secure My Spot
                    </>
                  )}
                </Button>
                
                <p className="text-center text-white/40 text-xs mt-4">
                  No credit card required. We'll only email you about early access.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-slate-900 via-green-900/50 to-slate-900 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
            </div>
            
            <div className="relative py-20 px-8 flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50 animate-scale-in">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-white">You're In!</h3>
                <p className="text-white/60 text-lg">
                  We'll be in touch very soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};