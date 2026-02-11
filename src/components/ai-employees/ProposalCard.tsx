import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProposalCardProps {
  proposalId: string;
  title: string;
  summary?: string;
  status: "pending" | "approved" | "rejected";
  onResolved?: (status: "approved" | "rejected") => void;
}

export function ProposalCard({ proposalId, title, summary, status: initialStatus, onResolved }: ProposalCardProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const resolve = async (newStatus: "approved" | "rejected") => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("agent_proposals")
        .update({
          status: newStatus,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq("id", proposalId);

      if (error) throw error;
      setStatus(newStatus);
      onResolved?.(newStatus);
      toast.success(`Proposal ${newStatus}`);
    } catch {
      toast.error("Failed to update proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={
        status === "pending"
          ? "border-warning/40 bg-warning/5"
          : status === "approved"
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-destructive/40 bg-destructive/5"
      }
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          {status === "pending" ? (
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          ) : status === "approved" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <Badge
                variant="outline"
                className={
                  status === "pending"
                    ? "text-warning border-warning/30"
                    : status === "approved"
                    ? "text-emerald-600 border-emerald-300"
                    : "text-destructive border-destructive/30"
                }
              >
                {status}
              </Badge>
            </div>
            {summary && <p className="text-xs text-muted-foreground mt-1">{summary}</p>}
          </div>
        </div>

        {status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => resolve("approved")}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => resolve("rejected")}
              disabled={loading}
            >
              <XCircle className="h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
