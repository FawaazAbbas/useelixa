import { useState, useEffect, useRef } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search, LayoutList, X, Loader2, Users, FileText, PlayCircle, Paperclip, Phone, Activity, MessageSquare, Brain, Sparkles, CheckSquare, Info, Building2, Bot, Upload, Download } from "lucide-react";
import { getAgentColor } from '@/utils/agentColors';
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
import { TeamsSidebar } from "@/components/TeamsSidebar";
import { DirectorsSidebar } from "@/components/DirectorsSidebar";
import { DirectMessagesSidebar } from "@/components/DirectMessagesSidebar";
import { SidebarActionMenu } from "@/components/SidebarActionMenu";
import { getTeamMemberById, mockTeams, getTeamOnlineCount } from "@/data/mockTeams";
import { AddAgentToWorkspaceDialog } from "@/components/AddAgentToWorkspaceDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { mockTeamMemberMessages, mockTeamGroupMessages } from "@/data/mockTeamMessages";
import { getTeamGroupData, getFileIcon, formatRelativeTime } from "@/data/mockTeamGroupData";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [teamMemberMessages, setTeamMemberMessages] = useState<any[]>([]);
  const [selectedTeamGroupId, setSelectedTeamGroupId] = useState<string | null>(null);
  const [teamGroupMessages, setTeamGroupMessages] = useState<any[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [directorsOpen, setDirectorsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
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
    // Use instant scroll for initial load, smooth for new messages
    const behavior = messages.length === 0 ? 'auto' : 'smooth';
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [messages, selectedChat]);

  // Scroll Brian chat to bottom when messages load or Brian is selected
  useEffect(() => {
    if (showBrian && brianMessages.length > 0) {
      // Use a short delay to ensure DOM has updated
      setTimeout(() => {
        brianMessagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [brianMessages, showBrian, brianLoading]);

  // Scroll to bottom immediately when selecting a chat
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
    setSelectedTeamMemberId(null);
    if (chat?.id) {
      fetchMessages(chat.id);
    }
    // Scroll to bottom when selecting chat
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectTeamMember = (memberId: string) => {
    setSelectedTeamMemberId(memberId);
    setShowBrian(false);
    setSelectedChat(null);
    setSelectedTeamGroupId(null);
    setRightSidebarTab("about");
    
    // Load mock messages for this team member
    const memberData = mockTeamMemberMessages[memberId];
    if (memberData) {
      setTeamMemberMessages(memberData.messages);
    } else {
      setTeamMemberMessages([]);
    }
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectTeamGroup = (teamId: string) => {
    setSelectedTeamGroupId(teamId);
    setSelectedTeamMemberId(null);
    setShowBrian(false);
    setSelectedChat(null);
    setRightSidebarTab("about");
    
    // Get team key for mock data lookup
    const team = mockTeams.find((t: any) => t.id === teamId);
    if (team) {
      // Map team ID to mock data key (team IDs in mockTeams are like "team-marketing")
      const teamKeyMap: Record<string, string> = {
        'team-marketing': 'marketing',
        'team-product': 'product',
        'team-customer-service': 'customer-service',
        'team-finance': 'finance',
        'team-development': 'development',
        'team-creative': 'creative',
        'team-legal': 'legal',
      };
      const teamKey = teamKeyMap[teamId] || teamId;
      const groupMessages = mockTeamGroupMessages[teamKey];
      if (groupMessages) {
        // Map messages to include isManager flag based on agent_id
        const messagesWithManagerFlag = groupMessages.messages.map(msg => ({
          ...msg,
          isManager: msg.agent_id?.includes('director') || msg.agent_id?.includes('lead') || msg.agent_id?.includes('cs-director') || msg.agent_id === 'marketing-director' || msg.agent_id === 'product-director' || msg.agent_id === 'finance-director' || msg.agent_id === 'tech-lead' || msg.agent_id === 'creative-director' || msg.agent_id === 'legal-director',
        }));
        setTeamGroupMessages(messagesWithManagerFlag);
      } else {
        setTeamGroupMessages([]);
      }
    } else {
      setTeamGroupMessages([]);
    }
    
    // Scroll to bottom
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
          selectedMemberId={selectedTeamMemberId}
          onSelectMember={handleSelectTeamMember}
          showBrian={showBrian}
          onSelectBrian={() => {
            setShowBrian(true);
            setSelectedChat(null);
            setSelectedTeamMemberId(null);
          }}
        />
      )}

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
                  <div className="text-xs text-muted-foreground">Premium Plan • Personal</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => toast({ title: "Demo Mode", description: "Workspace switching not available in demo" })}
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Team Workspace</div>
                  <div className="text-xs text-muted-foreground">Pro Plan • 3 members</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => toast({ title: "Demo Mode", description: "Workspace switching not available in demo" })}
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Client Projects</div>
                  <div className="text-xs text-muted-foreground">Enterprise • 5 members</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 py-2 cursor-pointer"
                onClick={() => toast({ title: "Demo Mode", description: "Workspace creation not available in demo" })}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create New Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 py-2 cursor-pointer"
                onClick={() => toast({ title: "Demo Mode", description: "Settings not available in demo" })}
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
              placeholder="Search teams & agents..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="pl-9 bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-800 focus:border-slate-600 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Brian Section - ALWAYS VISIBLE */}
        <div className="px-3 py-2">
          <button
            onClick={() => {
              setShowBrian(true);
              setSelectedChat(null);
              setSelectedTeamMemberId(null);
              setSelectedTeamGroupId(null);
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

        {/* Sidebar Sections */}
        <ScrollArea className="flex-1">
          <div className="pb-2">
            {/* Teams Section */}
            <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Teams</span>
                    <span className="text-[10px] bg-slate-700/80 text-slate-400 px-1.5 py-0.5 rounded-full">7</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 collapsible-chevron" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <TeamsSidebar
                  selectedMemberId={selectedTeamMemberId}
                  onSelectMember={handleSelectTeamMember}
                  collapseAll={showBrian}
                  selectedTeamGroupId={selectedTeamGroupId}
                  onSelectTeamGroup={handleSelectTeamGroup}
                  searchQuery={sidebarSearch}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 my-2 border-t border-slate-700/40" />

            {/* Directors Section */}
            <Collapsible open={directorsOpen} onOpenChange={setDirectorsOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Directors</span>
                    <span className="text-[10px] bg-slate-700/80 text-slate-400 px-1.5 py-0.5 rounded-full">7</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 collapsible-chevron" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <DirectorsSidebar
                  selectedMemberId={selectedTeamMemberId}
                  onSelectMember={handleSelectTeamMember}
                  searchQuery={sidebarSearch}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 my-2 border-t border-slate-700/40" />

            {/* Agents Section */}
            <Collapsible open={agentsOpen} onOpenChange={setAgentsOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Agents</span>
                    <span className="text-[10px] bg-slate-700/80 text-slate-400 px-1.5 py-0.5 rounded-full">17</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 collapsible-chevron" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <DirectMessagesSidebar
                  selectedMemberId={selectedTeamMemberId}
                  onSelectMember={handleSelectTeamMember}
                  searchQuery={sidebarSearch}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Divider only when all sections are closed */}
            {!teamsOpen && !directorsOpen && !agentsOpen && (
              <div className="mx-4 my-2 border-t border-slate-700/40" />
            )}
          </div>
        </ScrollArea>

        {/* Bottom Action Menu */}
        <SidebarActionMenu onAddAgent={() => setShowAddAgentDialog(true)} />

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
                        className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""} ${
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
                         <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                           <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                             <span className="font-semibold">
                               {isUserMessage ? "You" : "Brian"}
                             </span>
                             <span className="text-xs text-muted-foreground">
                               {new Date().toLocaleTimeString()}
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
                             <div className="max-w-[85%] mt-2">
                               <FileMessageCard files={msg.metadata.files} />
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
                {brianSending && (
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-500">
                      <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
                    </Avatar>
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
        ) : selectedTeamMemberId ? (
          <>
            {/* Team Member Chat Header */}
            {(() => {
              const memberInfo = getTeamMemberById(selectedTeamMemberId);
              if (!memberInfo) return null;
              const { member, team } = memberInfo;
              // Blue for managers (HEAD), orange for workers
              const iconColor = member.isManager ? "text-blue-500" : "text-orange-500";
              const bgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
              return (
                <>
                  <div className={`${isMobile ? 'h-14 mt-14' : 'h-14'} border-b flex items-center justify-between px-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
                        <Bot className={`h-6 w-6 ${iconColor}`} />
                      </div>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.status === 'online' ? 'online' : member.status}
                        </div>
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

                  {/* Team Member Messages */}
                  <ScrollArea className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {teamMemberMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                          <Bot className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">Start a conversation with {member.name}</p>
                        </div>
                      ) : (
                        teamMemberMessages.map((msg) => {
                          const isUserMessage = msg.user_id !== null;
                          // Blue for managers, orange for workers
                          const msgIconColor = member.isManager ? "text-blue-500" : "text-orange-500";
                          const msgBgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""}`}
                            >
                              {!isUserMessage && (
                                <div className={`h-10 w-10 rounded-full ${msgBgColor} flex items-center justify-center flex-shrink-0`}>
                                  <Bot className={`h-6 w-6 ${msgIconColor}`} />
                                </div>
                              )}
                              <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                                <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                                  <span className="font-semibold">
                                    {isUserMessage ? "You" : member.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
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
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Team Member Input */}
                  <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
                    <div className="space-y-2 max-w-4xl mx-auto">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="team-member-file-upload"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => document.getElementById('team-member-file-upload')?.click()}
                          className={isMobile ? 'h-10 w-10' : ''}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder={`Message ${member.name}...`}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              toast({
                                title: "Demo Mode",
                                description: "Sending messages is simulated in demo mode.",
                              });
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            toast({
                              title: "Demo Mode",
                              description: "Sending messages is simulated in demo mode.",
                            });
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : selectedTeamGroupId ? (
          <>
            {/* Team Group Chat */}
            {(() => {
              const team = mockTeams.find((t: any) => t.id === selectedTeamGroupId);
              if (!team) return null;
              return (
                <>
                  <div className={`${isMobile ? 'h-14 mt-14' : 'h-14'} border-b flex items-center justify-between px-4`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {team.members.length + 1} members • Group chat
                        </div>
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

                  {/* Team Group Messages */}
                  <ScrollArea className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {teamGroupMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                          <Users className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">Start a conversation with {team.name}</p>
                        </div>
                      ) : (
                        teamGroupMessages.map((msg) => {
                          const isUserMessage = msg.user_id !== null;
                          const msgIconColor = msg.isManager ? "text-blue-500" : "text-orange-500";
                          const msgBgColor = msg.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""}`}
                            >
                              {!isUserMessage && (
                                <div className={`h-10 w-10 rounded-full ${msgBgColor} flex items-center justify-center flex-shrink-0`}>
                                  <Bot className={`h-6 w-6 ${msgIconColor}`} />
                                </div>
                              )}
                              <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                                <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                                  <span className="font-semibold">
                                    {isUserMessage ? "You" : msg.sender_name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div
                                  className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                    isUserMessage
                                      ? "bg-primary/90 text-primary-foreground"
                                      : "bg-muted/80"
                                  }`}
                                >
                                  <div 
                                    className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? '[&_*]:!text-white' : 'dark:prose-invert'} [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:my-1`}
                                    dangerouslySetInnerHTML={{ __html: msg.content }}
                                  />
                                </div>
                                {msg.files && msg.files.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {msg.files.map((file, idx) => (
                                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-muted/60 rounded-lg border border-border/50 max-w-[300px]">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                          <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{file.name}</p>
                                          <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0">
                                          <Download className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    ))}
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
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Team Group Input */}
                  <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
                    <div className="space-y-2 max-w-4xl mx-auto">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="team-group-file-upload"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => document.getElementById('team-group-file-upload')?.click()}
                          className={isMobile ? 'h-10 w-10' : ''}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder={`Message ${team.name}...`}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              toast({
                                title: "Demo Mode",
                                description: "Sending messages is simulated in demo mode.",
                              });
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            toast({
                              title: "Demo Mode",
                              description: "Sending messages is simulated in demo mode.",
                            });
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
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
                    className={`flex gap-3 group ${isUserMessage ? "justify-end" : ""} ${
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
                           <div className="max-w-[85%] mt-2">
                             <FileMessageCard files={msg.metadata.files} />
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
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
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
          toast({ title: 'Install an agent from the AI Talent Pool to start a direct chat' });
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
                <TabsList className={`grid w-full ${showBrian ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {!showBrian && (
                    <TabsTrigger value="automations" className="flex items-center justify-center">
                      <PlayCircle className="h-4 w-4" />
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="files" className="flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="memories" className="flex items-center justify-center">
                    <Brain className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="flex items-center justify-center">
                    <LayoutList className="h-4 w-4" />
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
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
      )}

      {/* Right Sidebar - Tabbed Panels (Desktop Only) */}
      {(selectedChat || showBrian || selectedTeamMemberId || selectedTeamGroupId) && (
        <div className="hidden lg:block w-80 border-l border-border/50 bg-gradient-to-b from-muted/30 to-muted/50 backdrop-blur-xl overflow-hidden shadow-xl">
          <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="h-full flex flex-col">
          <div className="px-4 pt-4 pb-2">
            <TabsList className={`w-full ${showBrian || selectedTeamMemberId || selectedTeamGroupId ? 'grid grid-cols-4' : 'grid grid-cols-5'}`}>
              {!showBrian && !selectedTeamMemberId && !selectedTeamGroupId && (
                <>
                  <TabsTrigger value="about" className="text-xs flex items-center justify-center">
                    <Info className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="automations" className="text-xs flex items-center justify-center">
                    <PlayCircle className="h-4 w-4" />
                  </TabsTrigger>
                </>
              )}
              {(showBrian || selectedTeamMemberId || selectedTeamGroupId) && (
                <TabsTrigger value="about" className="text-xs flex items-center justify-center">
                  <Info className="h-4 w-4" />
                </TabsTrigger>
              )}
              <TabsTrigger value="files" className="text-xs flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="memories" className="text-xs flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          {!showBrian && !selectedTeamMemberId && !selectedTeamGroupId && (
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

          {showBrian && (
            <TabsContent value="about" className="flex-1 m-0 overflow-auto p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">About Brian</h3>
                <p className="text-muted-foreground">
                  Brian is your AI Chief Operating Officer, designed to orchestrate and optimize your entire workspace. Unlike individual agents that specialize in specific tasks, Brian takes a holistic view of your operations, coordinating between agents, managing workflows, and ensuring everything runs smoothly.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-semibold mb-3">Capabilities</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Coordinate multiple agents and delegate tasks intelligently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Manage workspace-level automations and workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Monitor agent performance and optimize operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Provide strategic insights and operational recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Handle complex multi-step workflows and decision-making</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">How Brian Works</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  Brian operates at the workspace level, maintaining context across all your agents and operations. When you assign a task to Brian, he analyzes the requirements, determines which agents are best suited for each component, and orchestrates the execution. He monitors progress, handles exceptions, and ensures successful completion while keeping you informed throughout the process.
                </p>
              </div>
            </TabsContent>
          )}

          {selectedTeamMemberId && (() => {
            const memberInfo = getTeamMemberById(selectedTeamMemberId);
            if (!memberInfo) return null;
            const { member, team } = memberInfo;
            const iconColor = member.isManager ? "text-blue-500" : "text-orange-500";
            const bgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
            return (
              <TabsContent value="about" className="flex-1 m-0 overflow-auto p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center`}>
                    <Bot className={`h-7 w-7 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-base font-semibold mb-2">Team</h4>
                  <p className="text-muted-foreground">{team.name}</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-2">Specialty</h4>
                  <p className="text-muted-foreground">{member.specialty}</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-3">Capabilities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Specialized in {member.specialty.toLowerCase()}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Member of {team.name}</span>
                    </li>
                    {member.isManager && (
                      <li className="flex items-start gap-2">
                        <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Department head with team leadership responsibilities</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      member.status === 'online' ? 'bg-green-500' : 
                      member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-muted-foreground capitalize">{member.status}</span>
                  </div>
                </div>
              </TabsContent>
            );
          })()}

          {selectedTeamGroupId && (() => {
            const teamData = getTeamGroupData(selectedTeamGroupId);
            if (!teamData) return null;
            const { team } = teamData;
            const onlineCount = getTeamOnlineCount(team);
            return (
              <TabsContent value="about" className="flex-1 m-0 overflow-auto p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center`} style={{ background: team.gradient }}>
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.members.length + 1} members · {onlineCount} online</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-base font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{team.description}</p>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {/* Manager */}
                    <button
                      onClick={() => {
                        setSelectedTeamGroupId(null);
                        setSelectedTeamMemberId(team.manager.id);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{team.manager.name}</p>
                        <p className="text-xs text-muted-foreground">{team.manager.role}</p>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${
                        team.manager.status === 'online' ? 'bg-green-500' : 
                        team.manager.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </button>
                    
                    {/* Workers */}
                    {team.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setShowWaitlistDialog(true);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${
                          member.status === 'online' ? 'bg-green-500' : 
                          member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            );
          })()}

          <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Brian's Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload workspace-level files that Brian can access and reference</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Upload Files</p>
                    <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, TXT, CSV, and more</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recent Files</h4>
                    <Card>
                      <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        No files uploaded yet
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : selectedTeamMemberId ? (
              <div className="h-full overflow-auto p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Team Member Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload files for this team member to access</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Upload Files</p>
                    <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, TXT, CSV, and more</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recent Files</h4>
                    <Card>
                      <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        No files uploaded yet
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : selectedTeamGroupId ? (() => {
              const teamData = getTeamGroupData(selectedTeamGroupId);
              if (!teamData) return null;
              const { team, files } = teamData;
              return (
                <div className="h-full overflow-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{team.name} Files</h3>
                      <p className="text-sm text-muted-foreground mb-4">Shared files for the entire team</p>
                    </div>
                    
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload Files</p>
                      <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Team Files ({files.length})</h4>
                      {files.length > 0 ? (
                        <div className="space-y-2">
                          {files.map((file) => (
                            <Card key={file.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                              <CardContent className="p-3 flex items-center gap-3">
                                <span className="text-xl">{getFileIcon(file.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{file.size} · {file.uploadedBy}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatRelativeTime(file.uploadedAt)}</span>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-4 text-center text-sm text-muted-foreground">
                            No files uploaded yet
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              );
            })() : selectedChat && selectedChat.type === 'direct' ? (
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
            ) : selectedTeamMemberId ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Team Member Memories</h3>
                <p className="text-sm text-muted-foreground mb-4">Memories and preferences for this team member</p>
              </div>
            ) : selectedTeamGroupId ? (() => {
              const teamData = getTeamGroupData(selectedTeamGroupId);
              if (!teamData) return null;
              const { team, memories } = teamData;
              return (
                <div className="h-full overflow-auto p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{team.name} Memories</h3>
                    <p className="text-sm text-muted-foreground mb-4">Team-level preferences and shared context</p>
                  </div>
                  
                  {memories.length > 0 ? (
                    <div className="space-y-3">
                      {memories.map((memory) => (
                        <Card key={memory.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">{memory.category}</Badge>
                                  <span className="text-xs text-muted-foreground">{formatRelativeTime(memory.updatedAt)}</span>
                                </div>
                                <p className="text-sm font-medium">{memory.key}</p>
                                <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                                <p className="text-xs text-muted-foreground mt-2">Added by {memory.createdBy}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        No team memories yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })() : selectedChat ? (
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

          <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
            {showBrian ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Brian's History</h3>
                <p className="text-sm text-muted-foreground">All workspace-level activity coordinated by Brian</p>
              </div>
            ) : selectedTeamMemberId ? (
              <div className="h-full overflow-auto p-4">
                <h3 className="font-semibold mb-4">Chat History</h3>
                <p className="text-sm text-muted-foreground">Activity history with this team member</p>
              </div>
            ) : selectedTeamGroupId ? (() => {
              const teamData = getTeamGroupData(selectedTeamGroupId);
              if (!teamData) return null;
              const { team, activity } = teamData;
              const getActivityIcon = (type: string) => {
                switch (type) {
                  case 'milestone': return '🎯';
                  case 'decision': return '✅';
                  case 'task': return '📋';
                  case 'discussion': return '💬';
                  default: return '📝';
                }
              };
              const getActivityColor = (type: string) => {
                switch (type) {
                  case 'milestone': return 'text-green-600 dark:text-green-400';
                  case 'decision': return 'text-blue-600 dark:text-blue-400';
                  case 'task': return 'text-orange-600 dark:text-orange-400';
                  case 'discussion': return 'text-purple-600 dark:text-purple-400';
                  default: return 'text-muted-foreground';
                }
              };
              return (
                <div className="h-full overflow-auto p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{team.name} Activity</h3>
                    <p className="text-sm text-muted-foreground mb-4">Recent team collaboration and decisions</p>
                  </div>
                  
                  {activity.length > 0 ? (
                    <div className="space-y-3">
                      {activity.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{getActivityIcon(item.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${getActivityColor(item.type)}`}>{item.action}</span>
                                  <span className="text-xs text-muted-foreground">· {formatRelativeTime(item.timestamp)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">by {item.performedBy}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-4 text-center text-sm text-muted-foreground">
                        No team activity yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })() : selectedChat ? (
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

      {/* Add Agent Dialog */}
      <AddAgentToWorkspaceDialog
        open={showAddAgentDialog}
        onOpenChange={setShowAddAgentDialog}
      />

      {/* Waitlist Dialog */}
      <WaitlistDialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog} />
      </div>
    </div>
  );
};

export default Workspace;
