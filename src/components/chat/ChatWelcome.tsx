import { Mail, Calendar, CheckSquare, FileText, Search, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ElixaMascot } from "@/components/ElixaMascot";

interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  prompt: string;
  onClick: (prompt: string) => void;
}

const QuickActionCard = ({ icon: Icon, title, description, prompt, onClick }: QuickActionCardProps) => (
  <Card
    className="p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all group"
    onClick={() => onClick(prompt)}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
    </div>
  </Card>
);

interface ChatWelcomeProps {
  onQuickAction: (prompt: string) => void;
  hasConnectedServices?: boolean;
}

export const ChatWelcome = ({ onQuickAction, hasConnectedServices }: ChatWelcomeProps) => {
  const quickActions = [
    {
      icon: Mail,
      title: "Check Emails",
      description: "View and manage your recent emails",
      prompt: "Show me my recent emails",
    },
    {
      icon: Calendar,
      title: "Today's Schedule",
      description: "See what's on your calendar today",
      prompt: "What's on my calendar today?",
    },
    {
      icon: CheckSquare,
      title: "My Tasks",
      description: "View and organize your pending tasks",
      prompt: "Show me my pending tasks",
    },
    {
      icon: FileText,
      title: "Create a Note",
      description: "Quickly jot down ideas or meeting notes",
      prompt: "Help me create a new note",
    },
    {
      icon: Search,
      title: "Search Knowledge",
      description: "Find information in your documents",
      prompt: "Search my knowledge base for...",
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Automate common workflows",
      prompt: "What automations can you help me with?",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12 px-4">
      <ElixaMascot pose="waving" size="xl" animation="float" className="mb-4" />
      <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        I'm your intelligent assistant. I can help you manage emails, calendar events, tasks, notes, 
        and connect with your integrations. Just ask!
      </p>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.title}
            {...action}
            onClick={onQuickAction}
          />
        ))}
      </div>

      {/* Connection hint */}
      {!hasConnectedServices && (
        <p className="text-xs text-muted-foreground mt-8">
          💡 Tip: Connect your Gmail, Calendar, or other services in{" "}
          <a href="/connections" className="text-primary hover:underline">
            Connections
          </a>{" "}
          to unlock more features.
        </p>
      )}
    </div>
  );
};
