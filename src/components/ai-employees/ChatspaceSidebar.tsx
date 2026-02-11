import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InstalledAgent {
  installationId: string;
  agentId: string;
  name: string;
  iconUrl: string | null;
  category: string | null;
  executionStatus: string;
  deployedAt: string | null;
}

interface ChatspaceSidebarProps {
  agents: InstalledAgent[];
  selectedId: string | null;
  onSelect: (installationId: string) => void;
  onBrowse: () => void;
}

export function ChatspaceSidebar({ agents, selectedId, onSelect, onBrowse }: ChatspaceSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[280px] border-r bg-card flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Agents</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBrowse}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Agent list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bot className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "No agents match your search" : "No agents deployed yet"}
              </p>
              <Button variant="link" size="sm" onClick={onBrowse} className="mt-1">
                Browse Agents
              </Button>
            </div>
          ) : (
            filtered.map((agent) => (
              <button
                key={agent.installationId}
                onClick={() => onSelect(agent.installationId)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  selectedId === agent.installationId
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={agent.iconUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      agent.executionStatus === "ready" ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  {agent.category && (
                    <p className="text-xs text-muted-foreground truncate">
                      {agent.category.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Browse CTA */}
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onBrowse}>
          <Plus className="h-3.5 w-3.5" />
          Browse Agents
        </Button>
      </div>
    </div>
  );
}
