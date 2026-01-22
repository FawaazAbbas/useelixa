import { MoreHorizontal, Trash2, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatMessage } from "@/hooks/useChat";

interface ChatActionsMenuProps {
  sessionTitle: string;
  messages: ChatMessage[];
  onDelete: () => void;
  onExport: () => void;
  onAnalyze: () => void;
}

export const ChatActionsMenu = ({
  sessionTitle,
  messages,
  onDelete,
  onExport,
  onAnalyze,
}: ChatActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAnalyze} disabled={messages.length === 0}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analyze Chat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport} disabled={messages.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Chat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
