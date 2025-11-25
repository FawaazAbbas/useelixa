import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  description: string | null;
}

interface Automation {
  id: string;
  name: string;
  action: string;
  trigger: string;
  agent_id: string | null;
}

interface ChatAutomationDialogProps {
  chatId: string;
  workspaceId: string;
  automation?: Automation;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChatAutomationDialog = ({
  chatId,
  workspaceId,
  automation,
  onClose,
  onSuccess,
}: ChatAutomationDialogProps) => {
  const [name, setName] = useState(automation?.name || '');
  const [action, setAction] = useState(automation?.action || '');
  const [trigger, setTrigger] = useState(automation?.trigger || 'manual');
  const [agentId, setAgentId] = useState(automation?.agent_id || '');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase
        .from('agent_installations')
        .select('agent:agents(id, name, description)')
        .eq('workspace_id', workspaceId);

      if (data) {
        setAgents(data.map(d => d.agent).filter(Boolean));
      }
    };
    fetchAgents();
  }, [workspaceId]);

  const handleSave = async () => {
    if (!name.trim() || !action.trim() || !agentId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (automation) {
        const { error } = await supabase
          .from('automations')
          .update({
            name: name.trim(),
            action: action.trim(),
            trigger,
            agent_id: agentId,
          })
          .eq('id', automation.id);

        if (error) throw error;
      } else {
        const { data: maxOrder } = await supabase
          .from('automations')
          .select('chain_order')
          .eq('chat_id', chatId)
          .order('chain_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (maxOrder?.chain_order || 0) + 1;

        const { error } = await supabase.from('automations').insert({
          name: name.trim(),
          action: action.trim(),
          trigger,
          agent_id: agentId,
          chat_id: chatId,
          workspace_id: workspaceId,
          chain_order: nextOrder,
          status: 'active',
        });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: automation ? 'Automation updated' : 'Automation created',
      });
      onSuccess();
    } catch (error) {
      console.error('Save automation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save automation',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{automation ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Automation Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Daily News Scan"
            />
          </div>

          <div>
            <Label htmlFor="action">Action / Instruction</Label>
            <Textarea
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Scan top news sources and summarize key headlines"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger id="trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="on_message">On Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="agent">Assigned Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger id="agent">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
