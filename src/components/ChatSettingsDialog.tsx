import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSettingsDialogProps {
  chatId: string;
  chatType: 'direct' | 'group';
  agentId?: string | null;
  agentInstallationId?: string;
  currentName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

interface AgentDocument {
  id: string;
  document_id: string;
  document: {
    id: string;
    name: string;
    file_size: number;
  };
}

export const ChatSettingsDialog = ({
  chatId,
  chatType,
  agentId,
  agentInstallationId,
  currentName,
  onClose,
  onDeleted,
}: ChatSettingsDialogProps) => {
  const [customName, setCustomName] = useState(currentName);
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (agentInstallationId) {
      fetchAgentDocuments();
    }
  }, [agentInstallationId]);

  const fetchAgentDocuments = async () => {
    if (!agentInstallationId) return;

    const { data, error } = await supabase
      .from('agent_documents')
      .select(`
        id,
        document_id,
        document:workspace_documents(id, name, file_size)
      `)
      .eq('agent_installation_id', agentInstallationId);

    if (!error && data) {
      setDocuments(data as any);
    }
  };

  const handleSaveCustomName = async () => {
    if (!agentInstallationId || !customName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('agent_installations')
        .update({ custom_name: customName.trim() })
        .eq('id', agentInstallationId);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: 'Agent name updated successfully',
      });
    } catch (error) {
      console.error('Update name error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent name',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const { error } = await supabase
      .from('agent_documents')
      .delete()
      .eq('id', docId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Deleted', description: 'Document removed from agent' });
      fetchAgentDocuments();
    }
  };

  const handleDeleteAgent = async () => {
    try {
      if (chatType === 'direct' && agentInstallationId) {
        const { error } = await supabase
          .from('agent_installations')
          .delete()
          .eq('id', agentInstallationId);

        if (error) throw error;
      } else if (chatType === 'group' && agentId) {
        const { error } = await supabase
          .from('chat_agents')
          .delete()
          .eq('chat_id', chatId)
          .eq('agent_id', agentId);

        if (error) throw error;
      }

      toast({
        title: 'Deleted',
        description: 'Agent removed successfully',
      });
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('Delete agent error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>
              Manage agent settings and knowledge for this chat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {chatType === 'direct' && agentInstallationId && (
              <div>
                <Label htmlFor="custom-name">Custom Agent Name</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="custom-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={currentName}
                  />
                  <Button
                    onClick={handleSaveCustomName}
                    disabled={saving || !customName.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {agentInstallationId && (
              <>
                <Separator />
                <div>
                  <Label>Agent-Specific Documents</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Files only this agent can access
                  </p>
                  <ScrollArea className="h-[200px] border rounded-md p-3">
                    {documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No agent-specific documents
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{doc.document.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </>
            )}

            <Separator />

            <div>
              <Label className="text-destructive">Danger Zone</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Remove this agent from the chat
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the agent from this chat. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
