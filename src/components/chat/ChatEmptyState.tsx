import { BrianAvatar } from "@/components/BrianAvatar";
import { Sparkles, Calendar, Search, Zap } from "lucide-react";

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
}

export const ChatEmptyState = ({ onSuggestionClick }: ChatEmptyStateProps) => {
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
