import { useState, useEffect, useRef } from "react";
import { Send, Plus, Settings, ChevronDown, Search, LayoutList, X, Loader2, Users, FileText, Paperclip, Phone, MessageSquare, Sparkles, CheckSquare, Building2, Bot, Download } from "lucide-react";
import { getAgentColor } from '@/utils/agentColors';
import { trackWorkspaceView, trackWorkspaceChatOpen, trackWorkspaceMessageSent } from '@/utils/analytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { GroupChatDialog } from "@/components/GroupChatDialog";
import { ChatSettingsDialog } from "@/components/ChatSettingsDialog";
import { VoiceCallDialog } from "@/components/VoiceCallDialog";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { FilePreviewDialog } from "@/components/chat/FilePreviewDialog";
import { useToast } from "@/hooks/use-toast";
import { useBrianChat } from "@/hooks/useBrianChat";
import { MessageContextMenu } from "@/components/MessageContextMenu";
import { MessageSelectionBar } from "@/components/MessageSelectionBar";
import { NewChatDialog } from "@/components/NewChatDialog";
import { GroupParticipantsDialog } from "@/components/GroupParticipantsDialog";
import { AddAgentToWorkspaceDialog } from "@/components/AddAgentToWorkspaceDialog";
import { BrianAvatar } from "@/components/BrianAvatar";
import { AgentRecommendationCard } from "@/components/chat/AgentRecommendationCard";
import { ChatRightPanel } from "@/components/ChatRightPanel";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Automation {
  id: string;
  name: string;
  status: string;
  trigger: string;
  progress: number;
  last_run: string | null;
  task_id: string | null;
  task?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

const Workspace = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, loading: workspaceLoading } = useWorkspace();
  const { chats, messages, loading: chatLoading, sending, fetchMessages, sendMessage, deleteMessage, deleteMultipleMessages, leaveGroupChat, refreshChats } = useRealTimeChat(user?.id, workspaceId);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showAutomations, setShowAutomations] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState("about");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [processingAgent, setProcessingAgent] = useState<string | null>(null);
  const [delegationStatus, setDelegationStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBrian, setShowBrian] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [selectedBrianIndices, setSelectedBrianIndices] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string; size: number; uploadedBy?: string; uploadedAt?: string } | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const brianMessagesEndRef = useRef<HTMLDivElement>(null);
  
  // Brian chat hook
  const { 
    messages: brianMessages, 
    loading: brianLoading, 
    sending: brianSending, 
    sendMessage: sendBrianMessage,
    deleteMessage: deleteBrianMessage,
    deleteMultipleMessages: deleteBrianMultipleMessages,
  } = useBrianChat(user?.id, workspaceId);
  const [brianInput, setBrianInput] = useState("");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Track workspace view on mount
  useEffect(() => {
    if (user) {
      trackWorkspaceView('main');
    }
  }, [user]);

  useEffect(() => {
    if (workspaceId) {
      fetchAutomations();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat && !showBrian) {
      const firstChat = chats[0];
      setSelectedChat(firstChat);
      if (firstChat?.id) {
        fetchMessages(firstChat.id);
      }
    }
  }, [chats, selectedChat, showBrian, fetchMessages]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
      
      if (selectedChat.type === 'direct') {
        setRightSidebarTab("about");
      }
      
      // Subscribe to new messages for real-time delegation tracking
      const messageSubscription = supabase
        .channel(`messages:${selectedChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${selectedChat.id}`
          },
          (payload) => {
            const newMessage = payload.new as any;
            
            if (newMessage.agent_id && selectedChat.type === 'group') {
              const agent = selectedChat.agents?.find((a: any) => a.id === newMessage.agent_id);
              if (agent) {
                setProcessingAgent(agent.name);
                
                if (newMessage.is_agent_to_agent && newMessage.target_agent_id) {
                  const targetAgent = selectedChat.agents?.find((a: any) => a.id === newMessage.target_agent_id);
                  if (targetAgent) {
                    setDelegationStatus(`${agent.name} → ${targetAgent.name}`);
                    setTimeout(() => {
                      setProcessingAgent(targetAgent.name);
                      setDelegationStatus(null);
                    }, 1500);
                  }
                } else {
                  setTimeout(() => {
                    setProcessingAgent(null);
                    setDelegationStatus(null);
                  }, 500);
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
      };
    }
  }, [selectedChat, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const behavior = messages.length === 0 ? 'auto' : 'smooth';
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [messages, selectedChat]);

  // Scroll Brian chat to bottom
  useEffect(() => {
    if (showBrian && brianMessages.length > 0) {
      setTimeout(() => {
        brianMessagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [brianMessages, showBrian, brianLoading]);

  useEffect(() => {
    if (selectedChat?.id) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [selectedChat?.id]);

  const handleSendMessage = async () => {
    if (!selectedChat || (!message.trim() && selectedFiles.length === 0) || sending) return;

    setUploading(true);
    let fileAttachments: any[] = [];

    try {
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('chat-files')
            .getPublicUrl(filePath);

          return {
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size
          };
        });

        fileAttachments = await Promise.all(uploadPromises);
      }

      const messageContent = message.trim() || (selectedFiles.length > 0 ? `Sent ${selectedFiles.length} file(s)` : '');
      
      setMessage("");
      setSelectedFiles([]);

      if (selectedChat.type === 'group') {
        const firstAgent = selectedChat.agents?.[0];
        if (firstAgent) {
          setProcessingAgent(firstAgent.name);
        }
        const agentIds = selectedChat.agents?.map((a: any) => a.id) || [];
        await sendMessage(selectedChat.id, agentIds, messageContent, 'group', { files: fileAttachments });
      } else if (selectedChat.agent?.id) {
        setProcessingAgent(selectedChat.agent.name);
        await sendMessage(selectedChat.id, selectedChat.agent.id, messageContent, 'direct', { files: fileAttachments });
      }
      
      setProcessingAgent(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message with files'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleMessageSelection = (id: string | number, isBrian: boolean = false) => {
    if (isBrian) {
      const idx = id as number;
      setSelectedBrianIndices((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(idx)) {
          newSet.delete(idx);
        } else {
          newSet.add(idx);
        }
        return newSet;
      });
    } else {
      const msgId = id as string;
      setSelectedMessageIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(msgId)) {
          newSet.delete(msgId);
        } else {
          newSet.add(msgId);
        }
        return newSet;
      });
    }
  };

  const handleSelectAll = () => {
    if (showBrian) {
      if (selectedBrianIndices.size === brianMessages.length) {
        setSelectedBrianIndices(new Set());
      } else {
        setSelectedBrianIndices(new Set(brianMessages.map((_, idx) => idx)));
      }
    } else {
      if (selectedMessageIds.size === messages.length) {
        setSelectedMessageIds(new Set());
      } else {
        setSelectedMessageIds(new Set(messages.map(msg => msg.id)));
      }
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessageIds(new Set());
    setSelectedBrianIndices(new Set());
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteSelected = async () => {
    try {
      if (showBrian && selectedBrianIndices.size > 0) {
        await deleteBrianMultipleMessages(Array.from(selectedBrianIndices));
      } else if (selectedChat && selectedMessageIds.size > 0) {
        await deleteMultipleMessages(Array.from(selectedMessageIds));
      }
      handleCancelSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const fetchAutomations = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from("automations")
      .select(`
        *,
        task:tasks(id, title, status)
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching automations:", error);
    } else {
      setAutomations(data || []);
    }
  };

  const handleSeeTask = (taskId: string) => {
    navigate(`/tasks?taskId=${taskId}`);
  };

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    setShowBrian(false);
    if (chat?.id) {
      fetchMessages(chat.id);
      trackWorkspaceChatOpen('agent', chat.name || 'Unknown');
    }
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupDialog(true);
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup({
      id: group.id,
      name: group.name,
      agentIds: group.agents?.map((a: any) => a.id) || []
    });
    setShowGroupDialog(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group chat?')) return;
    
    try {
      await supabase.from('chats').delete().eq('id', groupId);
      if (selectedChat?.id === groupId) {
        setSelectedChat(null);
      }
      refreshChats();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleSendBrianMessage = async () => {
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Workspace not ready",
        description: "Your workspace is still being set up. Please try again in a moment.",
      });
      return;
    }

    if (!brianInput.trim() || brianSending) return;
    trackWorkspaceMessageSent('brian');
    await sendBrianMessage(brianInput);
    setBrianInput("");
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!sidebarSearch.trim()) return true;
    const query = sidebarSearch.toLowerCase();
    const chatName = chat.name || chat.agent?.name || '';
    return chatName.toLowerCase().includes(query);
  });

  const directChats = filteredChats.filter(c => c.type === 'direct');
  const groupChatsFiltered = filteredChats.filter(c => c.type === 'group');

  // Show loading state while checking auth
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 flex overflow-hidden">
        {/* Group Chat Dialog */}
        <GroupChatDialog
          open={showGroupDialog}
          onOpenChange={setShowGroupDialog}
          userId={user?.id || ''}
          workspaceId={workspaceId || ''}
          onGroupCreated={refreshChats}
          editingGroup={editingGroup}
        />

        {/* New Chat Dialog */}
        <NewChatDialog
          open={showNewChatDialog}
          onOpenChange={setShowNewChatDialog}
          onCreateDirect={() => setShowAddAgentDialog(true)}
          onCreateGroup={handleCreateGroup}
        />

        {/* Add Agent Dialog */}
        <AddAgentToWorkspaceDialog
          open={showAddAgentDialog}
          onOpenChange={setShowAddAgentDialog}
        />

        {/* Group Participants Dialog */}
        {selectedChat?.type === 'group' && (
          <GroupParticipantsDialog
            open={showParticipantsDialog}
            onOpenChange={setShowParticipantsDialog}
            chatId={selectedChat.id}
            workspaceId={workspaceId || ''}
            userId={user?.id || ''}
            isOwner={true}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Messages</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {showBrian ? selectedBrianIndices.size : selectedMessageIds.size} message(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* File Preview Dialog */}
        <FilePreviewDialog
          open={filePreviewOpen}
          onOpenChange={setFilePreviewOpen}
          file={previewFile}
        />

        {/* Desktop Sidebar */}
        <div className={`${isMobile ? 'hidden' : 'w-72'} bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 flex flex-col shadow-xl`}>
          {/* Workspace Header */}
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full hover:bg-slate-700/50 rounded-lg px-3 py-2.5 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-100 text-[15px]">My Workspace</div>
                      <div className="text-xs text-slate-400">Premium Plan</div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 bg-popover/95 backdrop-blur-xl border-chat-border z-50">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase">
                  Your Workspaces
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer bg-primary/10">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">My Workspace</div>
                    <div className="text-xs text-muted-foreground">Premium Plan</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 py-2 cursor-pointer"
                  onClick={() => navigate('/settings')}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Create New Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 py-2 cursor-pointer"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Workspace Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search chats..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="pl-9 bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-800 focus:border-slate-600 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Brian Section */}
          <div className="px-3 py-2">
            <button
              onClick={() => {
                setShowBrian(true);
                setSelectedChat(null);
                trackWorkspaceChatOpen('brian', 'Brian');
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                showBrian 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25" 
                  : "bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                showBrian 
                  ? "bg-white/20" 
                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
              }`}>
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-100">Brian</span>
                <span className="text-xs text-slate-400">AI COO Assistant</span>
              </div>
              <Sparkles className="h-4 w-4 text-blue-400 ml-auto" />
            </button>
          </div>

          <Separator className="my-2 bg-slate-700/50" />

          {/* Agent Chats */}
          <ScrollArea className="flex-1">
            <div className="pb-2 px-2">
              {/* Direct Chats */}
              {directChats.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Direct Messages</span>
                    <span className="text-[10px] bg-slate-700/80 text-slate-400 px-1.5 py-0.5 rounded-full">{directChats.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {directChats.map((chat) => {
                      const colors = getAgentColor(chat.agent?.category || 'General');
                      return (
                        <button
                          key={chat.id}
                          onClick={() => handleSelectChat(chat)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 h-10 transition-colors rounded-md",
                            selectedChat?.id === chat.id && !showBrian
                              ? "bg-slate-700/70"
                              : "hover:bg-slate-800/70"
                          )}
                        >
                          <div className={`h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <Bot className={`h-4 w-4 ${colors.icon}`} />
                          </div>
                          <span className="text-[13px] truncate text-slate-300 flex-1 text-left">
                            {chat.custom_name || chat.agent?.name || chat.name}
                          </span>
                          {(chat.unread_count || 0) > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                              {chat.unread_count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group Chats */}
              {groupChatsFiltered.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Groups</span>
                    <span className="text-[10px] bg-slate-700/80 text-slate-400 px-1.5 py-0.5 rounded-full">{groupChatsFiltered.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {groupChatsFiltered.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 h-10 transition-colors rounded-md",
                          selectedChat?.id === chat.id && !showBrian
                            ? "bg-slate-700/70"
                            : "hover:bg-slate-800/70"
                        )}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[13px] truncate text-slate-300 flex-1 text-left">
                          {chat.name}
                        </span>
                        <span className="text-[10px] text-slate-500">{chat.agents?.length || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {directChats.length === 0 && groupChatsFiltered.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-3">No agent chats yet</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAddAgentDialog(true)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Agent
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Action */}
          <div className="p-3 border-t border-slate-700/50">
            <Button 
              onClick={() => setShowNewChatDialog(true)}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${isMobile ? 'pt-14' : ''}`}>
          {showBrian ? (
            <>
              {/* Brian Chat Header */}
              <div className="h-14 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <BrianAvatar size="md" />
                  <div>
                    <div className="font-semibold">Brian</div>
                    <div className="text-xs text-muted-foreground">Your AI COO</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowVoiceCall(true)}
                    title="Voice calling"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Brian Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {brianLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : brianMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <BrianAvatar size="xl" />
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-1">Welcome to Brian</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          I'm your AI COO. I can help you manage tasks, coordinate with agents, and streamline your operations.
                        </p>
                      </div>
                    </div>
                  ) : (
                    brianMessages.map((msg, idx) => {
                      const isUserMessage = msg.role === "user";
                      const isSelected = selectedBrianIndices.has(idx);
                      const msgTimestamp = (msg as any).timestamp ? new Date((msg as any).timestamp) : new Date();
                      
                      return (
                        <div key={idx}>
                          <div
                            className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""} ${
                              isSelected ? "bg-primary/10 rounded-lg p-2" : ""
                            }`}
                            onClick={() => isSelectionMode && handleToggleMessageSelection(idx, true)}
                          >
                            {isSelectionMode && (
                              <div className="flex items-start pt-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <CheckSquare className={`h-5 w-5 ${isSelected ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                                </Button>
                              </div>
                            )}
                            {!isUserMessage && <BrianAvatar size="md" rounded="full" />}
                            <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                              <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                                <span className="font-semibold">{isUserMessage ? "You" : "Brian"}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(msgTimestamp, "d MMM, h:mm a")}
                                </span>
                                {!isSelectionMode && (
                                  <MessageContextMenu
                                    messageId={idx.toString()}
                                    canDelete={true}
                                    onDelete={() => deleteBrianMessage(idx)}
                                  />
                                )}
                              </div>
                              <div
                                className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                  isUserMessage ? "bg-primary text-white" : "bg-muted/80"
                                }`}
                              >
                                <div 
                                  className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'} [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:my-1`}
                                  dangerouslySetInnerHTML={{ __html: msg.content }}
                                />
                              </div>
                              {(msg as any).metadata?.files && (
                                <div className="max-w-[85%] mt-2">
                                  <FileMessageCard 
                                    files={(msg as any).metadata.files} 
                                    senderName={isUserMessage ? "You" : "Brian"}
                                  />
                                </div>
                              )}
                              {(msg as any).recommendedAgent && (
                                <AgentRecommendationCard
                                  agentId={(msg as any).recommendedAgent.id}
                                  agentName={(msg as any).recommendedAgent.name}
                                  description={(msg as any).recommendedAgent.description}
                                  category={(msg as any).recommendedAgent.category}
                                  rating={(msg as any).recommendedAgent.rating}
                                />
                              )}
                            </div>
                            {isUserMessage && (
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {brianSending && (
                    <div className="flex gap-3">
                      <BrianAvatar size="md" rounded="full" />
                      <div className="flex-1">
                        <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Processing...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={brianMessagesEndRef} />
                </div>
              </ScrollArea>

              {/* Brian Input */}
              <div className={`p-4 border-t bg-card/50 backdrop-blur-sm shrink-0 ${isMobile ? 'pb-20' : ''}`}>
                <div className="flex gap-2 max-w-4xl mx-auto">
                  <Input
                    placeholder={workspaceId ? "Message Brian..." : "Setting up your workspace..."}
                    value={brianInput}
                    onChange={(e) => setBrianInput(e.target.value)}
                    disabled={brianSending || !workspaceId}
                    className={isMobile ? 'text-base flex-1' : 'flex-1'}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && brianInput.trim() && !brianSending) {
                        e.preventDefault();
                        handleSendBrianMessage();
                      }
                    }}
                  />
                  <Button disabled={brianSending || !brianInput.trim()} onClick={handleSendBrianMessage}>
                    {brianSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`${isMobile ? 'h-14 mt-14' : 'h-14'} border-b flex items-center justify-between px-4`}>
                <div className="flex items-center gap-3">
                  {selectedChat.type === 'group' ? (
                    <>
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{selectedChat.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedChat.agents?.length || 0} agents • Group chat
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const colors = getAgentColor(selectedChat.agent?.category || 'General');
                        return (
                          <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                            <Bot className={`h-6 w-6 ${colors.icon}`} />
                          </div>
                        );
                      })()}
                      <div>
                        <div className="font-semibold">{selectedChat.custom_name || selectedChat.agent?.name}</div>
                        <div className="text-xs text-muted-foreground">online</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.type === 'group' && (
                    <Button variant="ghost" size="icon" onClick={() => setShowParticipantsDialog(true)}>
                      <Users className="h-5 w-5" />
                    </Button>
                  )}
                  {selectedChat.type === 'direct' && (
                    <Button variant="ghost" size="icon" onClick={() => setShowVoiceCall(true)} title="Voice calling">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      {(() => {
                        const colors = getAgentColor(selectedChat.agent?.category || 'General');
                        return (
                          <div className={`h-16 w-16 rounded-full ${colors.bg} flex items-center justify-center`}>
                            <Bot className={`h-8 w-8 ${colors.icon}`} />
                          </div>
                        );
                      })()}
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-1">
                          Chat with {selectedChat.custom_name || selectedChat.agent?.name || selectedChat.name}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          {selectedChat.agent?.short_description || "Start a conversation to get help with your tasks."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isUserMessage = !!msg.user_id;
                      const isSelected = selectedMessageIds.has(msg.id);
                      const agentInfo = selectedChat.type === 'group' && msg.agent_id
                        ? selectedChat.agents?.find((a: any) => a.id === msg.agent_id)
                        : selectedChat.agent;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""} ${
                            isSelected ? "bg-primary/10 rounded-lg p-2" : ""
                          }`}
                          onClick={() => isSelectionMode && handleToggleMessageSelection(msg.id, false)}
                        >
                          {isSelectionMode && (
                            <div className="flex items-start pt-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <CheckSquare className={`h-5 w-5 ${isSelected ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                              </Button>
                            </div>
                          )}
                          {!isUserMessage && (() => {
                            const colors = getAgentColor(agentInfo?.category || 'General');
                            return (
                              <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                <Bot className={`h-6 w-6 ${colors.icon}`} />
                              </div>
                            );
                          })()}
                          <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                            <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                              <span className="font-semibold">{isUserMessage ? "You" : agentInfo?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </span>
                              {!isSelectionMode && (
                                <MessageContextMenu
                                  messageId={msg.id}
                                  canDelete={isUserMessage || !msg.user_id}
                                  onDelete={deleteMessage}
                                />
                              )}
                            </div>
                            <div
                              className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                isUserMessage
                                  ? "bg-primary text-white"
                                  : msg.error_message
                                  ? "bg-destructive/10 border border-destructive"
                                  : "bg-muted/80"
                              }`}
                            >
                              <div className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                              </div>
                            </div>
                            {msg.metadata?.files && (
                              <div className="max-w-[85%] mt-2">
                                <FileMessageCard 
                                  files={msg.metadata.files}
                                  senderName={isUserMessage ? "You" : selectedChat?.agent?.name || "Agent"}
                                  timestamp={msg.created_at}
                                />
                              </div>
                            )}
                          </div>
                          {isUserMessage && (
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })
                  )}
                  {sending && selectedChat && (
                    <div className="flex gap-3">
                      {(() => {
                        const colors = selectedChat.type === 'group' 
                          ? { bg: 'bg-primary/20', icon: 'text-primary' }
                          : getAgentColor(selectedChat.agent?.category || 'General');
                        return (
                          <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            {selectedChat.type === 'group' ? <Users className="h-5 w-5 text-primary" /> : <Bot className={`h-6 w-6 ${colors.icon}`} />}
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <div className="space-y-2">
                          {processingAgent && (
                            <div className="text-xs text-muted-foreground font-medium">
                              {processingAgent} is thinking...
                            </div>
                          )}
                          <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Processing...</span>
                            </div>
                          </div>
                          {delegationStatus && (
                            <div className="text-xs text-primary font-medium animate-pulse">
                              🔀 {delegationStatus}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className={`p-4 border-t ${isMobile ? 'pb-24' : ''}`}>
                <div className="space-y-2 max-w-4xl mx-auto">
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
                          <Paperclip className="h-4 w-4" />
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => removeFile(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder={selectedChat.type === 'group' 
                        ? `Message ${selectedChat.name}...` 
                        : `Message ${selectedChat.custom_name || selectedChat.agent?.name}...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending || uploading}
                      className={isMobile ? 'text-base flex-1' : 'flex-1'}
                    />
                    <Button onClick={handleSendMessage} disabled={(!message.trim() && selectedFiles.length === 0) || sending || uploading}>
                      {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">No chat selected</h3>
                <p className="text-muted-foreground text-sm mb-4">Select Brian or an agent to start chatting</p>
                <Button onClick={() => setShowAddAgentDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        {!isMobile && (showBrian || selectedChat) && (
          <ChatRightPanel
            selectedChat={selectedChat}
            showBrian={showBrian}
            selectedTeamMemberId={null}
            selectedTeamGroupId={null}
            rightSidebarTab={rightSidebarTab}
            onTabChange={setRightSidebarTab}
            workspaceId={workspaceId || ''}
            userId={user?.id || ''}
            onFilePreview={(file) => {
              setPreviewFile(file);
              setFilePreviewOpen(true);
            }}
          />
        )}
      </div>

      {/* Selection Bar */}
      {isSelectionMode && (
        <MessageSelectionBar
          selectedCount={showBrian ? selectedBrianIndices.size : selectedMessageIds.size}
          totalCount={showBrian ? brianMessages.length : messages.length}
          onSelectAll={handleSelectAll}
          onCancel={handleCancelSelection}
          onDelete={handleConfirmDelete}
        />
      )}

      {/* Voice Call Dialog */}
      {showVoiceCall && (
        <VoiceCallDialog
          open={showVoiceCall}
          onClose={() => setShowVoiceCall(false)}
          agentName={showBrian ? "Brian" : selectedChat?.agent?.name || selectedChat?.name || "Agent"}
        />
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <ChatSettingsDialog
          chatId={selectedChat?.id || 'brian'}
          chatType={showBrian ? 'brian' : selectedChat?.type || 'direct'}
          agentId={selectedChat?.agent?.id}
          agentInstallationId={selectedChat?.agent_installation_id}
          currentName={showBrian ? "Brian" : selectedChat?.custom_name || selectedChat?.agent?.name || ""}
          onClose={() => setShowSettings(false)}
          onDeleted={() => {
            setSelectedChat(null);
            refreshChats();
          }}
          onEnterDeleteMode={() => setIsSelectionMode(true)}
        />
      )}
    </div>
  );
};

export default Workspace;
