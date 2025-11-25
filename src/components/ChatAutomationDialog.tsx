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
  const [scheduleType, setScheduleType] = useState('manual');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
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

  const toggleDay = (day: number) => {
    setScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

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
      const updateData: any = {
        name: name.trim(),
        action: action.trim(),
        trigger,
        agent_id: agentId,
        schedule_type: scheduleType,
      };

      if (scheduleType !== 'manual') {
        updateData.schedule_time = scheduleTime;
        if (scheduleType === 'weekly') {
          updateData.schedule_days = scheduleDays;
        }
        if (scheduleType === 'interval') {
          updateData.schedule_interval_minutes = intervalMinutes;
        }
      }

      if (automation) {
        const { error } = await supabase
          .from('automations')
          .update(updateData)
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
          ...updateData,
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
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger id="scheduleType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (Run on demand)</SelectItem>
                <SelectItem value="interval">Interval (Every X minutes)</SelectItem>
                <SelectItem value="daily">Daily (At specific time)</SelectItem>
                <SelectItem value="weekly">Weekly (Specific days & time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scheduleType !== 'manual' && (
            <>
              <div>
                <Label htmlFor="scheduleTime">Time of Day</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>

              {scheduleType === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <Button
                        key={day}
                        type="button"
                        size="sm"
                        variant={scheduleDays.includes(i) ? 'default' : 'outline'}
                        onClick={() => toggleDay(i)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {scheduleType === 'interval' && (
                <div>
                  <Label htmlFor="intervalMinutes">Run Every (minutes)</Label>
                  <Input
                    id="intervalMinutes"
                    type="number"
                    min={5}
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 5)}
                  />
                </div>
              )}
            </>
          )}

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
