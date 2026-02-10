import { Label } from "@/components/ui/label";
import { Cloud, Server } from "lucide-react";

interface HostingTypeSelectorProps {
  hostingType: "platform" | "self_hosted";
  onSelect: (type: "platform" | "self_hosted") => void;
}

export const HostingTypeSelector = ({ hostingType, onSelect }: HostingTypeSelectorProps) => (
  <div className="space-y-2">
    <Label>Hosting Type</Label>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onSelect("platform")}
        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all ${
          hostingType === "platform"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <Cloud className={`h-6 w-6 ${hostingType === "platform" ? "text-primary" : "text-muted-foreground"}`} />
        <span className="font-medium text-sm">Host with Elixa</span>
        <span className="text-xs text-muted-foreground text-center">Upload your code. We run it for you.</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect("self_hosted")}
        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all ${
          hostingType === "self_hosted"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <Server className={`h-6 w-6 ${hostingType === "self_hosted" ? "text-primary" : "text-muted-foreground"}`} />
        <span className="font-medium text-sm">Self-Hosted</span>
        <span className="text-xs text-muted-foreground text-center">You host it. Give us the endpoint.</span>
      </button>
    </div>
  </div>
);
