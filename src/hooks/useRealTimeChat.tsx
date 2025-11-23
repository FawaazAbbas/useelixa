import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  user_id: string | null;
  agent_id: string | null;
  created_at: string;
  error_message?: string | null;
}

interface Chat {
  id: string;
  name: string | null;
  type: string;
  agent_id: string | null;
  last_activity: string;
  agent?: {
    id: string;
    name: string;
    image_url: string | null;
  };
  agents?: Array<{
    id: string;
    name: string;
    image_url: string | null;
  }>;
}

export const useRealTimeChat = (userId: string | undefined, workspaceId: string | undefined) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Fetch user's chats (both direct and group)
  const fetchChats = useCallback(async () => {
    if (!userId || !workspaceId) return;

    // Fetch direct chats from installed agents
    const { data: installations } = await supabase
      .from('agent_installations')
      .select(`
        id,
        agent:agents(id, name, image_url)
      `)
      .eq('user_id', userId);

    const directChatPromises = (installations || []).map(async (inst) => {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('agent_id', inst.agent.id)
        .eq('type', 'direct')
        .single();

      if (existingChat) {
        return { ...existingChat, agent: inst.agent };
      }

      // Create new direct chat
      const { data: newChat } = await supabase
        .from('chats')
        .insert({
          workspace_id: workspaceId,
          agent_id: inst.agent.id,
          type: 'direct',
          name: inst.agent.name,
          created_by: userId,
        })
        .select()
        .single();

      if (newChat) {
        await supabase.from('chat_participants').insert({
          chat_id: newChat.id,
          user_id: userId,
        });

        return { ...newChat, agent: inst.agent };
      }
      return null;
    });

    // Fetch group chats
    const { data: groupChats } = await supabase
      .from('chats')
      .select(`
        *,
        chat_agents(
          agent:agents(id, name, image_url)
        )
      `)
      .eq('workspace_id', workspaceId)
      .eq('type', 'group')
      .order('last_activity', { ascending: false });

    const resolvedDirectChats = await Promise.all(directChatPromises);
    const allDirectChats = resolvedDirectChats.filter(Boolean) as Chat[];

    const allGroupChats = (groupChats || []).map(chat => ({
      ...chat,
      agents: chat.chat_agents?.map((ca: any) => ca.agent).filter(Boolean) || []
    }));

    setChats([...allDirectChats, ...allGroupChats]);
    setLoading(false);
  }, [userId, workspaceId]);

  // Fetch messages for a chat
  const fetchMessages = useCallback(async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }, []);

  // Send message (handles both direct and group chats)
  const sendMessage = useCallback(async (chatId: string, agentIdOrIds: string | string[], content: string, chatType: 'direct' | 'group' = 'direct') => {
    if (!userId || !content.trim()) return;

    setSending(true);

    try {
      // Save user message
      const { data: userMessage, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: content.trim(),
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Add to messages immediately
      setMessages(prev => [...prev, userMessage]);

      // Call agent via edge function
      const { data, error } = await supabase.functions.invoke('route-to-agent', {
        body: {
          message: content.trim(),
          chat_id: chatId,
          agent_id: chatType === 'direct' ? agentIdOrIds : null,
          agent_ids: chatType === 'group' ? agentIdOrIds : null,
          user_id: userId,
          workspace_id: workspaceId,
          chat_type: chatType,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Agent Error',
          description: error.message || 'Failed to get response from agent',
        });
      } else if (data?.messages) {
        // Multiple agent responses for group chat
        setMessages(prev => [...prev, ...data.messages]);
      } else if (data?.message) {
        // Single agent response
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  }, [userId, toast]);

  // Subscribe to real-time messages and chats
  useEffect(() => {
    if (!userId) return;

    fetchChats();

    const channel = supabase
      .channel('workspace-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
        },
        () => {
          // Refresh chats when a new chat is created
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchChats]);

  return {
    chats,
    messages,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    refreshChats: fetchChats,
  };
};
