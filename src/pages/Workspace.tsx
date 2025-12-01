import { useState, useEffect, useRef } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search, LayoutList, X, Store, Loader2, Users, FileText, PlayCircle, Paperclip, Phone, Activity, MessageSquare, Brain, Sparkles, CheckSquare, Info } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileChatNav } from "@/components/MobileChatNav";
import { GroupChatDialog } from "@/components/GroupChatDialog";
import { ChatAutomationsPanel } from "@/components/ChatAutomationsPanel";
import { ChatSettingsDialog } from "@/components/ChatSettingsDialog";
import { AgentFilesPanel } from "@/components/AgentFilesPanel";
import { ChatLogsPanel } from "@/components/ChatLogsPanel";
import { VoiceCallDialog } from "@/components/VoiceCallDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { AutomationHistoryDashboard } from "@/components/AutomationHistoryDashboard";
import { useToast } from "@/hooks/use-toast";
import { useBrianChat } from "@/hooks/useBrianChat";
import { ChatMemoriesPanel } from "@/components/ChatMemoriesPanel";
import { MessageContextMenu } from "@/components/MessageContextMenu";
import { MessageSelectionBar } from "@/components/MessageSelectionBar";
import { NewChatDialog } from "@/components/NewChatDialog";
import { GroupParticipantsDialog } from "@/components/GroupParticipantsDialog";
import { DemoBanner } from "@/components/DemoBanner";

const agents = [
  { id: "1", name: "customer-support-pro", status: "online", type: "individual" },
  { id: "2", name: "content-creator-ai", status: "online", type: "individual" },
  { id: "3", name: "data-analyst", status: "offline", type: "individual" },
];

const groupChats = [
  { 
    id: "g1", 
    name: "Marketing Team", 
    members: ["content-creator-ai", "data-analyst", "social-media-bot"],
    memberCount: 3,
    type: "group",
    lastActivity: "2m ago"
  },
  { 
    id: "g2", 
    name: "Customer Success Squad", 
    members: ["customer-support-pro", "feedback-analyzer", "email-responder"],
    memberCount: 3,
    type: "group",
    lastActivity: "1h ago"
  },
];

const mockMessages = [
  {
    id: "1",
    sender: "customer-support-pro",
    content: "Hello! I'm ready to help with customer inquiries. You can ask me to check tickets, respond to customers, or analyze support trends.",
    timestamp: "10:30 AM",
    isAgent: true,
    avatar: "CS"
  },
  {
    id: "2",
    sender: "You",
    content: "Show me the latest customer tickets",
    timestamp: "10:32 AM",
    isAgent: false,
    avatar: "U"
  },
  {
    id: "3",
    sender: "customer-support-pro",
    content: "Here are the 5 most recent tickets:\n\n1. Ticket #234 - Login issue (Priority: High)\n2. Ticket #235 - Feature request (Priority: Low)\n3. Ticket #236 - Billing question (Priority: Medium)\n4. Ticket #237 - Bug report (Priority: High)\n5. Ticket #238 - General inquiry (Priority: Low)\n\nWould you like me to provide more details on any of these?",
    timestamp: "10:32 AM",
    isAgent: true,
    avatar: "CS"
  },
];

