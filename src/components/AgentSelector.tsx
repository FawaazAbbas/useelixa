import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelect: (agentId: string) => void;
  showReason?: boolean;
  reason?: string;
  label?: string;
}

export const AgentSelector = ({
  agents,
  selectedAgentId,
  onSelect,
  showReason = false,
  reason,
  label = "Assign Agent"
}: AgentSelectorProps) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label} *</label>
        {showReason && reason && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Select value={selectedAgentId || undefined} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select an AI Agent" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {agent.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAgent && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <p className="font-medium text-sm">{selectedAgent.name}</p>
              </div>
              {selectedAgent.description && (
                <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
              )}
              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedAgent.capabilities.map((cap, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};