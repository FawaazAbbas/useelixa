import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && selectedFiles.length === 0) || disabled) return;
    onSend(input.trim(), selectedFiles.length > 0 ? selectedFiles : undefined);
    setInput("");
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-4">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 hover:bg-destructive/10"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-end gap-2 bg-muted/50 rounded-2xl border border-border focus-within:border-primary/50 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
          
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 ml-1 mb-1 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Message Elixa..."}
            disabled={disabled}
            className="flex-1 min-h-[44px] max-h-[200px] py-3 px-0 bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            rows={1}
          />

          <Button
            size="icon"
            className="h-10 w-10 mr-1 mb-1 rounded-xl"
            onClick={handleSend}
            disabled={disabled || (!input.trim() && selectedFiles.length === 0)}
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Elixa can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};
