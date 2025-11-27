import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Users, MessageSquare, Plus } from 'lucide-react';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDirect: () => void;
  onCreateGroup: () => void;
}

export const NewChatDialog = ({
  open,
  onOpenChange,
  onCreateDirect,
  onCreateGroup,
}: NewChatDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Choose the type of conversation you want to start
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Button
            variant="outline"
            className="h-20 justify-start"
            onClick={() => {
              onCreateDirect();
              onOpenChange(false);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Direct Chat</div>
                <div className="text-sm text-muted-foreground">
                  Start a 1-on-1 conversation with an agent
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 justify-start"
            onClick={() => {
              onCreateGroup();
              onOpenChange(false);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Group Chat</div>
                <div className="text-sm text-muted-foreground">
                  Create a group with multiple agents
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
