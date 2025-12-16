import { useState } from "react";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code, 
  Rocket, 
  Users, 
  Zap, 
  Check, 
  Loader2, 
  DollarSign, 
  Globe, 
  Sparkles,
  ArrowRight,
  Bot,
  TrendingUp,
  Shield,
  Terminal
} from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackDeveloperApplication } from "@/utils/analytics";

const Developers = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('developer_applications')
        .insert({
          name,
          email,
          skills: skillsArray.length > 0 ? skillsArray : null,
          message: message || null,
        });

      if (error) throw error;

      trackDeveloperApplication();
      setSubmitted(true);
      toast({
        title: "Application Received",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error) {
      console.error('Developer application error:', error);
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
      icon: DollarSign,
      title: "Earn Revenue",
      description: "Get paid every time businesses use your agents. Passive income that scales."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Your agents available to thousands of businesses worldwide from day one."
    },
    {
      icon: Zap,
      title: "Simple SDK",
      description: "Our powerful SDK makes building and deploying agents incredibly fast."
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "Built-in security, compliance, and infrastructure you don't have to worry about."
    },
    {
      icon: Users,
      title: "Community",
      description: "Join a growing community of developers shaping the future of AI work."
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Deep insights into how your agents perform and where to improve."
    }
  ];

  const stats = [
    { value: "95+", label: "Agents Live" },
    { value: "2,400+", label: "Businesses Waiting" },
    { value: "$0", label: "Platform Fee" },
    { value: "70%", label: "Revenue Share" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Terminal className="w-4 h-4" />
              Developer Program
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Build AI Agents
              </span>
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                That Businesses Love
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our developer program and create AI agents that transform how businesses operate. 
              Your innovations, our platform, endless possibilities.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center px-4">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all hover:border-primary/30"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <Code className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Build</h3>
                <p className="text-muted-foreground text-sm">
                  Use our SDK to create powerful AI agents with your unique capabilities and expertise.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <Rocket className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Publish</h3>
                <p className="text-muted-foreground text-sm">
                  Submit your agent for review and get listed in the Elixa marketplace.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <DollarSign className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Earn</h3>
                <p className="text-muted-foreground text-sm">
                  Get paid every time businesses use your agents. 70% revenue share, paid monthly.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30 mx-auto mb-4">
                <ElixaLogo size={24} color="#ffffff" />
              </div>
              <CardTitle className="text-2xl">Apply to Join</CardTitle>
              <CardDescription>
                Tell us about yourself and what you'd like to build
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-primary">*</span></Label>
                      <Input
                        id="name"
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-primary">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-11 rounded-xl bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio/GitHub URL</Label>
                      <Input
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://github.com/username"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="h-11 rounded-xl bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger className="h-11 rounded-xl bg-background/50">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      placeholder="Python, TypeScript, AI/ML, APIs"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="h-11 rounded-xl bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">What would you like to build?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about the AI agents you'd like to create and how they could help businesses..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background/50 min-h-[120px] resize-none rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !name || !email}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    We review all applications and will get back to you within 5 business days.
                  </p>
                </form>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scale-in">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Application Received!</h3>
                    <p className="text-muted-foreground">
                      Thank you for your interest. We'll review your application and reach out soon.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                    <Sparkles className="w-4 h-4" />
                    Welcome to the Elixa developer community
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Developers;