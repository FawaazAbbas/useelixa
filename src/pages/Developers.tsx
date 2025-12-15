import { useState } from "react";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Rocket, Users, Zap, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          company: company || null,
          portfolio_url: portfolioUrl || null,
          experience_level: experienceLevel || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
          message: message || null,
        });

      if (error) throw error;

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
      icon: Code,
      title: "Build AI Agents",
      description: "Create powerful AI agents that help businesses automate their workflows"
    },
    {
      icon: Users,
      title: "Reach Thousands",
      description: "Get your agents in front of businesses looking for AI solutions"
    },
    {
      icon: Zap,
      title: "Easy Integration",
      description: "Our SDK and APIs make it simple to build and deploy agents"
    },
    {
      icon: Rocket,
      title: "Grow Together",
      description: "Join a community of developers shaping the future of AI work"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              Developer Program
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Build the Future of AI Work
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our developer program and create AI agents that transform how businesses operate.
              Your innovations, our platform, endless possibilities.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Form */}
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Apply to Join</CardTitle>
              <CardDescription>
                Tell us about yourself and what you'd like to build
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
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
                        className="bg-background/50"
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
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger className="bg-background/50">
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
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">What would you like to build?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about the AI agents you'd like to create and how they could help businesses..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background/50 min-h-[120px] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Application Received</h3>
                    <p className="text-muted-foreground">
                      Thank you for your interest. We'll review your application and reach out soon.
                    </p>
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