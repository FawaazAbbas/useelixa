import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Bot, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentAvatar } from "./AgentAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ElixaMascot } from "@/components/ElixaMascot";

export interface InstalledAgent {
  installationId: string;
  agentId: string;
  name: string;
  iconUrl: string | null;
  avatarColor?: string | null;
  category: string | null;
  executionStatus: string;
  deployedAt: string | null;
}

export interface DMContact {
  dmId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface ChatspaceSidebarProps {
  agents: InstalledAgent[];
  selectedId: string | null;
  selectedType: "elixa" | "agent" | "dm";
  onSelectElixa: () => void;
  onSelect: (installationId: string) => void;
  onSelectDM: (dmId: string) => void;
  onBrowse: () => void;
  dmContacts: DMContact[];
}

export function ChatspaceSidebar({ agents, selectedId, selectedType, onSelectElixa, onSelect, onSelectDM, onBrowse, dmContacts }: ChatspaceSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredDMs = dmContacts.filter(
    (d) => d.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[280px] border-r bg-card flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Chats</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBrowse}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Elixa AI Chat - always first */}
          <button
            onClick={onSelectElixa}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
              selectedType === "elixa"
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-full border-2 border-muted bg-muted flex items-center justify-center overflow-hidden">
                <ElixaMascot pose="default" size="xs" className="scale-[1.1]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Elixa AI</p>
              <p className="text-xs text-muted-foreground truncate">AI Assistant</p>
            </div>
          </button>

          {/* People section */}
          {filteredDMs.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">People</span>
              </div>
              {filteredDMs.map((dm) => (
                <button
                  key={dm.dmId}
                  onClick={() => onSelectDM(dm.dmId)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selectedType === "dm" && selectedId === dm.dmId
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={dm.avatarUrl || undefined} />
                      <AvatarFallback>{dm.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dm.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">Direct message</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Agents section */}
          {filteredAgents.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agents</span>
              </div>
              {filteredAgents.map((agent) => (
                <button
                  key={agent.installationId}
                  onClick={() => onSelect(agent.installationId)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selectedType === "agent" && selectedId === agent.installationId
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <AgentAvatar
                      name={agent.name}
                      avatarColor={agent.avatarColor}
                      iconUrl={agent.iconUrl}
                      className="h-9 w-9"
                    />
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
              ))}
            </>
          )}

          {filteredAgents.length === 0 && filteredDMs.length === 0 && search && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bot className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No results match your search</p>
            </div>
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
