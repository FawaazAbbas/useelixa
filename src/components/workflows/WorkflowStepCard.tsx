import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Zap,
  GitBranch,
  Clock,
  Bot,
  Mail,
  Calendar,
  FileText,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

interface WorkflowStep {
  id: string;
  step_order: number;
  step_type: string;
  step_name: string | null;
  tool_name: string | null;
  tool_params: Json;
  condition_config: Json | null;
}

interface WorkflowStepCardProps {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const STEP_CONFIG = {
  tool: { icon: Zap, color: "border-blue-500 bg-blue-500/10", badge: "bg-blue-500" },
  condition: { icon: GitBranch, color: "border-yellow-500 bg-yellow-500/10", badge: "bg-yellow-500" },
  delay: { icon: Clock, color: "border-gray-500 bg-gray-500/10", badge: "bg-gray-500" },
  ai_decision: { icon: Bot, color: "border-purple-500 bg-purple-500/10", badge: "bg-purple-500" },
};

const TOOL_ICONS: Record<string, React.ReactNode> = {
  gmail: <Mail className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  notes: <FileText className="h-4 w-4" />,
  notion: <Database className="h-4 w-4" />,
};

const getToolIcon = (toolName: string | null) => {
  if (!toolName) return <Zap className="h-4 w-4" />;
  const prefix = toolName.split("_")[0];
  return TOOL_ICONS[prefix] || <Zap className="h-4 w-4" />;
};

export function WorkflowStepCard({
  step,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: WorkflowStepCardProps) {
  const config = STEP_CONFIG[step.step_type as keyof typeof STEP_CONFIG] || STEP_CONFIG.tool;
  const StepIcon = config.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all border-l-4",
        config.color,
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", config.badge, "text-white")}>
              {step.step_type === "tool" ? getToolIcon(step.tool_name) : <StepIcon className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium">
                {step.step_name || `Step ${step.step_order + 1}`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {step.step_type.replace("_", " ")}
                </Badge>
                {step.tool_name && (
                  <Badge variant="outline" className="text-xs">
                    {step.tool_name.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
              {step.step_type === "condition" && (step.condition_config as Record<string, unknown>)?.expression && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {String((step.condition_config as Record<string, unknown>).expression).slice(0, 40)}...
                </p>
              )}
              {step.step_type === "delay" && (step.tool_params as Record<string, unknown>)?.minutes && (
                <p className="text-xs text-muted-foreground mt-1">
                  Wait {(step.tool_params as Record<string, unknown>).minutes as number} minutes
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
