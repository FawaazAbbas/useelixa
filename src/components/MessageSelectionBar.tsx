import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

interface MessageSelectionBarProps {
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
}

export const MessageSelectionBar = ({
  selectedCount,
  onCancel,
  onDelete,
}: MessageSelectionBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="font-semibold">
            {selectedCount} message{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};
