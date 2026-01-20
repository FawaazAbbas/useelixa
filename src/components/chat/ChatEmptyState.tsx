import { BrianAvatar } from "@/components/BrianAvatar";
import { Sparkles, Calendar, Search, Zap, Link2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const SuggestionCard = ({ icon, title, onClick }: SuggestionCardProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
  >
    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <span className="text-sm font-medium">{title}</span>
  </button>
);

interface ChatEmptyStateProps {
  onSuggestionClick: (message: string) => void;
  hasConnectedServices?: boolean;
}

export const ChatEmptyState = ({ onSuggestionClick, hasConnectedServices = false }: ChatEmptyStateProps) => {
  const navigate = useNavigate();
  
  const suggestions = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "What agents do you recommend for my business?",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Help me create a task for my marketing campaign",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Search my workspace files for Q4 reports",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Set up an automation for daily standups",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <BrianAvatar size="xl" className="mb-6" />
      
      <h1 className="text-2xl font-semibold mb-2">How can I help you today?</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        I'm Elixa, your AI workspace assistant. I can help you manage tasks, 
        find information, install agents, and automate your workflow.
      </p>

      {/* Connection Prompt - Show when no services connected */}
      {!hasConnectedServices && (
        <div className="w-full max-w-2xl mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Supercharge me with your tools</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Connect your Google, Notion, Slack, or other services and I'll be able to 
                send emails, search your files, post messages, and much more—all through our chat.
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate("/connections")}
                className="gap-2"
              >
                Connect services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            icon={suggestion.icon}
            title={suggestion.title}
            onClick={() => onSuggestionClick(suggestion.title)}
          />
        ))}
      </div>
    </div>
  );
};
