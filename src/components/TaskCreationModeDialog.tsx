import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Edit3 } from "lucide-react";

interface TaskCreationModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: "brian" | "manual") => void;
}

export const TaskCreationModeDialog = ({ open, onOpenChange, onSelectMode }: TaskCreationModeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Choose how you'd like to create your task</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              onSelectMode("brian");
              onOpenChange(false);
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Assisted</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Chat with Brian, your AI helper bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Step-by-step guidance</li>
                <li>• Suggested automations</li>
                <li>• Smart recommendations</li>
                <li>• Best for complex tasks</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              onSelectMode("manual");
              onOpenChange(false);
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Edit3 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle>Manual Mode</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Create and configure everything yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Full control</li>
                <li>• Custom automations</li>
                <li>• Advanced options</li>
                <li>• Best for experienced users</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
