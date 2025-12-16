import { useState, useRef } from "react";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  Loader2, 
  Lock, 
  ArrowRight, 
  Unlock, 
  Sparkles, 
  Users, 
  Zap, 
  Clock,
  Bot,
  TrendingUp,
  Shield
} from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  trackWaitlistSignup,
  trackWaitlistStep1Complete,
  trackWaitlistStep2Complete,
} from "@/utils/analytics";

const Waitlist = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Complete, setStep1Complete] = useState(false);
  const [currentSignupId, setCurrentSignupId] = useState<string | null>(null);
  const { toast } = useToast();

  const isStep1Valid = name.trim() && email.trim() && industry.trim() && position.trim();
  const isStep2Valid = inviteEmail.trim() && inviteEmail.includes("@");

  const handleStep1Continue = async () => {
    if (!isStep1Valid) return;
    setIsLoading(true);
    
    try {
      const signupId = crypto.randomUUID();
      setCurrentSignupId(signupId);
      
      const { error: signupError } = await supabase.from("waitlist_signups").insert([
        {
          id: signupId,
          name: name.trim(),
          email: email.trim(),
          company: industry || null,
          use_case: position.trim(),
        },
      ]);

      if (signupError) throw signupError;
      
      trackWaitlistStep1Complete();
      setStep1Complete(true);
      setTimeout(() => setStep(2), 400);
    } catch (error) {
      console.error("Step 1 signup error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid || !currentSignupId) return;

    setIsLoading(true);

    try {
      const { error: inviteError } = await supabase.from("waitlist_invites").insert([
        {
          waitlist_signup_id: currentSignupId,
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

  const benefits = [
    {
      icon: Bot,
      title: "95+ AI Agents",
      description: "Access a growing library of specialized AI agents ready to join your team"
    },
    {
      icon: Clock,
      title: "24/7 Productivity",
      description: "Your AI team works around the clock, never taking breaks or vacations"
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "Get agents working in minutes, not weeks of training and onboarding"
    },
    {
      icon: TrendingUp,
      title: "Scale Infinitely",
      description: "Add capacity instantly without the overhead of traditional hiring"
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "Built with security and compliance at the core for business use"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "AI agents work alongside your human team seamlessly"
    }
  ];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-500/5">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6 border border-violet-500/20">
              <Sparkles className="w-4 h-4" />
              Limited Early Access
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                The Team That
              </span>
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Never Sleeps
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of forward-thinking businesses waiting to transform their operations 
              with AI employees that actually get work done.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">2,400+ waiting</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Bot className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">95+ agents ready</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Launching Q1 2025</span>
              </div>
            </div>

            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 text-base px-8"
            >
              Get Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all hover:border-violet-500/30"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-violet-500/20">
                    <benefit.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Signup Form */}
          <div ref={formRef} className="max-w-lg mx-auto">
            <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20 shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                  style={{ width: submitted ? "100%" : step === 1 ? "50%" : "75%" }}
                />
              </div>

              <CardContent className="p-6 sm:p-8">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="text-center space-y-3 mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                        <ElixaLogo size={24} color="#ffffff" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          {step === 1 ? "Join the Waitlist" : "One More Step"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {step === 1 
                            ? "Be among the first to access Elixa" 
                            : "Invite someone to unlock your spot"
                          }
                        </p>
                      </div>
                    </div>

                    {step === 1 && !step1Complete && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                              Full name <span className="text-violet-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder="Your full name"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="industry" className="text-sm font-medium">
                              Industry <span className="text-violet-500">*</span>
                            </Label>
                            <Input
                              id="industry"
                              placeholder="e.g. E-commerce, SaaS"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              required
                              className="h-11 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position" className="text-sm font-medium">
                              Position <span className="text-violet-500">*</span>
                            </Label>
                            <Input
                              id="position"
                              placeholder="e.g. CEO, Manager"
                              value={position}
                              onChange={(e) => setPosition(e.target.value)}
                              required
                              className="h-11 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500/20"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleStep1Continue}
                          disabled={!isStep1Valid || isLoading}
                          className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {step1Complete && step === 1 && (
                      <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
                          <Check className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>
                        <p className="text-base font-semibold text-green-600 mt-3">Step 1 complete!</p>
                      </div>
                    )}

                    {step === 2 && (
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
                      >
                        <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-amber-600" />
                            <h3 className="text-base font-semibold text-foreground">Elixa is invite-only</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To secure your spot, invite someone who would benefit from Elixa. Pay it forward!
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail" className="text-sm font-medium">
                            Invite a colleague or friend <span className="text-violet-500">*</span>
                          </Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            className="h-11 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            They'll receive an invite to join the waitlist too
                          </p>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading || !isStep2Valid}
                          className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Send Invite & Join Waitlist
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scale-in">
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        You're on the list!
                      </h3>
                      <p className="text-muted-foreground">
                        We'll be in touch soon with early access details.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border w-full max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Profile complete</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Invite sent</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Unlock className="w-4 h-4 text-violet-500" />
                          <span className="text-violet-600 font-medium">Workspace unlocking soon...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              No credit card required • Free to join • Cancel anytime
            </p>
          </div>
        </div>
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Waitlist;