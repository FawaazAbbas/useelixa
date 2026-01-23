import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedPromptsProps {
  lastAssistantMessage?: string;
  lastUserMessage?: string;
  onSelectPrompt: (prompt: string) => void;
  isLoading?: boolean;
  className?: string;
}

// Context-aware prompt suggestions based on conversation patterns
const generateSuggestions = (
  assistantMessage: string,
  userMessage: string
): string[] => {
  const suggestions: string[] = [];
  const lowerAssistant = assistantMessage.toLowerCase();
  const lowerUser = userMessage.toLowerCase();

  // Email-related suggestions
  if (lowerAssistant.includes("email") || lowerUser.includes("email")) {
    suggestions.push("Show me more unread emails");
    suggestions.push("Draft a follow-up email");
    suggestions.push("Archive these emails");
  }

  // Calendar-related suggestions
  if (lowerAssistant.includes("calendar") || lowerAssistant.includes("event") || lowerAssistant.includes("meeting")) {
    suggestions.push("What's on my calendar tomorrow?");
    suggestions.push("Schedule a follow-up meeting");
    suggestions.push("Find a free time slot this week");
  }

  // Task-related suggestions
  if (lowerAssistant.includes("task") || lowerUser.includes("task") || lowerUser.includes("todo")) {
    suggestions.push("Show me high priority tasks");
    suggestions.push("Mark this task as complete");
    suggestions.push("What's due this week?");
  }

  // Analytics/data suggestions
  if (lowerAssistant.includes("analytics") || lowerAssistant.includes("data") || lowerAssistant.includes("report")) {
    suggestions.push("Show me a comparison with last month");
    suggestions.push("Export this data as CSV");
    suggestions.push("What are the key insights?");
  }

  // Stripe/payment suggestions
  if (lowerAssistant.includes("stripe") || lowerAssistant.includes("payment") || lowerAssistant.includes("revenue")) {
    suggestions.push("Show recent transactions");
    suggestions.push("What's the monthly revenue?");
    suggestions.push("List customers with failed payments");
  }

  // Shopify suggestions
  if (lowerAssistant.includes("shopify") || lowerAssistant.includes("order") || lowerAssistant.includes("product")) {
    suggestions.push("Show pending orders");
    suggestions.push("What products are low in stock?");
    suggestions.push("Show today's sales summary");
  }

  // General follow-ups if no specific context
  if (suggestions.length === 0) {
    suggestions.push("Tell me more about this");
    suggestions.push("Can you explain in simpler terms?");
    suggestions.push("What should I do next?");
  }

  // Return up to 3 suggestions
  return suggestions.slice(0, 3);
};

export const SuggestedPrompts = ({
  lastAssistantMessage = "",
  lastUserMessage = "",
  onSelectPrompt,
  isLoading,
  className,
}: SuggestedPromptsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastAssistantMessage && !isLoading) {
      const newSuggestions = generateSuggestions(lastAssistantMessage, lastUserMessage);
      setSuggestions(newSuggestions);
      // Delay showing to feel natural
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [lastAssistantMessage, lastUserMessage, isLoading]);

  if (!visible || suggestions.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-wrap gap-2 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
      className
    )}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
        <Sparkles className="h-3 w-3" />
        <span>Try asking:</span>
      </div>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-full hover:bg-primary/10 hover:border-primary/50 transition-colors"
          onClick={() => onSelectPrompt(suggestion)}
        >
          {suggestion}
          <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      ))}
    </div>
  );
};
