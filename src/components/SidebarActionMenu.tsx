import { Plus, Users, UserPlus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SidebarActionMenuProps {
  onAddAgent?: () => void;
}

export const SidebarActionMenu = ({ onAddAgent }: SidebarActionMenuProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleCreateTeam = () => {
    toast({
      title: "Demo Mode",
      description: "Team creation is not available in demo mode",
    });
    setOpen(false);
  };

  const handleAddDirector = () => {
    toast({
      title: "Demo Mode",
      description: "Adding directors is not available in demo mode",
    });
    setOpen(false);
  };

  const handleAddAgent = () => {
    onAddAgent?.();
    setOpen(false);
  };

  return (
    <div className="p-3 border-t border-slate-700/50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-slate-200"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Add to Workspace</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-56 p-2 bg-slate-900 border-slate-700"
        >
          <div className="space-y-1">
            <button
              onClick={handleCreateTeam}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Create Team</div>
                <div className="text-xs text-slate-500">Add a new department</div>
              </div>
            </button>
            <button
              onClick={handleAddDirector}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Add Director</div>
                <div className="text-xs text-slate-500">Hire a department head</div>
              </div>
            </button>
            <button
              onClick={handleAddAgent}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Add Agents</div>
                <div className="text-xs text-slate-500">Browse AI talent pool</div>
              </div>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
