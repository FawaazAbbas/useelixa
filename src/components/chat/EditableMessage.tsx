import { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditableMessageProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  className?: string;
}

export const EditableMessage = ({ content, onSave, onCancel, className }: EditableMessageProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== content) {
      onSave(editedContent.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => {
          setEditedContent(e.target.value);
          // Auto-resize
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none"
        placeholder="Edit your message..."
      />
      <div className="flex items-center gap-2 mt-2">
        <Button size="sm" onClick={handleSave} disabled={!editedContent.trim()}>
          <Check className="h-4 w-4 mr-1" />
          Save & Resend
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          ⌘/Ctrl + Enter to save, Esc to cancel
        </span>
      </div>
    </div>
  );
};

interface EditButtonProps {
  onClick: () => void;
  className?: string;
}

export const EditButton = ({ onClick, className }: EditButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={onClick}
      title="Edit message"
    >
      <Pencil className="h-3 w-3" />
    </Button>
  );
};

export default EditableMessage;
