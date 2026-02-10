import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Trash2, Edit, Bot } from "lucide-react";
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

  const filtered = filter === "all" ? agents : agents.filter((a) => a.status === filter);

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
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
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
      </div>

      <div className="grid gap-4">
        {filtered.map((agent) => (
          <Card key={agent.id}>
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
                    <CardDescription className="text-xs">
                      v{agent.version || "1.0.0"} · {agent.category || "Uncategorized"}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={statusColors[agent.status] || ""}>
                  {agent.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{agent.description || "No description"}</p>
              {agent.review_notes && agent.status === "rejected" && (
                <p className="text-sm text-destructive mb-4 bg-destructive/5 rounded-md p-2">
                  Review: {agent.review_notes}
                </p>
              )}
              <div className="flex gap-2">
                {agent.status === "draft" && (
                  <Button size="sm" onClick={() => onSubmitForReview(agent.id)}>
                    <Send className="h-3 w-3 mr-1" /> Submit for Review
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
    </div>
  );
};
