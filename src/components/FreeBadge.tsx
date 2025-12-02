import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const FreeBadge = () => {
  return (
    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold shadow-lg">
      <Sparkles className="h-3 w-3 mr-1" />
      FREE
    </Badge>
  );
};
