import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Check, Loader2, X, Sparkles, Terminal, Cpu, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DeveloperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export const DeveloperDialog = ({ open, onOpenChange }: DeveloperDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isFormValid = name.trim() && email.trim() && selectedLanguages.length > 0 && selectedTools.length > 0;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('developer_applications')
        .insert({
          name: name.trim(),
          email: email.trim(),
          skills: selectedLanguages,
          message: `AI Tools: ${selectedTools.join(', ')}`,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Application Received!",
        description: "We'll review your profile and get back to you.",
      });

      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setSelectedLanguages([]);
        setSelectedTools([]);
        onOpenChange(false);
      }, 3000);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-2xl rounded-3xl">
        {!submitted ? (
          <div className="relative bg-gradient-to-br from-slate-900 via-emerald-900/80 to-slate-900 rounded-3xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
            </div>
            
            {/* Code pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            <div className="relative p-8 overflow-y-auto max-h-[85vh]">
              {/* Header */}
              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  Developer Program
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Build the Future
                  </h2>
                  <p className="text-white/60 text-base max-w-md mx-auto">
                    Create AI agents that power thousands of businesses worldwide
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">95+ agents live</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <GitBranch className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm">Open SDK</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Two column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dev-name" className="text-sm font-medium text-white/80">
                      Name <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      id="dev-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dev-email" className="text-sm font-medium text-white/80">
                      Email <span className="text-emerald-400">*</span>
                    </Label>
                    <Input
                      id="dev-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-12 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white/80">
                        Languages <span className="text-emerald-400">*</span>
                      </Label>
                      {selectedLanguages.length > 0 && (
                        <span className="text-xs text-emerald-400 font-medium">{selectedLanguages.length} selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/10 max-h-[160px] overflow-y-auto">
                      {codingLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105 rounded-lg px-3 py-1",
                            selectedLanguages.includes(lang)
                              ? "bg-emerald-500/30 border-emerald-400 text-emerald-300"
                              : "bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80"
                          )}
                          onClick={() => toggleLanguage(lang)}
                        >
                          {lang}
                          {selectedLanguages.includes(lang) && (
                            <X className="w-3 h-3 ml-1.5" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white/80">
                        AI Tools <span className="text-emerald-400">*</span>
                      </Label>
                      {selectedTools.length > 0 && (
                        <span className="text-xs text-cyan-400 font-medium">{selectedTools.length} selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/10 max-h-[160px] overflow-y-auto">
                      {aiAgentTools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105 rounded-lg px-3 py-1",
                            selectedTools.includes(tool)
                              ? "bg-cyan-500/30 border-cyan-400 text-cyan-300"
                              : "bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white/80"
                          )}
                          onClick={() => toggleTool(tool)}
                        >
                          {tool}
                          {selectedTools.includes(tool) && (
                            <X className="w-3 h-3 ml-1.5" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-semibold shadow-2xl shadow-emerald-500/40 transition-all hover:shadow-emerald-500/60 hover:scale-[1.02] mt-8 rounded-xl text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Apply to Build
                    </>
                  )}
                </Button>
                
                <p className="text-center text-white/40 text-xs mt-4">
                  We review all applications within 48 hours.
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-scale-in">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-white">Application Sent!</h3>
                <p className="text-white/60 text-lg">
                  We'll review and be in touch soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};