import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, X } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  image_url: string | null;
}

interface GroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  workspaceId: string;
  onGroupCreated: () => void;
  editingGroup?: {
    id: string;
    name: string;
    agentIds: string[];
  } | null;
}

export const GroupChatDialog = ({ 
  open, 
  onOpenChange, 
  userId, 
  workspaceId, 
  onGroupCreated,
  editingGroup 
}: GroupChatDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableAgents();
      if (editingGroup) {
        setGroupName(editingGroup.name);
        setSelectedAgents(editingGroup.agentIds);
      } else {
        setGroupName("");
        setSelectedAgents([]);
      }
    }
  }, [open, editingGroup]);

  const fetchAvailableAgents = async () => {
    setLoading(true);
    try {
      const { data: installations, error } = await supabase
        .from('agent_installations')
        .select(`
          agent:agents(id, name, image_url)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const agents = installations?.map(i => i.agent).filter(Boolean) || [];
      setAvailableAgents(agents as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch available agents',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a group name',
      });
      return;
    }

    if (selectedAgents.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least 2 agents for a group chat',
      });
      return;
    }

    setCreating(true);
    try {
      if (editingGroup) {
        // Update existing group
        await supabase
          .from('chats')
          .update({ name: groupName })
          .eq('id', editingGroup.id);

        // Remove existing agents
        await supabase
          .from('chat_agents')
          .delete()
          .eq('chat_id', editingGroup.id);

        // Add new agents
        await supabase
          .from('chat_agents')
          .insert(
            selectedAgents.map(agentId => ({
              chat_id: editingGroup.id,
              agent_id: agentId,
              added_by: userId,
            }))
          );

        toast({
          title: 'Success',
          description: 'Group chat updated successfully',
        });
      } else {
        // Create new group chat
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .insert({
            workspace_id: workspaceId,
            type: 'group',
            name: groupName,
            created_by: userId,
          })
          .select()
          .single();

        if (chatError) throw chatError;

        // Add user as participant
        await supabase.from('chat_participants').insert({
          chat_id: chat.id,
          user_id: userId,
        });

        // Add selected agents to the chat
        await supabase
          .from('chat_agents')
          .insert(
            selectedAgents.map(agentId => ({
              chat_id: chat.id,
              agent_id: agentId,
              added_by: userId,
            }))
          );

        toast({
          title: 'Success',
          description: 'Group chat created successfully',
        });
      }

      onGroupCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating/updating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create/update group chat',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {editingGroup ? 'Edit Group Chat' : 'Create Group Chat'}
          </DialogTitle>
          <DialogDescription>
            {editingGroup 
              ? 'Update the group name and members'
              : 'Create a group chat with multiple AI agents'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Marketing Team, Support Squad"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Agents ({selectedAgents.length} selected)</Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No agents installed. Install agents from the AI Talent Pool first.
              </p>
            ) : (
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-2">
                  {availableAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <Checkbox
                        checked={selectedAgents.includes(agent.id)}
                        onCheckedChange={() => toggleAgent(agent.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {agent.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              disabled={creating || selectedAgents.length < 2 || !groupName.trim()}
            >
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
