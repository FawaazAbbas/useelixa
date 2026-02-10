import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Trash2, Bot, Cloud, Server, CheckCircle, Loader2, AlertCircle, Search, LayoutGrid, List } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgentDetailSheet } from "./AgentDetailSheet";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

interface AgentListProps {
  agents: AgentSubmission[];
  onSubmitForReview: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const AgentList = ({ agents, onSubmitForReview, onDelete }: AgentListProps) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedAgent, setSelectedAgent] = useState<AgentSubmission | null>(null);

  const filtered = agents
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No agents yet</p>
          <p className="text-muted-foreground">Create your first AI agent to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="rounded-r-none" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="rounded-l-none" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agent Cards */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid gap-4"}>
        {filtered.map((agent) => (
          <Card key={agent.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedAgent(agent)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {agent.icon_url ? (
                    <img src={agent.icon_url} alt={agent.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 flex-wrap">
                      <span>v{agent.version || "1.0.0"} · {agent.category || "Uncategorized"}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                        {agent.hosting_type === "self_hosted" ? <Server className="h-2.5 w-2.5" /> : <Cloud className="h-2.5 w-2.5" />}
                        {agent.hosting_type === "self_hosted" ? "Self-Hosted" : "Platform"}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <Badge className={statusColors[agent.status] || ""}>
                  {agent.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{agent.description || "No description"}</p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {agent.status === "draft" && (
                  <Button size="sm" onClick={() => onSubmitForReview(agent.id)}>
                    <Send className="h-3 w-3 mr-1" /> Submit
                  </Button>
                )}
                {(agent.status === "draft" || agent.status === "rejected") && (
                  <Button size="sm" variant="destructive" onClick={() => onDelete(agent.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Sheet */}
      <AgentDetailSheet
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => { if (!open) setSelectedAgent(null); }}
        onSubmitForReview={onSubmitForReview}
        onDelete={onDelete}
      />
    </div>
  );
};
