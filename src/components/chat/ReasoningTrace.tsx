import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Brain,
  Lightbulb,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningStep {
  step: number;
  thought: string;
  action: string;
  observation: string;
  status?: "success" | "error" | "pending";
}

interface ReasoningTraceProps {
  traceId?: string;
  steps: ReasoningStep[];
  toolsConsidered?: string[];
  toolsUsed?: string[];
  confidenceScore?: number;
  decisionSummary?: string;
  className?: string;
}

export function ReasoningTrace({
  traceId,
  steps,
  toolsConsidered,
  toolsUsed,
  confidenceScore,
  decisionSummary,
  className,
}: ReasoningTraceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />;
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 text-muted-foreground hover:text-foreground", className)}
        >
          <Brain className="h-4 w-4" />
          <span className="text-xs">Show reasoning ({steps.length} steps)</span>
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Reasoning Trace
              </CardTitle>
              {confidenceScore !== undefined && (
                <Badge
                  variant={
                    confidenceScore >= 0.8
                      ? "default"
                      : confidenceScore >= 0.5
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {Math.round(confidenceScore * 100)}% confidence
                </Badge>
              )}
            </div>
            {decisionSummary && (
              <p className="text-xs text-muted-foreground mt-1">{decisionSummary}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Tools Summary */}
            {(toolsConsidered?.length || toolsUsed?.length) && (
              <div className="flex flex-wrap gap-2 pb-3 border-b">
                {toolsUsed?.map((tool) => (
                  <Badge key={tool} variant="default" className="text-xs gap-1">
                    <Zap className="h-3 w-3" />
                    {tool.replace(/_/g, " ")}
                  </Badge>
                ))}
                {toolsConsidered
                  ?.filter((t) => !toolsUsed?.includes(t))
                  .map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs opacity-50">
                      {tool.replace(/_/g, " ")}
                    </Badge>
                  ))}
              </div>
            )}

            {/* Reasoning Steps */}
            <div className="space-y-2">
              {steps.map((step) => (
                <Collapsible
                  key={step.step}
                  open={expandedSteps.includes(step.step)}
                  onOpenChange={() => toggleStep(step.step)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{step.step}
                        </span>
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          {step.thought}
                        </p>
                      </div>
                      {expandedSteps.includes(step.step) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-[68px] pb-2 space-y-2">
                      <div className="flex items-start gap-2">
                        <Zap className="h-3 w-3 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Action</p>
                          <p className="text-sm">{step.action}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Eye className="h-3 w-3 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Observation
                          </p>
                          <p className="text-sm">{step.observation}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
