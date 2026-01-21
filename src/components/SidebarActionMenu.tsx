import { Plus, Link, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SidebarActionMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleConnectTool = () => {
    setOpen(false);
    navigate("/connections");
  };

  const handleManageSettings = () => {
    setOpen(false);
    navigate("/settings");
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
            <span className="text-sm font-medium">Quick Actions</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-56 p-2 bg-slate-900 border-slate-700"
        >
          <div className="space-y-1">
            <button
              onClick={handleConnectTool}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Link className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Connect Tool</div>
                <div className="text-xs text-slate-500">Add a new integration</div>
              </div>
            </button>
            <button
              onClick={handleManageSettings}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Settings className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Settings</div>
                <div className="text-xs text-slate-500">Manage MCP & tools</div>
              </div>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
