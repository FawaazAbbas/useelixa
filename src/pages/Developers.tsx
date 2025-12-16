import { useRef, useState } from "react";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Loader2, 
  X, 
  Sparkles,
  DollarSign, 
  Globe, 
  Zap,
  Users,
  TrendingUp,
  Shield,
  Terminal,
  Code,
  Rocket,
  ChevronRight,
  ArrowRight,
  Layers,
  GitBranch
} from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackDeveloperApplication } from "@/utils/analytics";

const codingLanguages = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "R",
  "Julia",
  "Dart",
  "Lua",
  "Elixir",
  "Haskell",
  "SQL",
];

const aiAgentTools = [
  "LangChain",
  "LlamaIndex",
  "AutoGPT",
  "CrewAI",
  "AutoGen",
  "Semantic Kernel",
  "Haystack",
  "Flowise",
  "Dify",
  "n8n",
  "Make (Integromat)",
  "Zapier AI",
  "OpenAI Assistants API",
  "Claude API",
  "Gemini API",
  "Hugging Face Transformers",
  "Vercel AI SDK",
  "Anthropic Claude",
  "AWS Bedrock",
  "Azure OpenAI",
  "Cohere",
  "Mistral AI",
  "Ollama",
  "LocalAI",
  "Botpress",
  "Rasa",
  "Dialogflow",
  "SuperAGI",
  "AgentGPT",
  "BabyAGI",
];

const Developers = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isFormValid = name.trim() && email.trim() && selectedLanguages.length > 0 && selectedTools.length > 0;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("developer_applications").insert({
        name: name.trim(),
        email: email.trim(),
        skills: selectedLanguages,
        message: `AI Tools: ${selectedTools.join(", ")}`,
      });

      if (error) throw error;

      trackDeveloperApplication();
      setSubmitted(true);
      toast({
        title: "Application Received!",
        description: "We'll review your profile and get back to you.",
      });
    } catch (error) {
      console.error("Developer application error:", error);
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
      title: "70% Revenue Share",
      description: "Industry-leading revenue share. Keep most of what you earn."
    },
    {
      icon: Globe,
      title: "Global Distribution",
      description: "Instant access to thousands of businesses worldwide."
    },
    {
      icon: Zap,
      title: "Powerful SDK",
      description: "Build sophisticated agents with our developer-first tools."
    },
    {
      icon: Shield,
      title: "Enterprise Infrastructure",
      description: "Security, compliance, and scaling handled for you."
    },
    {
      icon: Users,
      title: "Developer Community",
      description: "Join a growing community of AI agent builders."
    },
    {
      icon: TrendingUp,
      title: "Deep Analytics",
      description: "Understand how your agents perform and optimize."
    }
  ];

  const stats = [
    { value: "95+", label: "Agents Live", icon: Layers },
    { value: "2,400+", label: "Businesses Waiting", icon: Users },
    { value: "70%", label: "Revenue Share", icon: DollarSign },
    { value: "$0", label: "Platform Fee", icon: Zap },
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Code pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 backdrop-blur-sm">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Developer Program</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Build AI Agents
              </span>
              <br />
              <span className="text-foreground">That Power Business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Create AI agents that transform how businesses operate. 
              Your innovations, our platform, endless possibilities.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center px-6 py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                  <stat.icon className="w-5 h-5 text-emerald-500 mb-2" />
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="h-14 px-10 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105"
            >
              Apply Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-background via-emerald-500/5 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to income in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Code className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent hidden md:block" style={{ transform: 'translateX(50px)' }} />
              <h3 className="text-xl font-semibold mb-3">1. Build</h3>
              <p className="text-muted-foreground">
                Use our SDK to create powerful AI agents with your unique capabilities and expertise.
              </p>
            </div>
            
            <div className="relative text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent hidden md:block" style={{ transform: 'translateX(50px)' }} />
              <h3 className="text-xl font-semibold mb-3">2. Publish</h3>
              <p className="text-muted-foreground">
                Submit your agent for review and get listed in the Elixa marketplace within 48 hours.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Earn</h3>
              <p className="text-muted-foreground">
                Get paid every time businesses use your agents. 70% revenue share, paid monthly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Build with Elixa?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, deploy, and monetize AI agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Preview Section */}
      <section className="py-24 bg-gradient-to-b from-background via-emerald-500/5 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Developer-First SDK</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Build with tools you already love
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our SDK integrates seamlessly with popular AI frameworks and tools. 
                Write in Python or JavaScript, use any LLM provider, and deploy in minutes.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Python", "TypeScript", "LangChain", "OpenAI", "Claude"].map((tech) => (
                  <Badge key={tech} variant="outline" className="px-3 py-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-slate-900 border-slate-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-sm text-slate-400">agent.py</span>
                </div>
                <CardContent className="p-4">
                  <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                    <code>{`from elixa import Agent, Tool

@agent(
    name="Customer Support",
    capabilities=["email", "chat"]
)
class SupportAgent(Agent):
    @tool
    def resolve_ticket(self, ticket_id):
        # Your logic here
        return self.respond(
            f"Resolved ticket {ticket_id}"
        )

# Deploy with one command
agent.publish()`}</code>
                  </pre>
                </CardContent>
              </Card>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section ref={formRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/90 backdrop-blur-xl border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <CardContent className="p-8 sm:p-10">
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
                      <ElixaLogo size={28} color="#ffffff" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Apply to Join</h2>
                      <p className="text-muted-foreground mt-1">
                        Create AI agents that power thousands of businesses
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name <span className="text-emerald-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-12 rounded-xl border-border bg-background focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-emerald-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 rounded-xl border-border bg-background focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Programming Languages <span className="text-emerald-500">*</span>
                        </Label>
                        {selectedLanguages.length > 0 && (
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {selectedLanguages.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-xl border border-border max-h-[160px] overflow-y-auto">
                        {codingLanguages.map((lang) => (
                          <Badge
                            key={lang}
                            variant="outline"
                            className={cn(
                              "cursor-pointer transition-all text-sm px-3 py-1.5 rounded-lg",
                              selectedLanguages.includes(lang)
                                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                                : "bg-background border-border text-muted-foreground hover:border-emerald-500/30 hover:text-foreground",
                            )}
                            onClick={() => toggleLanguage(lang)}
                          >
                            {lang}
                            {selectedLanguages.includes(lang) && <X className="w-3 h-3 ml-1.5" />}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          AI Tools & Frameworks <span className="text-emerald-500">*</span>
                        </Label>
                        {selectedTools.length > 0 && (
                          <span className="text-xs text-teal-600 font-medium bg-teal-500/10 px-2 py-0.5 rounded-full">
                            {selectedTools.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-xl border border-border max-h-[160px] overflow-y-auto">
                        {aiAgentTools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="outline"
                            className={cn(
                              "cursor-pointer transition-all text-sm px-3 py-1.5 rounded-lg",
                              selectedTools.includes(tool)
                                ? "bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-400"
                                : "bg-background border-border text-muted-foreground hover:border-teal-500/30 hover:text-foreground",
                            )}
                            onClick={() => toggleTool(tool)}
                          >
                            {tool}
                            {selectedTools.includes(tool) && <X className="w-3 h-3 ml-1.5" />}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full h-13 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>

                    <p className="text-center text-muted-foreground text-sm">
                      We review all applications within 48 hours
                    </p>
                  </form>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-scale-in">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Application Received!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      We'll review your profile and reach out within 48 hours with next steps.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/talent-pool'}
                    className="mt-4"
                  >
                    Explore the Marketplace
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

export default Developers;
