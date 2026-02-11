import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Cloud, Server, Send, Trash2, Bot, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { AgentTestConsole } from "./AgentTestConsole";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

interface AgentDetailSheetProps {
  agent: AgentSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForReview: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AgentDetailSheet = ({ agent, open, onOpenChange, onSubmitForReview, onDelete }: AgentDetailSheetProps) => {
  if (!agent) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 break-words">{value || "—"}</span>
    </div>
  );

  const baseUrl = agent.external_endpoint_url?.replace(/\/$/, '') || '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {agent.icon_url ? (
              <img src={agent.icon_url} alt={agent.name} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <SheetTitle>{agent.name}</SheetTitle>
              <SheetDescription>{agent.description || "No description"}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge className={statusColors[agent.status] || ""}>{agent.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="gap-1">
              {agent.hosting_type === "self_hosted" ? <Server className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {agent.hosting_type === "self_hosted" ? "Self-Hosted" : "Platform"}
            </Badge>
          </div>

          {agent.review_notes && agent.status === "rejected" && (
            <div className="bg-destructive/5 text-destructive text-sm rounded-md p-3">
              <strong>Review Notes:</strong> {agent.review_notes}
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <DetailRow label="Category" value={agent.category} />
            <DetailRow label="Version" value={agent.version || "1.0.0"} />
            <DetailRow label="Runtime" value={<span className="capitalize">{agent.runtime}</span>} />
            <DetailRow label="Downloads" value={agent.download_count} />
            <DetailRow label="Slug" value={<code className="text-xs bg-muted px-1 rounded">{agent.slug}</code>} />
          </div>

          <Separator />

          {/* Hosting Config */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Hosting Configuration</h4>
            {agent.hosting_type === "self_hosted" ? (
              <>
                <DetailRow label="Base URL" value={agent.external_endpoint_url} />
                <DetailRow label="Auth Header" value={agent.external_auth_header} />
              </>
            ) : (
              <>
                <DetailRow label="Code File" value={agent.code_file_url ? "Uploaded" : "None"} />
                <DetailRow label="Entry Function" value={agent.entry_function} />
                <DetailRow label="Requirements" value={agent.requirements} />
              </>
            )}
          </div>

          {/* Actions (self-hosted) */}
          {agent.hosting_type === "self_hosted" && agent.actions && agent.actions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Actions ({agent.actions.length})</h4>
                <div className="space-y-2">
                  {agent.actions.map((action) => (
                    <div key={action.id} className="rounded-md border p-2.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${METHOD_COLORS[action.method] || ""} text-[10px] px-1.5 py-0`}>
                          {action.method}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {baseUrl}{action.path}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{action.action_name}</p>
                      {action.description && (
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Execution status */}
          {agent.hosting_type === "platform" && agent.code_file_url && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Execution Status</h4>
                <div className="flex items-center gap-2 text-sm">
                  {agent.execution_status === "ready" && <><CheckCircle className="h-4 w-4 text-green-500" /> Ready</>}
                  {agent.execution_status === "building" && <><Loader2 className="h-4 w-4 text-yellow-500 animate-spin" /> Building</>}
                  {agent.execution_status === "error" && <><AlertCircle className="h-4 w-4 text-destructive" /> Error</>}
                </div>
                {agent.execution_error && (
                  <p className="text-xs text-destructive mt-1 bg-destructive/5 p-2 rounded">{agent.execution_error}</p>
                )}
              </div>
            </>
          )}

          {/* System Prompt & Tools */}
          {(agent.system_prompt || (agent.allowed_tools && agent.allowed_tools.length > 0)) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">AI Configuration</h4>
                {agent.system_prompt && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">System Prompt</p>
                    <p className="text-sm bg-muted p-2 rounded-md whitespace-pre-wrap max-h-32 overflow-y-auto">{agent.system_prompt}</p>
                  </div>
                )}
                {agent.allowed_tools && agent.allowed_tools.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Allowed Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.allowed_tools.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Timeline</h4>
            <DetailRow label="Created" value={format(new Date(agent.created_at), "MMM d, yyyy HH:mm")} />
            {agent.submitted_at && <DetailRow label="Submitted" value={format(new Date(agent.submitted_at), "MMM d, yyyy HH:mm")} />}
            {agent.reviewed_at && <DetailRow label="Reviewed" value={format(new Date(agent.reviewed_at), "MMM d, yyyy HH:mm")} />}
            <DetailRow label="Updated" value={format(new Date(agent.updated_at), "MMM d, yyyy HH:mm")} />
          </div>

          {/* Test Console */}
          {(agent.hosting_type === "self_hosted" && agent.external_endpoint_url) && (
            <>
              <Separator />
              <AgentTestConsole agent={agent} />
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-2 pt-2">
            {agent.status === "draft" && (
              <Button size="sm" onClick={() => { onSubmitForReview(agent.id); onOpenChange(false); }}>
                <Send className="h-3 w-3 mr-1" /> Submit for Review
              </Button>
            )}
            {(agent.status === "draft" || agent.status === "rejected") && (
              <Button size="sm" variant="destructive" onClick={() => { onDelete(agent.id); onOpenChange(false); }}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
