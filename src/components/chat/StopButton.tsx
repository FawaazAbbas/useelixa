import { Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StopButtonProps {
  onStop: () => void;
  className?: string;
}

export const StopButton = ({ onStop, className }: StopButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStop}
      className={cn(
        "gap-2 animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
    >
      <Square className="h-3.5 w-3.5 fill-current" />
      <span>Stop generating</span>
    </Button>
  );
};

export default StopButton;
