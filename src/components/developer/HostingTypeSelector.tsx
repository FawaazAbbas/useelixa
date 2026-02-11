import { Globe } from "lucide-react";
import { useEffect } from "react";

interface HostingTypeSelectorProps {
  hostingType: "platform" | "self_hosted" | "endpoint";
  onSelect: (type: "platform" | "self_hosted" | "endpoint") => void;
}

export const HostingTypeSelector = ({ hostingType, onSelect }: HostingTypeSelectorProps) => {
  useEffect(() => {
    if (hostingType !== "endpoint") {
      onSelect("endpoint");
    }
  }, []);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
      <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-sm">Endpoint Agent</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You host the logic. We call your endpoint with a structured contract. Elixa handles orchestration, approvals, and tool access.
        </p>
      </div>
    </div>
  );
};
