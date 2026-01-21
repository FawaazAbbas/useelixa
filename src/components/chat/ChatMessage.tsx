import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { ToolExecutionCard } from "@/components/chat/ToolExecutionCard";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ElixaLogo } from "@/components/ElixaLogo";

interface ToolExecution {
  toolName: string;
  success: boolean;
  executionTimeMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: {
    files?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    toolExecutions?: ToolExecution[];
  };
  isStreaming?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  metadata,
  isStreaming,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group py-6 ${role === "assistant" ? "bg-muted/30" : ""}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4">
          {role === "assistant" ? (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <ElixaLogo size={18} />
            </div>
          ) : (
            <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                You
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {role === "assistant" ? "Elixa" : "You"}
              </span>
              {timestamp && (
                <span className="text-xs text-muted-foreground">
                  {new Date(timestamp).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            <div
              className="prose prose-sm dark:prose-invert max-w-none 
                [&>p]:mb-3 [&>p]:leading-relaxed
                [&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc
                [&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal
                [&_li]:mb-1.5
                [&_strong]:font-semibold
                [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic
                [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse rounded-sm" />
            )}

            {metadata?.toolExecutions && metadata.toolExecutions.length > 0 && (
              <ToolExecutionCard executions={metadata.toolExecutions} />
            )}

            {metadata?.files && (
              <FileMessageCard
                files={metadata.files}
                senderName={role === "user" ? "You" : "Elixa"}
              />
            )}

            {role === "assistant" && content && !isStreaming && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
