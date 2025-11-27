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
  metadata?: {
    files?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
  };
}

interface Chat {
  id: string;
  name: string | null;
  type: string;
  agent_id: string | null;
  last_activity: string;
  agent_installation_id?: string;
  custom_name?: string;
  unread_count?: number;
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

  // Fetch unread counts for all chats
  const fetchUnreadCounts = useCallback(async () => {
    if (!userId || !workspaceId) return;

    const { data: chatList } = await supabase
      .from('chats')
      .select('id')
      .eq('workspace_id', workspaceId);

    if (!chatList) return;

    const unreadCounts: Record<string, number> = {};
    
    for (const chat of chatList) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chat.id)
        .eq('read', false)
        .is('user_id', null); // Only agent messages

      unreadCounts[chat.id] = count || 0;
    }

    setChats(prev => prev.map(chat => ({
      ...chat,
      unread_count: unreadCounts[chat.id] || 0
    })));
  }, [userId, workspaceId]);

  // Fetch user's chats (both direct and group)
  const fetchChats = useCallback(async () => {
    if (!userId || !workspaceId) return;

    // Fetch direct chats from installed agents
    const { data: installations } = await supabase
      .from('agent_installations')
      .select(`
        id,
        custom_name,
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
        return { 
          ...existingChat, 
          agent: inst.agent,
          agent_installation_id: inst.id,
          custom_name: inst.custom_name
        };
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

        return { 
          ...newChat, 
          agent: inst.agent,
          agent_installation_id: inst.id,
          custom_name: inst.custom_name
        };
      }
      return null;
    });

    // Fetch group chats WHERE USER IS A PARTICIPANT
    const { data: groupChats } = await supabase
      .from('chats')
      .select(`
        *,
        chat_agents(
          agent:agents(id, name, image_url)
        ),
        chat_participants!inner(user_id)
      `)
      .eq('workspace_id', workspaceId)
      .eq('type', 'group')
      .eq('chat_participants.user_id', userId)
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
        setMessages(data.map(msg => ({
          ...msg,
          metadata: msg.metadata as Message['metadata']
        })));
        
        // Mark agent messages as read
        await supabase.rpc('mark_messages_read', {
          p_chat_id: chatId,
          p_user_id: userId
        });
        
        // Update unread count for this chat
        await fetchUnreadCounts();
      }
  }, [userId]);

  // Send message (handles both direct and group chats)
  const sendMessage = useCallback(async (
    chatId: string, 
    agentIdOrIds: string | string[], 
    content: string, 
    chatType: 'direct' | 'group' = 'direct',
    metadata?: { files?: Array<{ name: string; url: string; type: string; size: number }> }
  ) => {
    if (!userId || !content.trim()) return;

    setSending(true);

    try {
      // Save user message (mark as read by default)
      const { data: userMessage, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: content.trim(),
          read: true, // User's own messages are always read
          metadata: metadata || null,
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Add to messages immediately
      setMessages((prev: Message[]) => [...prev, userMessage as Message]);

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
        const typedMessages: Message[] = data.messages.map((msg: any) => ({
          ...msg,
          metadata: msg.metadata as Message['metadata']
        }));
        setMessages((prev: Message[]) => [...prev, ...typedMessages]);
      } else if (data?.message) {
        // Single agent response
        const typedMessage: Message = {
          ...data.message,
          metadata: data.message.metadata as Message['metadata']
        };
        setMessages((prev: Message[]) => [...prev, typedMessage]);
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
    fetchUnreadCounts();

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
          const newMessage = payload.new as any;
          setMessages((prev: Message[]) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            const typedMessage: Message = {
              ...newMessage,
              metadata: newMessage.metadata as Message['metadata']
            };
            return [...prev, typedMessage];
          });
          
          // Refresh unread counts when new message arrives
          if (!newMessage.user_id) { // Only for agent messages
            fetchUnreadCounts();
          }
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
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_participants',
        },
        (payload) => {
          // If current user was removed from a chat, remove it from state
          const deletedParticipant = payload.old as any;
          if (deletedParticipant.user_id === userId) {
            setChats((prev) => prev.filter((c) => c.id !== deletedParticipant.chat_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchChats, fetchUnreadCounts]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      
      toast({
        title: 'Message deleted',
        description: 'Message has been removed',
      });
    } catch (error) {
      console.error('Delete message error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete message',
      });
    }
  }, [toast]);

  // Delete multiple messages
  const deleteMultipleMessages = useCallback(async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', messageIds);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
      
      toast({
        title: 'Messages deleted',
        description: `${messageIds.length} message(s) have been removed`,
      });
    } catch (error) {
      console.error('Delete messages error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete messages',
      });
    }
  }, [toast]);

  // Leave group chat
  const leaveGroupChat = useCallback(async (chatId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) throw error;

      // Remove chat from local state
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      
      toast({
        title: 'Left group',
        description: 'You have left the group chat',
      });
    } catch (error) {
      console.error('Leave group error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to leave group',
      });
    }
  }, [userId, toast]);

  return {
    chats,
    messages,
    loading,
    sending,
    fetchMessages,
    sendMessage,
    deleteMessage,
    deleteMultipleMessages,
    leaveGroupChat,
    refreshChats: fetchChats,
  };
};
