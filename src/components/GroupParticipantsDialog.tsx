import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, UserPlus, Bot } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  image_url?: string | null;
  role?: string;
  type: 'agent' | 'user';
}

interface GroupParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  workspaceId: string;
  userId: string;
  isOwner: boolean;
}

export const GroupParticipantsDialog = ({
  open,
  onOpenChange,
  chatId,
  workspaceId,
  userId,
  isOwner,
}: GroupParticipantsDialogProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchParticipants();
      fetchAvailableAgents();
    }
  }, [open, chatId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // Fetch agent participants
      const { data: chatAgents } = await supabase
        .from('chat_agents')
        .select(`
          agent:agents(id, name, image_url)
        `)
        .eq('chat_id', chatId);

      const agents = chatAgents?.map((ca: any) => ({
        id: ca.agent.id,
        name: ca.agent.name,
        image_url: ca.agent.image_url,
        type: 'agent' as const,
      })) || [];

      setParticipants(agents);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const { data: installations } = await supabase
        .from('agent_installations')
        .select(`
          agent:agents(id, name, image_url)
        `)
        .eq('user_id', userId);

      // Filter out agents already in the chat
      const currentAgentIds = new Set(participants.map(p => p.id));
      const available = installations
        ?.map((i: any) => ({
          id: i.agent.id,
          name: i.agent.name,
          image_url: i.agent.image_url,
          type: 'agent' as const,
        }))
        .filter(a => !currentAgentIds.has(a.id)) || [];

      setAvailableAgents(available);
    } catch (error) {
      console.error('Error fetching available agents:', error);
    }
  };

  const handleAddAgent = async (agentId: string) => {
    setAdding(true);
    try {
      const { error } = await supabase
        .from('chat_agents')
        .insert({
          chat_id: chatId,
          agent_id: agentId,
          added_by: userId,
        });

      if (error) throw error;

      toast({
        title: 'Agent added',
        description: 'Agent has been added to the group',
      });

      fetchParticipants();
      fetchAvailableAgents();
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add agent to group',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('chat_agents')
        .delete()
        .eq('chat_id', chatId)
        .eq('agent_id', participantId);

      if (error) throw error;

      toast({
        title: 'Agent removed',
        description: 'Agent has been removed from the group',
      });

      fetchParticipants();
      fetchAvailableAgents();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove participant',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Group Participants</DialogTitle>
          <DialogDescription>
            Add or remove agents from this group chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Participants ({participants.length})</h4>
            <ScrollArea className="h-48 border rounded-md p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : participants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No participants yet
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">{participant.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {participant.type}
                        </Badge>
                      </div>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {isOwner && availableAgents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Add Agents</h4>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {availableAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm">{agent.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddAgent(agent.id)}
                        disabled={adding}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
