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
  Rocket
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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-500/5">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
              <Terminal className="w-4 h-4" />
              Developer Program
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Build with Elixa
              </span>
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Power Thousands of Businesses
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create AI agents that transform how businesses operate. 
              Your innovations, our platform, endless possibilities.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center px-4">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 text-base px-8"
            >
              Apply Now
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all hover:border-emerald-500/30"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 border border-emerald-500/20">
                    <benefit.icon className="w-6 h-6 text-emerald-500" />
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Build</h3>
                <p className="text-muted-foreground text-sm">
                  Use our SDK to create powerful AI agents with your unique capabilities and expertise.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Publish</h3>
                <p className="text-muted-foreground text-sm">
                  Submit your agent for review and get listed in the Elixa marketplace.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Earn</h3>
                <p className="text-muted-foreground text-sm">
                  Get paid every time businesses use your agents. 70% revenue share, paid monthly.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div ref={formRef} className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-xl border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <CardContent className="p-6 sm:p-8">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="text-center space-y-3 mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                        <ElixaLogo size={28} color="#ffffff" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Apply to Join</h2>
                        <p className="text-muted-foreground">
                          Create AI agents that power thousands of businesses worldwide
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            className="h-11 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500/20"
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
                            className="h-11 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Languages <span className="text-emerald-500">*</span>
                            </Label>
                            {selectedLanguages.length > 0 && (
                              <span className="text-xs text-emerald-600 font-medium">
                                {selectedLanguages.length} selected
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl border border-border max-h-[180px] overflow-y-auto">
                            {codingLanguages.map((lang) => (
                              <Badge
                                key={lang}
                                variant="outline"
                                className={cn(
                                  "cursor-pointer transition-all text-xs px-2.5 py-1 rounded-lg",
                                  selectedLanguages.includes(lang)
                                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                                    : "bg-background border-border text-muted-foreground hover:border-emerald-500/30 hover:text-foreground",
                                )}
                                onClick={() => toggleLanguage(lang)}
                              >
                                {lang}
                                {selectedLanguages.includes(lang) && <X className="w-3 h-3 ml-1" />}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              AI Tools <span className="text-emerald-500">*</span>
                            </Label>
                            {selectedTools.length > 0 && (
                              <span className="text-xs text-teal-600 font-medium">{selectedTools.length} selected</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl border border-border max-h-[180px] overflow-y-auto">
                            {aiAgentTools.map((tool) => (
                              <Badge
                                key={tool}
                                variant="outline"
                                className={cn(
                                  "cursor-pointer transition-all text-xs px-2.5 py-1 rounded-lg",
                                  selectedTools.includes(tool)
                                    ? "bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-400"
                                    : "bg-background border-border text-muted-foreground hover:border-teal-500/30 hover:text-foreground",
                                )}
                                onClick={() => toggleTool(tool)}
                              >
                                {tool}
                                {selectedTools.includes(tool) && <X className="w-3 h-3 ml-1" />}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.01] rounded-xl"
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

                      <p className="text-center text-muted-foreground text-xs">
                        We review all applications within 48 hours.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-scale-in">
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">Application Sent!</h3>
                      <p className="text-muted-foreground">We'll review and be in touch soon.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm">
                      <Sparkles className="w-4 h-4" />
                      Welcome to the Elixa developer community
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Developers;