const mockGroupMessages = [
  {
    id: "g1",
    sender: "content-creator-ai",
    content: "I've drafted 5 new blog posts for this week's content calendar. Would you like me to share them?",
    timestamp: "9:15 AM",
    isAgent: true,
    avatar: "CC"
  },
  {
    id: "g2",
    sender: "data-analyst",
    content: "Great! I analyzed last month's content performance. The tutorial posts got 3x more engagement than news posts.",
    timestamp: "9:17 AM",
    isAgent: true,
    avatar: "DA"
  },
  {
    id: "g3",
    sender: "You",
    content: "Perfect! Let's focus more on tutorials then. Can you both collaborate on a series?",
    timestamp: "9:20 AM",
    isAgent: false,
  },
  {
    id: "g4",
    sender: "social-media-bot",
    content: "I can schedule those across our social channels. I suggest posting tutorials on Tuesday and Thursday for maximum reach.",
    timestamp: "9:22 AM",
    isAgent: true,
    avatar: "SM"
  },
];

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
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const isDemoMode = !user; // Enable demo mode when no user is logged in
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
  const [rightSidebarTab, setRightSidebarTab] = useState("automations");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showCallingDisabled, setShowCallingDisabled] = useState(false);
  const [processingAgent, setProcessingAgent] = useState<string | null>(null);
  const [delegationStatus, setDelegationStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showBrian, setShowBrian] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [selectedBrianIndices, setSelectedBrianIndices] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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
  const initialSetupDone = useRef(false);

  useEffect(() => {
    if (workspaceId) {
      fetchAutomations();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isDemoMode) {
      // Only auto-select Brian on initial mount, not on every state change
      if (!initialSetupDone.current) {
        setShowBrian(true);
        initialSetupDone.current = true;
      }
      return;
    }
    
    if (chats.length > 0 && !selectedChat && !showBrian) {
      const firstChat = chats[0];
      setSelectedChat(firstChat);
      if (firstChat?.id) {
        fetchMessages(firstChat.id);
      }
    } else if (chats.length === 0 && !showBrian) {
      // Auto-select Brian when there are no chats
      setShowBrian(true);
    }
  }, [chats, selectedChat, showBrian, fetchMessages, isDemoMode]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
      
      // Default to "about" tab when opening a direct chat
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
            
            // Track agent processing and delegation
            if (newMessage.agent_id && selectedChat.type === 'group') {
              const agent = selectedChat.agents?.find((a: any) => a.id === newMessage.agent_id);
              if (agent) {
                setProcessingAgent(agent.name);
                
                // Check for delegation
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
                  // No delegation, clear processing state after message appears
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

  // Scroll to bottom when messages change or chat is selected
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat, brianMessages, showBrian]);

  const handleSendMessage = async () => {
    if (!selectedChat || (!message.trim() && selectedFiles.length === 0) || sending) return;

    setUploading(true);
    let fileAttachments: any[] = [];

    try {
      // Upload files if any
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

      // Send message with file metadata through hook (which handles DB insert)
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
    }
    // Scroll to bottom when selecting chat
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Demo banner */}
      {isDemoMode && <DemoBanner />}
      
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

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileChatNav
          agents={chats.filter(c => c.type === 'direct').map(c => ({
            id: c.id,
            name: c.agent?.name || 'Agent',
            status: 'online',
            type: 'individual'
          }))}
          groupChats={chats.filter(c => c.type === 'group').map(c => ({
            id: c.id,
            name: c.name || 'Group',
            members: c.agents?.map(a => a.name) || [],
            memberCount: c.agents?.length || 0,
            type: 'group',
            lastActivity: formatDistanceToNow(new Date(c.last_activity), { addSuffix: true })
          }))}
          selectedChat={selectedChat?.id}
          onSelectChat={(chatId, type) => {
            const chat = chats.find(c => c.id === chatId);
            if (chat) handleSelectChat(chat);
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`${isMobile ? 'hidden' : 'w-64'} bg-gradient-to-b from-chat-sidebar to-chat-sidebar/95 backdrop-blur-xl border-r border-chat-border/50 flex flex-col shadow-xl`}>
        {/* Workspace Header */}
        <div className="p-4 border-b border-chat-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <button className="flex items-center justify-between w-full hover:bg-white/10 rounded-lg px-3 py-2 transition-all duration-300 hover:scale-[1.02]">
            <div>
              <div className="font-bold text-white">My Workspace</div>
              <div className="text-xs text-primary/80 font-medium">Premium Plan</div>
            </div>
            <ChevronDown className="h-4 w-4 text-primary" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-white/5 border-0 focus:bg-white/10 transition-colors backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Brian Section - ALWAYS VISIBLE */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Brian
          </h3>
          <button
            onClick={() => {
              setShowBrian(true);
              setSelectedChat(null);
            }}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              showBrian 
                ? "bg-primary/20 text-primary" 
                : "hover:bg-muted/50"
            }`}
          >
            <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-500">
              <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">Brian</div>
              <div className="text-xs text-muted-foreground">Your AI COO</div>
            </div>
          </button>
        </div>

        <Separator className="my-2" />

        {/* Direct Messages */}
        <div className="flex-1 overflow-auto">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</h3>
            </div>
            <div className="space-y-1">
              {chatLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : chats.filter(c => c.type === 'direct').length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">No agents installed</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
                    <Store className="h-3 w-3 mr-1" />
                    Browse Marketplace
                  </Button>
                </div>
              ) : (
                chats.filter(c => c.type === 'direct').map((chat) => (
                   <button
                     key={chat.id}
                     onClick={() => handleSelectChat(chat)}
                     className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors ${
                       selectedChat?.id === chat.id && !showBrian ? "bg-muted/50" : ""
                     }`}
                   >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {chat.agent?.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-green-500" />
                    </div>
                    <span className="text-sm truncate text-white">{chat.agent?.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Group Chats */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Group Chats</h3>
            </div>
            <div className="space-y-1">
              {chats.filter(c => c.type === 'group').length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <p className="text-xs text-muted-foreground">No group chats</p>
                </div>
              ) : (
                chats.filter(c => c.type === 'group').map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors ${
                      selectedChat?.id === chat.id && !showBrian ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="relative">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {(chat.unread_count || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                          {chat.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm truncate text-white">{chat.name}</div>
                      <div className="text-xs text-muted-foreground">{chat.agents?.length || 0} agents</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Create New Button */}
        <div className="p-3 border-t border-chat-border">
          <Button 
            className="w-full" 
            onClick={() => setShowNewChatDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showBrian ? (
          <>
            {/* Brian Chat Header */}
            <div className={`${isMobile ? 'h-14 mt-14' : 'h-14'} border-b flex items-center justify-between px-4`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-500">
                  <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Brian</div>
                  <div className="text-xs text-muted-foreground">Your AI COO</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowCallingDisabled(true)}
                title="Voice calling"
              >
                <Phone className="h-4 w-4" />
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowAutomations(!showAutomations)}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="ml-2">Panels</span>
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
            <ScrollArea className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
              <div className="space-y-4 max-w-4xl mx-auto">
                {brianLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : brianMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <p className="text-muted-foreground">Start a conversation with Brian, your AI COO</p>
                  </div>
                ) : (
                  brianMessages.map((msg, idx) => {
                    const isUserMessage = msg.role === "user";
                    const isSelected = selectedBrianIndices.has(idx);
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 group ${
                          isSelected ? "bg-primary/10 rounded-lg p-2" : ""
                        }`}
                        onClick={() => isSelectionMode && handleToggleMessageSelection(idx, true)}
                      >
                        {isSelectionMode && (
                          <div className="flex items-start pt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <CheckSquare
                                className={`h-5 w-5 ${
                                  isSelected ? "text-primary fill-primary" : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                          </div>
                        )}
                         {!isUserMessage && (
                           <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-500">
                             <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
                           </Avatar>
                         )}
                         <div className={`flex-1 ${isUserMessage ? "flex flex-col items-end" : ""}`}>
                           <div className={`flex items-center gap-2 mb-2 ${isUserMessage ? "flex-row-reverse" : ""}`}>
                             <span className="font-semibold">
                               {isUserMessage ? "You" : "Brian"}
                             </span>
                           </div>
                           <div className="space-y-2">
                             <div
                               className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                 isUserMessage
                                   ? "bg-primary/90 text-primary-foreground"
                                   : "bg-muted/80"
                               }`}
                             >
                               <div className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? '[&_*]:!text-white' : 'dark:prose-invert'}`}>
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                   {msg.content}
                                 </ReactMarkdown>
                               </div>
                             </div>
                             {msg.metadata?.files && (
                               <div className="max-w-[85%]">
                                 <FileMessageCard files={msg.metadata.files} />
                               </div>
                             )}
                           </div>
                         </div>
                         {isUserMessage && (
                           <Avatar className="h-10 w-10">
                             <AvatarFallback>U</AvatarFallback>
                           </Avatar>
                         )}
                        {!isSelectionMode && (
                          <MessageContextMenu
                            messageId={idx.toString()}
                            canDelete={true}
                            onDelete={() => deleteBrianMessage(idx)}
                          />
                        )}
                      </div>
                    );
                  })
                )}
                {brianSending && (
                  <div className="flex gap-3">
                    <Avatar className="bg-gradient-to-br from-purple-600 to-blue-500">
                      <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Brian is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Brian Input */}
            <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
              <div className="space-y-2 max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="brian-file-upload"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={brianSending || uploading}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById('brian-file-upload')?.click()}
                    disabled={brianSending || uploading}
                    className={isMobile ? 'h-10 w-10' : ''}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Message Brian..."
                    value={brianInput}
                    onChange={(e) => setBrianInput(e.target.value)}
                    onKeyPress={async (e) => {
                      if (e.key === "Enter" && !e.shiftKey && brianInput.trim()) {
                        e.preventDefault();
                        const messageContent = brianInput;
                        setBrianInput("");
                        
                        // Handle file uploads if any
                        let fileMetadata = undefined;
                        if (selectedFiles.length > 0) {
                          setUploading(true);
                          try {
                            const uploadPromises = selectedFiles.map(async (file) => {
                              const fileExt = file.name.split('.').pop();
                              const filePath = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                              
                              const { data, error } = await supabase.storage
                                .from('chat-files')
                                .upload(filePath, file);

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

                            const fileAttachments = await Promise.all(uploadPromises);
                            fileMetadata = { files: fileAttachments };
                            setSelectedFiles([]);
                          } catch (error) {
                            console.error('Error uploading files:', error);
                            toast({
                              variant: 'destructive',
                              title: 'Error',
                              description: 'Failed to upload files'
                            });
                          } finally {
                            setUploading(false);
                          }
                        }
                        
                        await sendBrianMessage(messageContent, fileMetadata);
                      }
                    }}
                    disabled={brianSending || uploading}
                    className={isMobile ? 'text-base' : ''}
                  />
                  <Button 
                    size="icon" 
                    onClick={async () => {
                      if (!brianInput.trim()) return;
                      const messageContent = brianInput;
                      setBrianInput("");
                      
                      // Handle file uploads if any
                      let fileMetadata = undefined;
                      if (selectedFiles.length > 0) {
                        setUploading(true);
                        try {
                          const uploadPromises = selectedFiles.map(async (file) => {
                            const fileExt = file.name.split('.').pop();
                            const filePath = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                            
                            const { data, error } = await supabase.storage
                              .from('chat-files')
                              .upload(filePath, file);

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

                          const fileAttachments = await Promise.all(uploadPromises);
                          fileMetadata = { files: fileAttachments };
                          setSelectedFiles([]);
                        } catch (error) {
                          console.error('Error uploading files:', error);
                          toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to upload files'
                          });
                        } finally {
                          setUploading(false);
                        }
                      }
                      
                      await sendBrianMessage(messageContent, fileMetadata);
                    }}
                    disabled={brianSending || uploading || !brianInput.trim()}
                    className={isMobile ? 'h-10 w-10' : ''}
                  >
                    {(brianSending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Chat Header */}
            <div className={`${isMobile ? 'h-14 mt-14' : 'h-14'} border-b flex items-center justify-between px-4`}>
              <div className="flex items-center gap-3">
                {selectedChat ? (
                  <>
                {selectedChat.type === 'group' ? (
                  <>
                    <Avatar>
                      <AvatarFallback>
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedChat.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedChat.agents?.length || 0} agents • Group chat
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar>
                      <AvatarFallback>
                        {selectedChat.agent?.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedChat.agent?.name}</div>
                      <div className="text-xs text-muted-foreground">online</div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="font-semibold">No chat selected</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedChat?.type === 'group' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowParticipantsDialog(true)}
              >
                <Users className="h-5 w-5" />
              </Button>
            )}
            {selectedChat?.type === 'direct' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowCallingDisabled(true)}
                title="Voice calling"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowAutomations(!showAutomations)}
            >
              <LayoutList className="h-4 w-4" />
              <span className="ml-2">Panels</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(true)}
              disabled={!selectedChat}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {!selectedChat ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <p className="text-muted-foreground">Select an agent to start chatting</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
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
                    className={`flex gap-3 group ${
                      isSelected ? "bg-primary/10 rounded-lg p-2" : ""
                    }`}
                    onClick={() => isSelectionMode && handleToggleMessageSelection(msg.id, false)}
                  >
                    {isSelectionMode && (
                      <div className="flex items-start pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <CheckSquare
                            className={`h-5 w-5 ${
                              isSelected ? "text-primary fill-primary" : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>
                    )}
                     {!isUserMessage && (
                       <Avatar className="h-10 w-10">
                         <AvatarFallback>
                           {agentInfo?.name.substring(0, 2).toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                     )}
                     <div className={`flex-1 ${isUserMessage ? "flex flex-col items-end" : ""}`}>
                       <div className={`flex items-center gap-2 mb-2 ${isUserMessage ? "flex-row-reverse" : ""}`}>
                         <span className="font-semibold">
                           {isUserMessage ? "You" : agentInfo?.name}
                         </span>
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
                       <div className="space-y-2">
                         <div
                           className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                             isUserMessage
                               ? "bg-primary/90 text-primary-foreground"
                               : msg.error_message
                               ? "bg-destructive/10 border border-destructive"
                               : "bg-muted/80"
                           }`}
                         >
                           <div className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? '[&_*]:!text-white' : 'dark:prose-invert'}`}>
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {msg.content}
                             </ReactMarkdown>
                           </div>
                         </div>
                         {msg.metadata?.files && (
                           <div className="max-w-[85%]">
                             <FileMessageCard files={msg.metadata.files} />
                           </div>
                         )}
                       </div>
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
                <Avatar>
                  <AvatarFallback>
                    {selectedChat.type === 'group' ? <Users className="h-4 w-4" /> : selectedChat.agent?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
          <div className="space-y-2 max-w-4xl mx-auto">
            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={!selectedChat || uploading}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={!selectedChat || uploading}
                className={isMobile ? 'h-10 w-10' : ''}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder={selectedChat 
                  ? selectedChat.type === 'group' 
                    ? `Message ${selectedChat.name}...` 
                    : `Message ${selectedChat.agent?.name}...`
                  : "Select a chat..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!selectedChat || sending || uploading}
                className={isMobile ? 'text-base' : ''}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={!selectedChat || sending || uploading || (!message.trim() && selectedFiles.length === 0)}
                className={isMobile ? 'h-10 w-10' : ''}
              >
                {(sending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Chat Settings Dialog */}
      {showBrian && showSettings && (
        <ChatSettingsDialog
          chatId="brian"
          chatType="brian"
          currentName="Brian"
          onClose={() => setShowSettings(false)}
          onDeleted={() => {
            // Brian cannot be deleted
            setShowSettings(false);
          }}
          onEnterDeleteMode={() => {
            setIsSelectionMode(true);
            setSelectedBrianIndices(new Set());
          }}
        />
      )}
      
      {selectedChat && selectedChat.type === 'direct' && showSettings && (
        <ChatSettingsDialog
          chatId={selectedChat.id}
          chatType="direct"
          agentId={selectedChat.agent_id}
          agentInstallationId={selectedChat.agent_installation_id}
          currentName={selectedChat.custom_name || selectedChat.agent?.name || ''}
          onClose={() => setShowSettings(false)}
          onDeleted={() => {
            setSelectedChat(null);
            setShowSettings(false);
            refreshChats();
          }}
          onEnterDeleteMode={() => {
            setIsSelectionMode(true);
            setSelectedMessageIds(new Set());
          }}
        />
      )}

      {selectedChat && selectedChat.type === 'group' && showSettings && (
        <ChatSettingsDialog
          chatId={selectedChat.id}
          chatType="group"
          currentName={selectedChat.name || ''}
          onClose={() => setShowSettings(false)}
          onDeleted={() => {
            if (selectedChat.id && user?.id) {
              leaveGroupChat(selectedChat.id);
              setSelectedChat(null);
              setShowSettings(false);
            }
          }}
          onEnterDeleteMode={() => {
            setIsSelectionMode(true);
            setSelectedMessageIds(new Set());
          }}
        />
      )}

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        onCreateDirect={() => {
          // For now just refresh chats - direct chats are auto-created
          toast({ title: 'Install an agent from the Marketplace to start a direct chat' });
        }}
        onCreateGroup={() => {
          setShowNewChatDialog(false);
          handleCreateGroup();
        }}
      />

      {selectedChat && selectedChat.type === 'group' && (
        <GroupParticipantsDialog
          open={showParticipantsDialog}
          onOpenChange={setShowParticipantsDialog}
          chatId={selectedChat.id}
          workspaceId={workspaceId || ''}
          userId={user?.id || ''}
          isOwner={selectedChat.created_by === user?.id}
        />
      )}

      {/* Panels Drawer for Mobile/Tablet */}
      {(selectedChat || showBrian) && (
        <Sheet open={showAutomations} onOpenChange={setShowAutomations}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <div className="h-full flex flex-col">
            <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <TabsList className={`grid w-full ${showBrian ? 'grid-cols-4' : 'grid-cols-5'}`}>
                  {!showBrian && (
                    <TabsTrigger value="automations">
                      <PlayCircle className="h-4 w-4" />
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="files">
                    <FileText className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="memories">
                    <Brain className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <LayoutList className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </div>

              {!showBrian && (
                <TabsContent value="automations" className="flex-1 m-0">
                  {selectedChat && (
                    <ChatAutomationsPanel
                      chatId={selectedChat.id}
                      userId={user?.id || ''}
                      workspaceId={workspaceId || ''}
                    />
                  )}
                </TabsContent>
              )}

              <TabsContent value="files" className="flex-1 m-0">
                {showBrian ? (
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Brian's Files</h3>
                    <p className="text-sm text-muted-foreground">Workspace-level files accessible to Brian</p>
                  </div>
                ) : selectedChat && selectedChat.type === 'direct' ? (
                  <AgentFilesPanel
                    agentInstallationId={selectedChat.agent_installation_id}
                    workspaceId={workspaceId || ''}
                  />
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Select a direct chat to view files</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="memories" className="flex-1 m-0">
                {showBrian ? (
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Brian's Memories</h3>
                    <p className="text-sm text-muted-foreground">Workspace-level memories and preferences</p>
                  </div>
                ) : selectedChat ? (
                  <ChatMemoriesPanel
                    chatId={selectedChat.id}
                    workspaceId={workspaceId || ''}
                    agentInstallationId={selectedChat.agent_installation_id}
                  />
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Select a chat to view memories</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="flex-1 m-0">
                {showBrian ? (
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Brian's Activity Log</h3>
                    <p className="text-sm text-muted-foreground">Conversation history and activity</p>
                  </div>
                ) : selectedChat ? (
                  <ChatLogsPanel chatId={selectedChat.id} />
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Select a chat to view logs</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="flex-1 m-0 p-4">
                {showBrian ? (
                  <div>
                    <h3 className="font-semibold mb-4">Brian Settings</h3>
                    <p className="text-sm text-muted-foreground mb-4">Configure Brian's behavior and preferences</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Open Brian Settings
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Click the settings icon in the header to manage chat settings
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      )}

      {/* Right Sidebar - Tabbed Panels (Desktop Only) */}
      {(selectedChat || showBrian) && (
        <div className="hidden lg:block w-80 border-l border-border/50 bg-gradient-to-b from-muted/30 to-muted/50 backdrop-blur-xl overflow-hidden shadow-xl">
          <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="h-full flex flex-col">
          <div className="p-4 pb-0">
            <TabsList className={`grid w-full ${showBrian ? 'grid-cols-5' : 'grid-cols-7'}`}>
              {!showBrian && (
                <>
                  <TabsTrigger value="about" className="text-xs">
                    <Info className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="automations" className="text-xs">
                    <PlayCircle className="h-4 w-4" />
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="files" className="text-xs">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="memories" className="text-xs">
                <Brain className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs">
                <LayoutList className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <Activity className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          {!showBrian && (
            <>
              <TabsContent value="about" className="flex-1 m-0 overflow-auto p-6 space-y-6">
                {selectedChat?.agent ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About {selectedChat.agent.name}</h3>
                      <p className="text-muted-foreground">
                        {selectedChat.agent.description || selectedChat.agent.short_description}
                      </p>
                    </div>
                    
                    {selectedChat.agent.capabilities && selectedChat.agent.capabilities.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold mb-3">Capabilities</h3>
                        <ul className="space-y-2">
                          {selectedChat.agent.capabilities.map((capability: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedChat.agent.long_description && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">Full Details</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {selectedChat.agent.long_description}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Select an agent chat to view details</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="automations" className="flex-1 m-0 overflow-hidden">
                {selectedChat ? (
                  <ChatAutomationsPanel
                    chatId={selectedChat.id}
                    userId={user?.id || ''}
                    workspaceId={workspaceId || ''}
                />
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Select a chat to view automations</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}

          <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Brian's Files</h3>
                <p className="text-sm text-muted-foreground mb-4">Workspace-level files accessible to Brian</p>
              </div>
            ) : selectedChat && selectedChat.type === 'direct' ? (
              <AgentFilesPanel
                agentInstallationId={selectedChat.agent_installation_id}
                workspaceId={workspaceId || ''}
              />
            ) : selectedChat && selectedChat.type === 'group' ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Agent files are not available for group chats</p>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Select a chat to view files</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="memories" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Brian's Memories</h3>
                <p className="text-sm text-muted-foreground mb-4">Workspace-level memories and preferences</p>
              </div>
            ) : selectedChat ? (
              <ChatMemoriesPanel
                chatId={selectedChat.id}
                workspaceId={workspaceId || ''}
                agentInstallationId={selectedChat.agent_installation_id}
              />
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Select a chat to view memories</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Brian's Activity Log</h3>
                <p className="text-sm text-muted-foreground mb-4">Conversation history and activity</p>
              </div>
            ) : selectedChat ? (
              <div className="h-full overflow-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Chat Logs</h3>
                  <ChatLogsPanel chatId={selectedChat.id} />
                </div>
                <Separator className="my-4" />
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Automation History</h3>
                  <AutomationHistoryDashboard 
                    workspaceId={workspaceId || ''} 
                    chatId={selectedChat.id}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Select a chat to view logs</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 overflow-hidden p-4">
            {showBrian ? (
              <div>
                <h3 className="font-semibold mb-4">Brian Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">Configure Brian's behavior and preferences</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Open Brian Settings
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Click the settings icon in the header to manage chat settings
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  disabled={!selectedChat}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Open Chat Settings
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Brian's History</h3>
                <p className="text-sm text-muted-foreground">All workspace-level activity coordinated by Brian</p>
              </div>
            ) : selectedChat ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Automation History</h3>
                <AutomationHistoryDashboard 
                  workspaceId={workspaceId || ''} 
                  chatId={selectedChat.id}
                />
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Select a chat to view history</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      )}

      {/* Calling Disabled Dialog */}
      <AlertDialog open={showCallingDisabled} onOpenChange={setShowCallingDisabled}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voice Calling Coming Soon</AlertDialogTitle>
            <AlertDialogDescription>
              Voice calling functionality is currently under development and will be available soon. Stay tuned for updates!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowCallingDisabled(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Message Selection Bar */}
      {isSelectionMode && (
        <MessageSelectionBar
          selectedCount={showBrian ? selectedBrianIndices.size : selectedMessageIds.size}
          totalCount={showBrian ? brianMessages.length : messages.length}
          onCancel={handleCancelSelection}
          onDelete={handleConfirmDelete}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {showBrian ? selectedBrianIndices.size : selectedMessageIds.size} message(s)? 
              This action cannot be undone.
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
      </div>
    </div>
  );
};

export default Workspace;
