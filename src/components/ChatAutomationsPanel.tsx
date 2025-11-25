import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatAutomationDialog } from './ChatAutomationDialog';

interface Automation {
  id: string;
  name: string;
  action: string;
  trigger: string;
  status: string | null;
  chain_order: number | null;
  agent_id: string | null;
  last_executed_at: string | null;
  agent?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface ChatAutomationsPanelProps {
  chatId: string;
  userId: string;
  workspaceId: string;
}

export const ChatAutomationsPanel = ({ chatId, userId, workspaceId }: ChatAutomationsPanelProps) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAutomations = async () => {
    const { data, error } = await supabase
      .from('automations')
      .select(`
        *,
        agent:agents(id, name, image_url)
      `)
      .eq('chat_id', chatId)
      .order('chain_order', { ascending: true });

    if (error) {
      console.error('Error fetching automations:', error);
    } else {
      setAutomations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAutomations();

    const channel = supabase
      .channel('chat-automations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automations',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchAutomations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const handleExecuteChain = async () => {
    if (automations.length === 0) {
      toast({
        title: 'No Automations',
        description: 'Add automations to this chat first.',
        variant: 'destructive',
      });
      return;
    }

    setExecuting('chain');
    try {
      const { data, error } = await supabase.functions.invoke('execute-automation-chain', {
        body: {
          chat_id: chatId,
          user_id: userId,
          workspace_id: workspaceId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Chain Executed',
        description: data?.message || 'Automation chain completed successfully',
      });
    } catch (error) {
      console.error('Execute chain error:', error);
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Failed to execute chain',
        variant: 'destructive',
      });
    } finally {
      setExecuting(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('automations').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Deleted', description: 'Automation deleted successfully' });
      fetchAutomations();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Chat Automations</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Automations that run in this chat context
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : automations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No automations yet. Click Add to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{automation.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {automation.action}
                      </CardDescription>
                    </div>
                    <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                      {automation.status || 'active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <p>Trigger: {automation.trigger}</p>
                      {automation.agent && (
                        <p className="mt-1">Agent: {automation.agent.name}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingAutomation(automation)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(automation.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {automations.length > 0 && (
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={handleExecuteChain}
            disabled={executing === 'chain'}
          >
            <Play className="w-4 h-4 mr-2" />
            {executing === 'chain' ? 'Executing...' : 'Execute Chain'}
          </Button>
        </div>
      )}

      {showAddDialog && (
        <ChatAutomationDialog
          chatId={chatId}
          workspaceId={workspaceId}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchAutomations();
          }}
        />
      )}

      {editingAutomation && (
        <ChatAutomationDialog
          chatId={chatId}
          workspaceId={workspaceId}
          automation={editingAutomation}
          onClose={() => setEditingAutomation(null)}
          onSuccess={() => {
            setEditingAutomation(null);
            fetchAutomations();
          }}
        />
      )}
    </div>
  );
};
