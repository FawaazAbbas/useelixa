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
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0 overflow-hidden border border-border/50 bg-background shadow-2xl rounded-2xl">
        {!submitted ? (
          <div className="relative bg-background rounded-2xl overflow-hidden">
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
            
            <div className="relative p-6 overflow-y-auto max-h-[85vh]">
              <DialogHeader className="space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img src="/elixa-logo.png" alt="Elixa" className="h-14 w-14 object-contain" />
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Build with Elixa
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Join our developer community and create AI agents
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="mt-6">
                {/* Two column layout on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dev-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dev-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="dev-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dev-email"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Languages You Know <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border max-h-[140px] overflow-y-auto">
                      {codingLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            selectedLanguages.includes(lang)
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground"
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
                      <p className="text-xs text-emerald-600">{selectedLanguages.length} selected</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      AI Agent Tools You Use <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border max-h-[140px] overflow-y-auto">
                      {aiAgentTools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            selectedTools.includes(tool)
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                              : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground"
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
                      <p className="text-xs text-cyan-600">{selectedTools.length} selected</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] mt-6"
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
          <div className="relative bg-background rounded-2xl overflow-hidden">
            <div className="relative py-16 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-scale-in">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Application Sent!</h3>
                <p className="text-muted-foreground">
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