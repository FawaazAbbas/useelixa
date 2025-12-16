import { useState } from "react";
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
  DollarSign, 
  Globe, 
  Zap,
  Users,
  Terminal,
  Layers
} from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackDeveloperApplication } from "@/utils/analytics";

const codingLanguages = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "Ruby", "PHP", "Swift"
];

const aiAgentTools = [
  "LangChain", "OpenAI API", "Claude API", "AutoGPT", "CrewAI", "n8n", "Vercel AI SDK", "Hugging Face"
];

const Developers = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />
      
      {/* Main Section - Hero + Form integrated */}
      <section className="relative pt-20 sm:pt-24 pb-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background" />
        <div className="absolute top-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-teal-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left: Content */}
            <div className="text-center lg:text-left pt-4 lg:pt-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">Developer Program</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Build AI Agents
                </span>
                <br />
                <span className="text-foreground">That Power Business</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
                Create AI agents that transform how businesses operate. Your innovations, our platform, endless possibilities.
              </p>

              {/* Stats - horizontal on mobile */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-6 lg:mb-0">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">95+ agents</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">70% revenue</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Global reach</span>
                </div>
              </div>
            </div>

            {/* Right: Form Card - integrated, not separate */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Card className="bg-card/95 backdrop-blur-xl border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <CardContent className="p-5 sm:p-6">
                  {!submitted ? (
                    <>
                      {/* Header */}
                      <div className="text-center space-y-3 mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                          <ElixaLogo size={22} color="#ffffff" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-foreground">Apply to Join</h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            Build agents that power thousands of businesses
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium">
                              Name <span className="text-emerald-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="h-10 rounded-lg border-border bg-background text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium">
                              Email <span className="text-emerald-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-10 rounded-lg border-border bg-background text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">
                            Languages <span className="text-emerald-500">*</span>
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {codingLanguages.map((lang) => {
                              const isSelected = selectedLanguages.includes(lang);
                              return (
                                <Badge
                                  key={lang}
                                  variant="outline"
                                  onClick={() => toggleLanguage(lang)}
                                  className={cn(
                                    "cursor-pointer text-[10px] px-2 py-1 transition-all hover:scale-105",
                                    isSelected
                                      ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                                      : "bg-background border-border hover:border-emerald-500/50"
                                  )}
                                >
                                  {lang}
                                  {isSelected && <X className="w-2.5 h-2.5 ml-1" />}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        {/* AI Tools */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">
                            AI Tools <span className="text-emerald-500">*</span>
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {aiAgentTools.map((tool) => {
                              const isSelected = selectedTools.includes(tool);
                              return (
                                <Badge
                                  key={tool}
                                  variant="outline"
                                  onClick={() => toggleTool(tool)}
                                  className={cn(
                                    "cursor-pointer text-[10px] px-2 py-1 transition-all hover:scale-105",
                                    isSelected
                                      ? "bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
                                      : "bg-background border-border hover:border-teal-500/50"
                                  )}
                                >
                                  {tool}
                                  {isSelected && <X className="w-2.5 h-2.5 ml-1" />}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={!isFormValid || isLoading}
                          className="w-full h-11 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl rounded-lg"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Apply Now
                              <Zap className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>

                        <p className="text-center text-muted-foreground text-[10px]">
                          70% revenue share • No platform fees
                        </p>
                      </form>
                    </>
                  ) : (
                    <div className="text-center py-6 animate-in fade-in duration-500">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Application Received!</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        We'll review your profile and get back to you soon.
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Profile submitted</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Under review</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <TalentPoolFooter hideTopSpacing />
    </div>
  );
};

export default Developers;
