import { useState, useEffect, createElement } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Briefcase, Target, AlertCircle, Trash2, Globe, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Memory {
  id: string;
  category: string;
  key: string;
  value: string;
  scope: 'workspace' | 'chat';
  created_at: string;
  updated_at: string;
}

interface ChatMemoriesPanelProps {
  chatId?: string;
  workspaceId: string;
  agentInstallationId?: string;
}

const categoryIcons: Record<string, any> = {
  work_style: Briefcase,
  preferences: Brain,
  goals: Target,
  context: AlertCircle,
  custom: MessageSquare
};

const categoryColors: Record<string, string> = {
  work_style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  preferences: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  goals: "bg-green-500/10 text-green-500 border-green-500/20",
  context: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  custom: "bg-gray-500/10 text-gray-500 border-gray-500/20"
};

export function ChatMemoriesPanel({ chatId, workspaceId, agentInstallationId }: ChatMemoriesPanelProps) {
  const [workspaceMemories, setWorkspaceMemories] = useState<Memory[]>([]);
  const [chatMemories, setChatMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Demo mode: check if IDs are mock IDs
  const isDemoMode = !agentInstallationId || (chatId && (chatId.startsWith('chat-mock') || chatId.startsWith('group-')));

  useEffect(() => {
    fetchMemories();
  }, [chatId, workspaceId, agentInstallationId]);

  const fetchMemories = async () => {
    if (isDemoMode) {
      // In demo mode, show empty memories
      setWorkspaceMemories([]);
      setChatMemories([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);

      // Fetch workspace memories
      let workspaceQuery = supabase
        .from('workspace_agent_memories')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (agentInstallationId) {
        workspaceQuery = workspaceQuery.or(`agent_installation_id.eq.${agentInstallationId},agent_installation_id.is.null`);
      }

      const { data: workspaceData, error: workspaceError } = await workspaceQuery;

      if (workspaceError) throw workspaceError;
      setWorkspaceMemories(workspaceData?.map(m => ({ ...m, scope: 'workspace' as const })) || []);

      // Fetch chat memories if chatId is provided
      if (chatId) {
        let chatQuery = supabase
          .from('chat_agent_memories')
          .select('*')
          .eq('chat_id', chatId)
          .order('updated_at', { ascending: false });

        if (agentInstallationId) {
          chatQuery = chatQuery.or(`agent_installation_id.eq.${agentInstallationId},agent_installation_id.is.null`);
        }

        const { data: chatData, error: chatError } = await chatQuery;

        if (chatError) throw chatError;
        setChatMemories(chatData?.map(m => ({ ...m, scope: 'chat' as const })) || []);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error loading memories",
        description: error instanceof Error ? error.message : "Failed to load agent memories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (memoryId: string, scope: 'workspace' | 'chat') => {
    try {
      const table = scope === 'workspace' ? 'workspace_agent_memories' : 'chat_agent_memories';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', memoryId);

      if (error) throw error;

      toast({
        title: "Memory deleted",
        description: "The agent will no longer remember this information"
      });

      fetchMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error deleting memory",
        description: error instanceof Error ? error.message : "Failed to delete memory",
        variant: "destructive"
      });
    }
  };

  const renderMemoryCard = (memory: Memory) => {
    const Icon = categoryIcons[memory.category] || MessageSquare;
    const colorClass = categoryColors[memory.category] || categoryColors.custom;

    return (
      <Card key={memory.id} className="group hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">{memory.key.replace(/_/g, ' ')}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {memory.scope === 'workspace' ? (
                      <><Globe className="h-3 w-3 mr-1" />Company-wide</>
                    ) : (
                      <><MessageSquare className="h-3 w-3 mr-1" />This chat only</>
                    )}
                  </Badge>
                  <span>{formatDistanceToNow(new Date(memory.updated_at), { addSuffix: true })}</span>
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => deleteMemory(memory.id, memory.scope)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{memory.value}</p>
        </CardContent>
      </Card>
    );
  };

  const groupMemoriesByCategory = (memories: Memory[]) => {
    return memories.reduce((acc, memory) => {
      if (!acc[memory.category]) {
        acc[memory.category] = [];
      }
      acc[memory.category].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <Brain className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  const allMemories = [...workspaceMemories, ...chatMemories];

  if (allMemories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Brain className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Memories Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Share your work preferences, communication style, or goals with your agent. 
          When you share important information, they'll ask "Would you like me to remember this?"
        </p>
        <div className="space-y-2 text-left max-w-md">
          <p className="text-xs text-muted-foreground">
            <strong>Example:</strong> "I prefer meetings in the morning and detailed weekly reports in PDF format"
          </p>
          <p className="text-xs text-muted-foreground">
            Your agent will offer to remember this and apply it to future interactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Agent Memories
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          What this agent remembers about your preferences and work style
        </p>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({allMemories.length})
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Company-wide ({workspaceMemories.length})
          </TabsTrigger>
          {chatId && (
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3" />
              This Chat ({chatMemories.length})
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="p-4 space-y-3 mt-0">
            {Object.entries(groupMemoriesByCategory(allMemories)).map(([category, memories]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground capitalize flex items-center gap-2">
                  {createElement(categoryIcons[category] || MessageSquare, { className: "h-4 w-4" })}
                  {category.replace(/_/g, ' ')}
                </h4>
                {memories.map(renderMemoryCard)}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="workspace" className="p-4 space-y-3 mt-0">
            {workspaceMemories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No company-wide memories yet</p>
              </div>
            ) : (
              Object.entries(groupMemoriesByCategory(workspaceMemories)).map(([category, memories]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground capitalize flex items-center gap-2">
                    {createElement(categoryIcons[category] || MessageSquare, { className: "h-4 w-4" })}
                    {category.replace(/_/g, ' ')}
                  </h4>
                  {memories.map(renderMemoryCard)}
                </div>
              ))
            )}
          </TabsContent>

          {chatId && (
            <TabsContent value="chat" className="p-4 space-y-3 mt-0">
              {chatMemories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat-specific memories yet</p>
                </div>
              ) : (
                Object.entries(groupMemoriesByCategory(chatMemories)).map(([category, memories]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground capitalize flex items-center gap-2">
                      {createElement(categoryIcons[category] || MessageSquare, { className: "h-4 w-4" })}
                      {category.replace(/_/g, ' ')}
                    </h4>
                    {memories.map(renderMemoryCard)}
                  </div>
                ))
              )}
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
