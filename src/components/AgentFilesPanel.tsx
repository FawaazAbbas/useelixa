import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface AgentDocument {
  id: string;
  document_id: string;
  document: {
    id: string;
    name: string;
    file_size: number;
    file_type: string;
  };
}

interface WorkspaceDocument {
  id: string;
  name: string;
  file_size: number;
  file_type: string;
}

interface AgentFilesPanelProps {
  agentInstallationId: string;
  workspaceId: string;
}

export const AgentFilesPanel = ({ agentInstallationId, workspaceId }: AgentFilesPanelProps) => {
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<WorkspaceDocument[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('agent_documents')
      .select(`
        id,
        document_id,
        document:workspace_documents(id, name, file_size, file_type)
      `)
      .eq('agent_installation_id', agentInstallationId);

    if (!error && data) {
      setDocuments(data as any);
    }
    setLoading(false);
  };

  const fetchAvailableDocuments = async () => {
    const { data } = await supabase
      .from('workspace_documents')
      .select('id, name, file_size, file_type')
      .eq('workspace_id', workspaceId);

    if (data) {
      const assignedIds = documents.map(d => d.document_id);
      setAvailableDocuments(data.filter(d => !assignedIds.includes(d.id)));
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [agentInstallationId]);

  useEffect(() => {
    if (showAddDialog) {
      fetchAvailableDocuments();
    }
  }, [showAddDialog, documents]);

  const handleAdd = async () => {
    if (!selectedDocId) return;

    setAdding(true);
    try {
      const { error } = await supabase.from('agent_documents').insert({
        agent_installation_id: agentInstallationId,
        document_id: selectedDocId,
      });

      if (error) throw error;

      toast({
        title: 'Added',
        description: 'Document added to agent',
      });
      setShowAddDialog(false);
      setSelectedDocId('');
      fetchDocuments();
    } catch (error) {
      console.error('Add document error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add document',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('agent_documents').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Deleted', description: 'Document removed from agent' });
      fetchDocuments();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Agent Files</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Files only this agent can access
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No agent-specific files yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <CardTitle className="text-sm">{doc.document.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatFileSize(doc.document.file_size)} • {doc.document.file_type}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document to Agent</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="document">Select Document</Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger id="document">
                  <SelectValue placeholder="Choose a document" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} ({formatFileSize(doc.file_size)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={adding || !selectedDocId}>
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
