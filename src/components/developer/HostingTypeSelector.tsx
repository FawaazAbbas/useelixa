import { Label } from "@/components/ui/label";
import { Cloud, Server, Globe } from "lucide-react";

interface HostingTypeSelectorProps {
  hostingType: "platform" | "self_hosted" | "endpoint";
  onSelect: (type: "platform" | "self_hosted" | "endpoint") => void;
}

const options = [
  { type: "platform" as const, icon: Cloud, label: "Host with Elixa", desc: "Upload your code. We run it for you." },
  { type: "self_hosted" as const, icon: Server, label: "Self-Hosted", desc: "You host it. Give us the endpoint." },
  { type: "endpoint" as const, icon: Globe, label: "Endpoint Agent", desc: "You host the logic. We call your endpoint with a structured contract." },
] as const;

export const HostingTypeSelector = ({ hostingType, onSelect }: HostingTypeSelectorProps) => (
  <div className="space-y-2">
    <Label>Hosting Type</Label>
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ type, icon: Icon, label, desc }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all ${
            hostingType === type
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <Icon className={`h-6 w-6 ${hostingType === type ? "text-primary" : "text-muted-foreground"}`} />
          <span className="font-medium text-sm">{label}</span>
          <span className="text-xs text-muted-foreground text-center">{desc}</span>
        </button>
      ))}
    </div>
  </div>
);