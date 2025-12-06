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
import { Code, Check, Loader2, X } from "lucide-react";
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
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('developer_applications')
        .insert({
          name,
          email,
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
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        {!submitted ? (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 animate-pulse" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-500/30 rounded-full blur-3xl" />
            
            <div className="relative p-6 overflow-y-auto max-h-[85vh]">
              <DialogHeader className="space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Build with Elixa
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm">
                  Join our developer community and create AI agents
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="dev-name" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Name
                  </Label>
                  <Input
                    id="dev-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="dev-email" className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="dev-email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Languages You Know
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10 max-h-[120px] overflow-y-auto">
                    {codingLanguages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="outline"
                        className={cn(
                          "cursor-pointer transition-all hover:scale-105",
                          selectedLanguages.includes(lang)
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : "bg-transparent border-slate-600 text-slate-400 hover:border-slate-500"
                        )}
                        onClick={() => toggleLanguage(lang)}
                      >
                        {lang}
                        {selectedLanguages.includes(lang) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <p className="text-xs text-slate-500">{selectedLanguages.length} selected</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    AI Agent Tools You Use
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10 max-h-[140px] overflow-y-auto">
                    {aiAgentTools.map((tool) => (
                      <Badge
                        key={tool}
                        variant="outline"
                        className={cn(
                          "cursor-pointer transition-all hover:scale-105",
                          selectedTools.includes(tool)
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                            : "bg-transparent border-slate-600 text-slate-400 hover:border-slate-500"
                        )}
                        onClick={() => toggleTool(tool)}
                      >
                        {tool}
                        {selectedTools.includes(tool) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {selectedTools.length > 0 && (
                    <p className="text-xs text-slate-500">{selectedTools.length} selected</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || selectedLanguages.length === 0 || selectedTools.length === 0}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Code className="w-5 h-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-emerald-500/20" />
            <div className="relative py-16 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-scale-in">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Application Sent!</h3>
                <p className="text-slate-300">
                  We'll review and get back to you.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};