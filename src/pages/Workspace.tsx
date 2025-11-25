import { useState, useEffect } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search, LayoutList, X, Store, Loader2, Users, FileText, PlayCircle, Paperclip, Phone, Activity } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { BrianChat } from "@/components/BrianChat";
import { Sparkles } from "lucide-react";

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
  const { chats, messages, loading: chatLoading, sending, fetchMessages, sendMessage, refreshChats } = useRealTimeChat(user?.id, workspaceId);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showAutomations, setShowAutomations] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState("automations");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [processingAgent, setProcessingAgent] = useState<string | null>(null);
  const [delegationStatus, setDelegationStatus] = useState<string | null>(null);
  const [showBrian, setShowBrian] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (workspaceId) {
      fetchAutomations();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      const firstChat = chats[0];
      setSelectedChat(firstChat);
      if (firstChat?.id) {
        fetchMessages(firstChat.id);
      }
    }
  }, [chats, selectedChat, fetchMessages]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
      
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
      
      const { data: userMessage, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          user_id: user?.id,
          content: messageContent,
          metadata: fileAttachments.length > 0 ? { files: fileAttachments } : null
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      setMessage("");
      setSelectedFiles([]);

      // Only call agent if there's a text message
      if (message.trim()) {
        // Set initial processing state
        if (selectedChat.type === 'group') {
          const firstAgent = selectedChat.agents?.[0];
          if (firstAgent) {
            setProcessingAgent(firstAgent.name);
          }
          const agentIds = selectedChat.agents?.map((a: any) => a.id) || [];
          await sendMessage(selectedChat.id, agentIds, message, 'group');
        } else {
          setProcessingAgent(selectedChat.agent?.name || 'Agent');
          await sendMessage(selectedChat.id, selectedChat.agent_id, message, 'direct');
        }
        
        // Clear processing state after response
        setTimeout(() => {
          setProcessingAgent(null);
          setDelegationStatus(null);
        }, 1000);
      }
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
    <div className="flex-1 flex overflow-hidden bg-background">
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
      <div className={`${isMobile ? 'hidden' : 'w-64'} bg-chat-sidebar border-r border-chat-border flex flex-col`}>
        {/* Workspace Header */}
        <div className="p-4 border-b border-chat-border">
          <button className="flex items-center justify-between w-full hover:bg-muted/50 rounded px-3 py-2 transition-colors">
            <div>
              <div className="font-bold text-white">My Workspace</div>
              <div className="text-xs text-muted-foreground">Premium Plan</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Brian Section */}
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
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {chatLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">No agents installed</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/')}>
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
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCreateGroup}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {chats.filter(c => c.type === 'group').map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors ${
                    selectedChat?.id === chat.id && !showBrian ? "bg-muted/50" : ""
                  }`}
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="text-sm truncate text-white">{chat.name}</div>
                    <div className="text-xs text-muted-foreground">{chat.agents?.length || 0} agents</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-chat-border">
          <button className="flex items-center gap-2 w-full hover:bg-muted/50 rounded px-2 py-1.5 transition-colors">
            <Avatar className="h-6 w-6">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">User</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
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
            </div>
            
            {/* Brian Chat Content */}
            {user && workspaceId && (
              <BrianChat userId={user.id} workspaceId={workspaceId} />
            )}
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
            {selectedChat?.type === 'direct' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowVoiceCall(true)}
                title="Start voice call"
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
                const agentInfo = selectedChat.type === 'group' && msg.agent_id
                  ? selectedChat.agents?.find((a: any) => a.id === msg.agent_id)
                  : selectedChat.agent;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUserMessage ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {isUserMessage ? "U" : agentInfo?.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 ${isUserMessage ? "text-right" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {isUserMessage ? "You" : agentInfo?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div
                          className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
                            isUserMessage
                              ? "bg-primary text-primary-foreground"
                              : msg.error_message
                              ? "bg-destructive/10 border border-destructive"
                              : "bg-muted"
                          }`}
                        >
                          <div className={`text-sm prose prose-sm max-w-none ${isMobile ? 'break-words' : ''} ${isUserMessage ? '[&_*]:!text-white' : 'dark:prose-invert'}`}>
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
        />
      )}

      {/* Panels Drawer for Mobile/Tablet */}
      {!showBrian && selectedChat && (
        <Sheet open={showAutomations} onOpenChange={setShowAutomations}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <div className="h-full flex flex-col">
            <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="automations">
                    <PlayCircle className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <FileText className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <LayoutList className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="automations" className="flex-1 m-0">
                {selectedChat && (
                  <ChatAutomationsPanel
                    chatId={selectedChat.id}
                    userId={user?.id || ''}
                    workspaceId={workspaceId || ''}
                  />
                )}
              </TabsContent>

              <TabsContent value="files" className="flex-1 m-0">
                {selectedChat && selectedChat.type === 'direct' && (
                  <AgentFilesPanel
                    agentInstallationId={selectedChat.agent_installation_id}
                    workspaceId={workspaceId || ''}
                  />
                )}
              </TabsContent>

              <TabsContent value="logs" className="flex-1 m-0">
                {selectedChat && (
                  <ChatLogsPanel chatId={selectedChat.id} />
                )}
              </TabsContent>

              <TabsContent value="settings" className="flex-1 m-0 p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Click the settings icon in the header to manage chat settings
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      )}

      {/* Right Sidebar - Tabbed Panels (Desktop Only) */}
      {!showBrian && selectedChat && (
        <div className="hidden lg:block w-80 border-l bg-muted/30 overflow-hidden">
          <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="h-full flex flex-col">
          <div className="p-4 pb-0">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="automations" className="text-xs">
                <PlayCircle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs">
                <FileText className="h-4 w-4" />
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

          <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
            {selectedChat && selectedChat.type === 'direct' ? (
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

          <TabsContent value="logs" className="flex-1 m-0 overflow-hidden">
            {selectedChat ? (
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
          </TabsContent>
        </Tabs>
      </div>
      )}

      {/* Voice Call Dialog */}
      {selectedChat?.type === 'direct' && (
        <VoiceCallDialog
          open={showVoiceCall}
          onClose={() => setShowVoiceCall(false)}
          agentName={selectedChat.custom_name || selectedChat.agent?.name || 'Agent'}
          agentInstructions={selectedChat.agent?.ai_instructions}
          voice="alloy"
        />
      )}
    </div>
  );
};

export default Workspace;
