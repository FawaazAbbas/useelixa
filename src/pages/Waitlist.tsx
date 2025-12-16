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
  Sparkles, 
  Users, 
  Zap, 
  Clock,
  Bot,
  TrendingUp,
  Shield,
  ChevronRight,
  Star
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

  const testimonials = [
    {
      quote: "This is the future of how teams will operate. Can't wait to get access.",
      author: "Sarah Chen",
      role: "VP Engineering, TechCorp"
    },
    {
      quote: "Finally, AI that actually fits into our existing workflows.",
      author: "Marcus Johnson",
      role: "COO, ScaleUp Inc"
    },
    {
      quote: "The demo alone shows incredible potential for our customer service.",
      author: "Elena Rodriguez",
      role: "Director of CX, RetailGiant"
    }
  ];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <TalentPoolNavbar showSearch={false} />
      
      {/* Hero Section with Animated Background */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Limited Early Access</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                The Team That
              </span>
              <br />
              <span className="text-foreground">Never Sleeps</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Join thousands of forward-thinking businesses waiting to transform their operations 
              with AI employees that actually get work done.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                <Users className="w-5 h-5 text-violet-500" />
                <span className="text-base font-semibold">2,400+ waiting</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                <Bot className="w-5 h-5 text-violet-500" />
                <span className="text-base font-semibold">95+ agents ready</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span className="text-base font-semibold">Launching Q1 2025</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="h-14 px-10 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all hover:scale-105"
            >
              Get Early Access
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join the Waitlist?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Be among the first to experience the future of work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-5 border border-violet-500/20 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-background via-violet-500/5 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Are Saying</h2>
            <p className="text-lg text-muted-foreground">Early feedback from our preview users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section ref={formRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/90 backdrop-blur-xl border-violet-500/20 shadow-2xl shadow-violet-500/10 overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                style={{ width: submitted ? "100%" : step === 1 ? "50%" : "75%" }}
              />
            </div>

            <CardContent className="p-8 sm:p-10">
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30">
                      <ElixaLogo size={28} color="#ffffff" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">
                        {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                      </p>
                      <h2 className="text-2xl font-bold text-foreground">
                        {step === 1 ? "Join the Elixa Waitlist" : "Almost There!"}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {step === 1 ? "Be among the first to get access" : "Invite someone to complete your application"}
                      </p>
                    </div>
                  </div>

                  {step === 1 && !step1Complete && (
                    <div className="space-y-5 animate-in fade-in duration-300">
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
                            className="h-12 rounded-xl border-border bg-background focus:border-violet-500 focus:ring-violet-500/20"
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
                            className="h-12 rounded-xl border-border bg-background focus:border-violet-500 focus:ring-violet-500/20"
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
                            placeholder="Your industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            required
                            className="h-12 rounded-xl border-border bg-background focus:border-violet-500 focus:ring-violet-500/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position" className="text-sm font-medium">
                            Position <span className="text-violet-500">*</span>
                          </Label>
                          <Input
                            id="position"
                            placeholder="e.g. CEO, Marketing Manager"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required
                            className="h-12 rounded-xl border-border bg-background focus:border-violet-500 focus:ring-violet-500/20"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleStep1Continue}
                        disabled={!isStep1Valid || isLoading}
                        className="w-full h-13 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
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

                      <p className="text-center text-muted-foreground text-xs">
                        No credit card required • Free forever
                      </p>
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
                      className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                      <div className="text-center p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-amber-600" />
                          <h3 className="text-base font-semibold text-foreground">Elixa is invite-only</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To be invited, you must invite someone else. Pay it forward!
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail" className="text-sm font-medium">
                          Who would benefit from Elixa? <span className="text-violet-500">*</span>
                        </Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          className="h-12 rounded-xl border-border bg-background focus:border-violet-500 focus:ring-violet-500/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          They'll receive an invite to join the waitlist too
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || !isStep2Valid}
                        className="w-full h-13 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Complete & Join Waitlist
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scale-in">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      You're on the list!
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      We'll reach out soon with early access details. Keep an eye on your inbox!
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/talent-pool'}
                    className="mt-4"
                  >
                    Explore the Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <TalentPoolFooter />
    </div>
  );
};

export default Waitlist;
