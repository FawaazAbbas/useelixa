import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { INTEGRATION_MAPPINGS, type IntegrationMapping } from "@/config/integrationMapping";

interface MissingConnectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  requiredIntegrations: string[];
  connectedIntegrations: string[];
  onInstallAnyway: () => void;
  installing: boolean;
}

export function MissingConnectionsDialog({
  open,
  onOpenChange,
  agentName,
  requiredIntegrations,
  connectedIntegrations,
  onInstallAnyway,
  installing,
}: MissingConnectionsDialogProps) {
  const navigate = useNavigate();

  const items = requiredIntegrations.map((key) => {
    const mapping = INTEGRATION_MAPPINGS.find((m) => m.gatewayKey === key);
    const isConnected = connectedIntegrations.includes(key);
    return {
      key,
      label: mapping?.label || key.replace(/_/g, " "),
      logoUrl: mapping?.logoUrl,
      description: mapping?.description || "",
      isConnected,
    };
  });

  const missingCount = items.filter((i) => !i.isConnected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Missing Connections
          </DialogTitle>
          <DialogDescription>
            <strong>{agentName}</strong> requires {requiredIntegrations.length} integration{requiredIntegrations.length > 1 ? "s" : ""} to work properly.
            {missingCount > 0 && ` You're missing ${missingCount}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              {item.logoUrl && (
                <img src={item.logoUrl} alt={item.label} className="h-8 w-8 rounded object-contain" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              {item.isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          {missingCount > 0 && (
            <Button
              className="w-full gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate("/connections");
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Connect Missing Services
            </Button>
          )}
          <Button
            variant={missingCount > 0 ? "outline" : "default"}
            className="w-full"
            onClick={onInstallAnyway}
            disabled={installing}
          >
            {missingCount > 0 ? "Install Anyway (may not work fully)" : "Install Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
