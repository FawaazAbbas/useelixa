import { useState } from "react";
import { X, Loader2, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EmailComposeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (to: string, subject: string, body: string, cc?: string, bcc?: string) => Promise<void>;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  mode?: "compose" | "reply" | "forward";
}

export const EmailCompose = ({
  open,
  onOpenChange,
  onSend,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  mode = "compose",
}: EmailComposeProps) => {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;

    setIsSending(true);
    try {
      await onSend(to, subject, body, cc || undefined, bcc || undefined);
      // Reset form and close
      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSending(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "reply":
        return "Reply";
      case "forward":
        return "Forward";
      default:
        return "New Message";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl max-h-[80vh] flex flex-col",
          isMinimized && "h-14 overflow-hidden"
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>{getTitle()}</DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <div className="flex-1 overflow-auto space-y-4">
            {/* To field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="to">To</Label>
                {!showCcBcc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 px-1 text-xs text-muted-foreground"
                    onClick={() => setShowCcBcc(true)}
                  >
                    Cc/Bcc
                  </Button>
                )}
              </div>
              <Input
                id="to"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* Cc/Bcc fields */}
            {showCcBcc && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cc">Cc</Label>
                  <Input
                    id="cc"
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bcc">Bcc</Label>
                  <Input
                    id="bcc"
                    placeholder="bcc@example.com"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Subject field */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Body field */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                {/* Could add attachment button here */}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Discard
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!to.trim() || !subject.trim() || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
