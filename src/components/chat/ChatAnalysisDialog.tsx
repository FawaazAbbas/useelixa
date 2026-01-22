import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatMessage } from "@/hooks/useChat";
import { MessageSquare, User, Bot, FileText, Clock, Zap } from "lucide-react";

interface ChatAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  sessionTitle: string;
}

export const ChatAnalysisDialog = ({
  open,
  onOpenChange,
  messages,
  sessionTitle,
}: ChatAnalysisDialogProps) => {
  const analysis = useMemo(() => {
    const userMessages = messages.filter(m => m.role === "user");
    const assistantMessages = messages.filter(m => m.role === "assistant");
    
    const totalWords = messages.reduce((acc, m) => {
      return acc + m.content.split(/\s+/).filter(Boolean).length;
    }, 0);

    const userWords = userMessages.reduce((acc, m) => {
      return acc + m.content.split(/\s+/).filter(Boolean).length;
    }, 0);

    const assistantWords = assistantMessages.reduce((acc, m) => {
      return acc + m.content.split(/\s+/).filter(Boolean).length;
    }, 0);

    const toolCalls = messages.reduce((acc, m) => {
      return acc + (m.toolCalls?.length || 0);
    }, 0);

    const pendingActions = messages.filter(m => m.pendingAction).length;

    const filesShared = messages.reduce((acc, m) => {
      return acc + (m.files?.length || 0);
    }, 0);

    // Calculate conversation duration
    let duration = "N/A";
    if (messages.length >= 2) {
      const firstTimestamp = new Date(messages[0].timestamp).getTime();
      const lastTimestamp = new Date(messages[messages.length - 1].timestamp).getTime();
      const durationMs = lastTimestamp - firstTimestamp;
      const minutes = Math.floor(durationMs / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        duration = `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        duration = `${minutes} minutes`;
      } else {
        duration = "< 1 minute";
      }
    }

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      totalWords,
      userWords,
      assistantWords,
      avgUserLength: userMessages.length > 0 ? Math.round(userWords / userMessages.length) : 0,
      avgAssistantLength: assistantMessages.length > 0 ? Math.round(assistantWords / assistantMessages.length) : 0,
      toolCalls,
      pendingActions,
      filesShared,
      duration,
    };
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Conversation</h4>
            <p className="font-medium truncate">{sessionTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<MessageSquare className="h-4 w-4" />}
              label="Total Messages"
              value={analysis.totalMessages}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Duration"
              value={analysis.duration}
            />
            <StatCard
              icon={<User className="h-4 w-4" />}
              label="Your Messages"
              value={analysis.userMessages}
              subtitle={`~${analysis.avgUserLength} words avg`}
            />
            <StatCard
              icon={<Bot className="h-4 w-4" />}
              label="AI Responses"
              value={analysis.assistantMessages}
              subtitle={`~${analysis.avgAssistantLength} words avg`}
            />
            <StatCard
              icon={<Zap className="h-4 w-4" />}
              label="Tool Executions"
              value={analysis.toolCalls}
            />
            <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Files Shared"
              value={analysis.filesShared}
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Total words exchanged: <span className="font-medium text-foreground">{analysis.totalWords.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
}

const StatCard = ({ icon, label, value, subtitle }: StatCardProps) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-xl font-semibold">{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
  </div>
);
