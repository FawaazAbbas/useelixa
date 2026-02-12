import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Trash2, Bot, Globe, Server, CheckCircle, Loader2, AlertCircle, Search, LayoutGrid, List, MoreVertical, Copy, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ElixaMascot } from "@/components/ElixaMascot";
import { AgentAvatar } from "@/components/ai-employees/AgentAvatar";
import { AgentDetailSheet } from "./AgentDetailSheet";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

interface AgentListProps {
  agents: AgentSubmission[];
  onSubmitForReview: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onValidate?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate?: (id: string, updates: Partial<AgentSubmission>) => Promise<void>;
  onDuplicate?: (agent: AgentSubmission) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const hostingLabel = (type: string) => type === "endpoint" ? "Endpoint" : "Legacy";
const hostingIcon = (type: string) => type === "endpoint" ? <Globe className="h-2.5 w-2.5" /> : <Server className="h-2.5 w-2.5" />;

export const AgentList = ({ agents, onSubmitForReview, onDelete, onValidate, onUpdate, onDuplicate }: AgentListProps) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedAgent, setSelectedAgent] = useState<AgentSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentSubmission | null>(null);

  const filtered = agents
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ElixaMascot pose="search" size="lg" animation="float" className="mb-4" />
          <p className="text-lg font-medium">No agents yet</p>
          <p className="text-sm text-muted-foreground">Create your first AI agent to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="rounded-none h-9 w-9" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="rounded-none h-9 w-9" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No agents match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid gap-3"}>
          {filtered.map((agent) => (
            <Card key={agent.id} className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all" onClick={() => setSelectedAgent(agent)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <AgentAvatar name={agent.name} avatarColor={agent.icon_url} iconUrl={agent.icon_url} className="h-10 w-10" />
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{agent.name}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>v{agent.version || "1.0.0"}</span>
                        <span className="text-border">·</span>
                        <span>{agent.category || "Uncategorized"}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${statusColors[agent.status] || ""} text-[11px] flex-shrink-0`}>
                      {agent.status.replace("_", " ")}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setSelectedAgent(agent)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        {onDuplicate && (
                          <DropdownMenuItem onClick={() => onDuplicate(agent)}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                        )}
                        {agent.status === "draft" && (
                          <DropdownMenuItem onClick={() => onSubmitForReview(agent.id)}>
                            <Send className="h-3.5 w-3.5 mr-2" /> Submit for Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(agent)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{agent.description || "No description"}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
                    {hostingIcon(agent.execution_mode || agent.hosting_type)}
                    {hostingLabel(agent.execution_mode || agent.hosting_type)}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center">
                          {agent.execution_status === "ready" && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                          {agent.execution_status === "error" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                          {agent.execution_status === "building" && <Loader2 className="h-3.5 w-3.5 text-yellow-500 animate-spin" />}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {agent.execution_status === "ready" && "Agent validated successfully"}
                        {agent.execution_status === "error" && (agent.execution_error || "Validation failed")}
                        {agent.execution_status === "building" && "Validating..."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AgentDetailSheet
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => { if (!open) setSelectedAgent(null); }}
        onSubmitForReview={onSubmitForReview}
        onDelete={onDelete}
        onValidate={onValidate}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" and all associated execution logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
