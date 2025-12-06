import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, X, Sparkles } from "lucide-react";
import { ElixaLogo } from "@/components/ElixaLogo";
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-2xl">
        {!submitted ? (
          <div className="relative overflow-hidden">
            {/* Colorful top accent bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            
            <div className="p-8 overflow-y-auto max-h-[85vh]">
              {/* Header */}
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-2">
                  <ElixaLogo size={28} color="#ffffff" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Build with Elixa
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Create AI agents that power thousands of businesses worldwide
                </p>
                
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dev-name" className="text-sm font-medium">
                      Name <span className="text-emerald-500">*</span>
                    </Label>
                    <Input
                      id="dev-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dev-email" className="text-sm font-medium">
                      Email <span className="text-emerald-500">*</span>
                    </Label>
                    <Input
                      id="dev-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Languages <span className="text-emerald-500">*</span>
                      </Label>
                      {selectedLanguages.length > 0 && (
                        <span className="text-xs text-emerald-600 font-medium">{selectedLanguages.length} selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl border border-border max-h-[150px] overflow-y-auto">
                      {codingLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all text-xs px-2.5 py-1 rounded-lg",
                            selectedLanguages.includes(lang)
                              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                              : "bg-background border-border text-muted-foreground hover:border-emerald-500/30 hover:text-foreground"
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
                    <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl border border-border max-h-[150px] overflow-y-auto">
                      {aiAgentTools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all text-xs px-2.5 py-1 rounded-lg",
                            selectedTools.includes(tool)
                              ? "bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-400"
                              : "bg-background border-border text-muted-foreground hover:border-teal-500/30 hover:text-foreground"
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
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] mt-6 rounded-xl"
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
                
                <p className="text-center text-muted-foreground text-xs mt-4">
                  We review all applications within 48 hours.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="py-16 px-8 flex flex-col items-center justify-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-scale-in">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Application Sent!</h3>
              <p className="text-muted-foreground">
                We'll review and be in touch soon.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};