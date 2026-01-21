import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PendingAction } from "@/hooks/useChat";

interface PendingActionButtonsProps {
  action: PendingAction;
  onResolved: (result: { approved: boolean; message: string }) => void;
}

export const PendingActionButtons = ({ action, onResolved }: PendingActionButtonsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedStatus, setProcessedStatus] = useState<"approved" | "denied" | null>(null);

  const handleDecision = async (decision: "approved" | "denied") => {
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-pending-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            actionId: action.id,
            decision,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process action");
      }

      setProcessedStatus(decision);
      
      if (decision === "approved") {
        toast.success(result.message || "Action executed successfully");
      } else {
        toast.info("Action was denied");
      }

      onResolved({
        approved: decision === "approved",
        message: result.message || (decision === "approved" ? "Action completed" : "Action denied"),
      });
    } catch (error) {
      console.error("Error processing action:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process action");
    } finally {
      setIsProcessing(false);
    }
  };

  if (processedStatus) {
    return (
      <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm ${
        processedStatus === "approved" 
          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}>
        {processedStatus === "approved" ? (
          <>
            <Check className="h-4 w-4" />
            <span>Action approved and executed</span>
          </>
        ) : (
          <>
            <X className="h-4 w-4" />
            <span>Action denied</span>
          </>
        )}
      </div>
    );
  }

  if (action.status !== "pending") {
    return (
      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm bg-muted text-muted-foreground">
        <span>Action already {action.status}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button
        onClick={() => handleDecision("approved")}
        disabled={isProcessing}
        size="sm"
        variant="default"
        className="bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        Approve
      </Button>
      <Button
        onClick={() => handleDecision("denied")}
        disabled={isProcessing}
        variant="destructive"
        size="sm"
      >
        <X className="h-4 w-4 mr-1" />
        Deny
      </Button>
    </div>
  );
};
