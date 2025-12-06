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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDistanceToNow, format } from "date-fns";
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
import { FilePreviewDialog } from "@/components/chat/FilePreviewDialog";
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
import { mockTeamMemberMessages, mockTeamGroupMessages, mockDirectorChatData } from "@/data/mockTeamMessages";
import { getTeamGroupData, formatRelativeTime } from "@/data/mockTeamGroupData";
import { FileIcon } from "@/components/FileIcon";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { BrianAvatar } from "@/components/BrianAvatar";
import { TeamMemberAvatar } from "@/components/TeamMemberAvatar";
import { AgentRecommendationCard } from "@/components/chat/AgentRecommendationCard";
import { ChatRightPanel } from "@/components/ChatRightPanel";
import { getChatResponse } from "@/data/mockChatResponses";
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
  const [rightSidebarTab, setRightSidebarTab] = useState("about");
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
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
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
  const initialSetupDone = useRef(false);
  
  // Interactive demo chat state
  const [disabledChats, setDisabledChats] = useState<Set<string>>(new Set());
  const [showWaitlistButton, setShowWaitlistButton] = useState<Set<string>>(new Set());
  const [demoMessages, setDemoMessages] = useState<Record<string, any[]>>({});
  const [brianDemoMessages, setBrianDemoMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: string }>>([]);
  const [teamGroupInput, setTeamGroupInput] = useState("");
  const [teamMemberInput, setTeamMemberInput] = useState("");
  const [isTeamGroupSending, setIsTeamGroupSending] = useState(false);
  const [isTeamMemberSending, setIsTeamMemberSending] = useState(false);
  const [isBrianDemoSending, setIsBrianDemoSending] = useState(false);

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

  // Scroll Brian chat to bottom when demo messages are added
  useEffect(() => {
    if (showBrian && brianDemoMessages.length > 0) {
      setTimeout(() => {
        brianMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [brianDemoMessages, showBrian]);

  // Scroll to bottom immediately when selecting a chat
  useEffect(() => {
    if (selectedChat?.id) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [selectedChat?.id]);

  // Scroll to bottom when team group messages change
  useEffect(() => {
    if (selectedTeamGroupId && teamGroupMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [teamGroupMessages, selectedTeamGroupId]);

  // Scroll to bottom when team member messages change
  useEffect(() => {
    if (selectedTeamMemberId && teamMemberMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [teamMemberMessages, selectedTeamMemberId]);

  // Scroll to bottom when demo messages are added to any chat
  useEffect(() => {
    const currentChatId = selectedTeamGroupId || selectedTeamMemberId;
    if (currentChatId && demoMessages[currentChatId]?.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [demoMessages, selectedTeamGroupId, selectedTeamMemberId]);

  // Scroll to bottom when waitlist button appears
  useEffect(() => {
    if (showWaitlistButton.size > 0) {
      setTimeout(() => {
        // Scroll the appropriate ref based on which chat is active
        if (showBrian && showWaitlistButton.has("brian")) {
          brianMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedTeamMemberId && showWaitlistButton.has(selectedTeamMemberId)) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedTeamGroupId && showWaitlistButton.has(selectedTeamGroupId)) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [showWaitlistButton, showBrian, selectedTeamMemberId, selectedTeamGroupId]);

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
    
    // Check if this is a director with full chat data
    const directorData = mockDirectorChatData[memberId as keyof typeof mockDirectorChatData];
    let baseMessages: any[] = [];
    if (directorData) {
      baseMessages = directorData.messages as any;
    } else {
      const memberData = mockTeamMemberMessages[memberId];
      if (memberData) {
        baseMessages = memberData.messages;
      }
    }
    
    // Merge with any demo messages for this chat
    const chatDemoMessages = demoMessages[memberId] || [];
    setTeamMemberMessages([...baseMessages, ...chatDemoMessages]);
    
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
    let baseMessages: any[] = [];
    if (team) {
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
        baseMessages = groupMessages.messages.map(msg => ({
          ...msg,
          isManager: msg.agent_id?.includes('director') || msg.agent_id?.includes('lead') || msg.agent_id?.includes('cs-director') || msg.agent_id === 'marketing-director' || msg.agent_id === 'product-director' || msg.agent_id === 'finance-director' || msg.agent_id === 'tech-lead' || msg.agent_id === 'creative-director' || msg.agent_id === 'legal-director',
        }));
      }
    }
    
    // Merge with any demo messages for this chat
    const chatDemoMessages = demoMessages[teamId] || [];
    setTeamGroupMessages([...baseMessages, ...chatDemoMessages]);
    
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
                    <div className="font-semibold text-slate-100 text-[15px]">Baduss Technologies</div>
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
                  <div className="font-semibold">Baduss Technologies</div>
                  <div className="text-xs text-muted-foreground">Premium Plan</div>
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
                onClick={() => setShowCallingDisabled(true)}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowAutomations(!showAutomations)}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="ml-2">Panels</span>
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
                ) : brianMessages.length === 0 && brianDemoMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <p className="text-muted-foreground">Start a conversation with Brian, your AI COO</p>
                  </div>
                ) : (
                  [...brianMessages, ...brianDemoMessages].map((msg, idx) => {
                    const isUserMessage = msg.role === "user";
                    const isSelected = selectedBrianIndices.has(idx);
                    const msgTimestamp = (msg as any).timestamp ? new Date((msg as any).timestamp) : new Date();
                    const allMessages = [...brianMessages, ...brianDemoMessages];
                    
                    // Check if we need a demo session separator
                    const isDemoMessage = idx >= brianMessages.length;
                    const prevIsDemoMessage = idx > 0 && (idx - 1) >= brianMessages.length;
                    const showDemoSeparator = isDemoMessage && !prevIsDemoMessage;
                    const currentHour = new Date().getHours();
                    const sessionText = currentHour < 12 ? "Morning Session" : currentHour < 17 ? "Afternoon Session" : "Evening Session";
                    
                    return (
                      <div key={idx}>
                        {showDemoSeparator && (
                          <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-border" />
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/60 rounded-full border border-border/50">
                              <span className="text-xs font-medium text-muted-foreground">
                                {format(new Date(), "d MMM yyyy")} • {sessionText}
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <div
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
                           <BrianAvatar size="md" rounded="full" />
                         )}
                         <div className={isUserMessage ? "flex flex-col items-end" : "flex-1"}>
                           <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                             <span className="font-semibold">
                               {isUserMessage ? "You" : "Brian"}
                             </span>
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
                               isUserMessage
                                 ? "bg-primary text-white"
                                 : "bg-muted/80"
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
                           {/* Agent Recommendation Card */}
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
                {/* Typing Indicator for Brian Demo - rendered inside scroll area as its own message */}
                {isBrianDemoSending && (
                  <div className="flex gap-3 items-start">
                    <BrianAvatar size="md" rounded="full" />
                    <div className="inline-block px-4 py-3 rounded-2xl bg-muted/80 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Waitlist CTA in chat area */}
                {showWaitlistButton.has("brian") && (
                  <div className="flex justify-center py-4 animate-fade-in">
                    <Button
                      onClick={() => setShowWaitlistDialog(true)}
                      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Join the waitlist to get early access
                    </Button>
                  </div>
                )}
                <div ref={brianMessagesEndRef} />
              </div>
            </ScrollArea>

            {/* Brian Input */}
            <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
              <div className="space-y-2 max-w-4xl mx-auto">
                {disabledChats.has("brian") ? (
                  <div className="flex gap-2 w-full">
                    <Input
                      placeholder="Join the Elixa waiting list!"
                      className="flex-1 opacity-60"
                      disabled
                    />
                    <Button disabled>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Message Brian..."
                      value={brianInput}
                      onChange={(e) => setBrianInput(e.target.value)}
                      disabled={isBrianDemoSending}
                      className={isMobile ? 'text-base flex-1' : 'flex-1'}
                      onKeyPress={async (e) => {
                        if (e.key === "Enter" && brianInput.trim() && !isBrianDemoSending) {
                          e.preventDefault();
                          const responses = getChatResponse("brian");
                          if (!responses) {
                            toast({ title: "Demo Mode", description: "No responses configured for Brian." });
                            return;
                          }
                          
                          setIsBrianDemoSending(true);
                          const userMessage = {
                            role: "user" as const,
                            content: brianInput,
                            timestamp: new Date().toISOString()
                          };
                          setBrianDemoMessages(prev => [...prev, userMessage]);
                          setBrianInput("");
                          
                          // Wait 3 seconds, then add response 1
                          await new Promise(r => setTimeout(r, 3000));
                          const response1 = {
                            role: "assistant" as const,
                            content: responses.response1,
                            timestamp: new Date().toISOString()
                          };
                          setBrianDemoMessages(prev => [...prev, response1]);
                          setIsBrianDemoSending(false);
                          
                          // Wait 1 second (no typing), then start typing for 1 second
                          await new Promise(r => setTimeout(r, 1000));
                          setIsBrianDemoSending(true);
                          await new Promise(r => setTimeout(r, 1000));
                          const response2 = {
                            role: "assistant" as const,
                            content: responses.response2,
                            timestamp: new Date().toISOString()
                          };
                          setBrianDemoMessages(prev => [...prev, response2]);
                          
                          setDisabledChats(prev => new Set([...prev, "brian"]));
                          setIsBrianDemoSending(false);
                          
                          // Show waitlist button after 1 second
                          await new Promise(r => setTimeout(r, 1000));
                          setShowWaitlistButton(prev => new Set([...prev, "brian"]));
                        }
                      }}
                    />
                    <Button
                      disabled={isBrianDemoSending || !brianInput.trim()}
                      onClick={async () => {
                        if (!brianInput.trim() || isBrianDemoSending) return;
                        const responses = getChatResponse("brian");
                        if (!responses) {
                          toast({ title: "Demo Mode", description: "No responses configured for Brian." });
                          return;
                        }
                        
                        setIsBrianDemoSending(true);
                        const userMessage = {
                          role: "user" as const,
                          content: brianInput,
                          timestamp: new Date().toISOString()
                        };
                        setBrianDemoMessages(prev => [...prev, userMessage]);
                        setBrianInput("");
                        
                        // Wait 3 seconds, then add response 1
                        await new Promise(r => setTimeout(r, 3000));
                        const response1 = {
                          role: "assistant" as const,
                          content: responses.response1,
                          timestamp: new Date().toISOString()
                        };
                        setBrianDemoMessages(prev => [...prev, response1]);
                        setIsBrianDemoSending(false);
                        
                        // Wait 1 second (no typing), then start typing for 1 second
                        await new Promise(r => setTimeout(r, 1000));
                        setIsBrianDemoSending(true);
                        await new Promise(r => setTimeout(r, 1000));
                        const response2 = {
                          role: "assistant" as const,
                          content: responses.response2,
                          timestamp: new Date().toISOString()
                        };
                        setBrianDemoMessages(prev => [...prev, response2]);
                        
                        setDisabledChats(prev => new Set([...prev, "brian"]));
                        setIsBrianDemoSending(false);
                        
                        // Show waitlist button after 1 second
                        await new Promise(r => setTimeout(r, 1000));
                        setShowWaitlistButton(prev => new Set([...prev, "brian"]));
                      }}
                    >
                      {isBrianDemoSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
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
                      <TeamMemberAvatar
                        memberId={member.id}
                        size="md"
                      />
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
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
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
                        teamMemberMessages.map((msg, index) => {
                          const isUserMessage = msg.user_id !== null || msg.sender_name === 'Liam';
                          // Blue for managers, orange for workers
                          const msgIconColor = member.isManager ? "text-blue-500" : "text-orange-500";
                          const msgBgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
                          const msgDate = new Date(msg.created_at);
                          // Check if content contains HTML tags (director messages have HTML)
                          const hasHtmlContent = msg.content.includes('<') && msg.content.includes('>');
                          
                          // Check if we need a demo session separator
                          const isDemoMessage = msg.id.startsWith('user-') || msg.id.startsWith('agent1-') || msg.id.startsWith('agent2-');
                          const prevMsg = index > 0 ? teamMemberMessages[index - 1] : null;
                          const prevIsDemoMessage = prevMsg && (prevMsg.id.startsWith('user-') || prevMsg.id.startsWith('agent1-') || prevMsg.id.startsWith('agent2-'));
                          const showDemoSeparator = isDemoMessage && !prevIsDemoMessage;
                          const currentHour = new Date().getHours();
                          const sessionText = currentHour < 12 ? "Morning Session" : currentHour < 17 ? "Afternoon Session" : "Evening Session";
                          
                          return (
                            <div key={msg.id}>
                              {showDemoSeparator && (
                                <div className="flex items-center gap-4 my-6">
                                  <div className="flex-1 h-px bg-border" />
                                  <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/60 rounded-full border border-border/50">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {format(new Date(), "d MMM yyyy")} • {sessionText}
                                    </span>
                                  </div>
                                  <div className="flex-1 h-px bg-border" />
                                </div>
                              )}
                              <div className={`flex gap-4 group ${isUserMessage ? "justify-end" : ""}`}>
                              {!isUserMessage && (
                                <div className="flex-shrink-0 self-center">
                                  <TeamMemberAvatar
                                    memberId={msg.agent_id || member.id}
                                    size="xl"
                                  />
                                </div>
                              )}
                              <div className={`${isUserMessage ? "flex flex-col items-end" : "flex-1"} self-center`}>
                                <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                                  <span className="font-semibold">
                                    {isUserMessage ? "You" : (msg.sender_name || member.name)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(msgDate, "d MMM, h:mm a")}
                                  </span>
                                </div>
                                <div
                                  className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                    isUserMessage
                                      ? "bg-primary text-white"
                                      : "bg-muted/80"
                                  }`}
                                >
                                    {hasHtmlContent ? (
                                      <div 
                                        className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'} [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:my-1`}
                                        dangerouslySetInnerHTML={{ __html: msg.content }}
                                      />
                                    ) : (
                                      <div className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                                {/* File attachments */}
                                {msg.files && msg.files.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {msg.files.map((file: any, idx: number) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          setPreviewFile({
                                            name: file.name,
                                            type: file.type,
                                            size: file.size,
                                            uploadedBy: msg.sender_name || member.name,
                                            uploadedAt: msg.created_at,
                                          });
                                          setFilePreviewOpen(true);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-muted/50 ${
                                          isUserMessage ? 'bg-primary/20 border-primary/30' : 'bg-muted/50 border-border'
                                        }`}
                                      >
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {/* Agent Recommendation Card */}
                                {msg.recommendedAgent && (
                                  <AgentRecommendationCard
                                    agentId={msg.recommendedAgent.id}
                                    agentName={msg.recommendedAgent.name}
                                    description={msg.recommendedAgent.description}
                                    category={msg.recommendedAgent.category}
                                    rating={msg.recommendedAgent.rating}
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
                      
                      {/* Typing Indicator */}
                      {isTeamMemberSending && (
                        <div className="flex gap-3">
                          <div className={`h-10 w-10 rounded-full ${member.isManager ? 'bg-blue-500/20' : 'bg-orange-500/20'} flex items-center justify-center flex-shrink-0`}>
                            <Bot className={`h-6 w-6 ${member.isManager ? 'text-blue-500' : 'text-orange-500'}`} />
                          </div>
                          <div className="inline-block px-4 py-3 rounded-2xl bg-muted/80 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Waitlist CTA in chat area */}
                      {showWaitlistButton.has(selectedTeamMemberId) && (
                        <div className="flex justify-center py-4 animate-fade-in">
                          <Button
                            onClick={() => setShowWaitlistDialog(true)}
                            className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                            Join the waitlist to get early access
                          </Button>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Team Member Input */}
                  <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
                    <div className="space-y-2 max-w-4xl mx-auto">
                      {disabledChats.has(selectedTeamMemberId) ? (
                        <div className="flex gap-2 w-full">
                          <Input
                            placeholder="Join the Elixa waiting list!"
                            className="flex-1 opacity-60"
                            disabled
                          />
                          <Button disabled>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Message ${member.name}...`}
                            value={teamMemberInput}
                            onChange={(e) => setTeamMemberInput(e.target.value)}
                            className="flex-1"
                            disabled={isTeamMemberSending}
                            onKeyPress={async (e) => {
                              if (e.key === "Enter" && teamMemberInput.trim() && !isTeamMemberSending) {
                                e.preventDefault();
                                const responses = getChatResponse(selectedTeamMemberId);
                                if (!responses) {
                                  toast({ title: "Demo Mode", description: "No responses configured for this chat." });
                                  return;
                                }
                                
                                setIsTeamMemberSending(true);
                                const userMessage = {
                                  id: `user-${Date.now()}`,
                                  content: teamMemberInput,
                                  user_id: "demo-user",
                                  agent_id: null,
                                  sender_name: "You",
                                  created_at: new Date().toISOString()
                                };
                                setTeamMemberMessages(prev => [...prev, userMessage]);
                                setTeamMemberInput("");
                                
                                await new Promise(r => setTimeout(r, 3000));
                                const response1 = {
                                  id: `agent1-${Date.now()}`,
                                  content: responses.response1,
                                  user_id: null,
                                  agent_id: responses.agent1.id,
                                  sender_name: responses.agent1.name,
                                  created_at: new Date().toISOString()
                                };
                                setTeamMemberMessages(prev => [...prev, response1]);
                                setIsTeamMemberSending(false);
                                
                                await new Promise(r => setTimeout(r, 1000));
                                setIsTeamMemberSending(true);
                                await new Promise(r => setTimeout(r, 1000));
                                const response2 = {
                                  id: `agent2-${Date.now()}`,
                                  content: responses.response2,
                                  user_id: null,
                                  agent_id: responses.agent2.id,
                                  sender_name: responses.agent2.name,
                                  created_at: new Date().toISOString()
                                };
                                setTeamMemberMessages(prev => [...prev, response2]);
                                
                                // Store demo messages for persistence
                                setDemoMessages(prev => ({
                                  ...prev,
                                  [selectedTeamMemberId]: [userMessage, response1, response2]
                                }));
                                
                                setDisabledChats(prev => new Set([...prev, selectedTeamMemberId]));
                                setIsTeamMemberSending(false);
                                
                                // Show waitlist button after 1 second
                                await new Promise(r => setTimeout(r, 1000));
                                setShowWaitlistButton(prev => new Set([...prev, selectedTeamMemberId]));
                              }
                            }}
                          />
                          <Button
                            disabled={isTeamMemberSending || !teamMemberInput.trim()}
                            onClick={async () => {
                              if (!teamMemberInput.trim() || isTeamMemberSending) return;
                              const responses = getChatResponse(selectedTeamMemberId);
                              if (!responses) {
                                toast({ title: "Demo Mode", description: "No responses configured for this chat." });
                                return;
                              }
                              
                              setIsTeamMemberSending(true);
                              const userMessage = {
                                id: `user-${Date.now()}`,
                                content: teamMemberInput,
                                user_id: "demo-user",
                                agent_id: null,
                                sender_name: "You",
                                created_at: new Date().toISOString()
                              };
                              setTeamMemberMessages(prev => [...prev, userMessage]);
                              setTeamMemberInput("");
                              
                              await new Promise(r => setTimeout(r, 3000));
                              const response1 = {
                                id: `agent1-${Date.now()}`,
                                content: responses.response1,
                                user_id: null,
                                agent_id: responses.agent1.id,
                                sender_name: responses.agent1.name,
                                created_at: new Date().toISOString()
                              };
                              setTeamMemberMessages(prev => [...prev, response1]);
                              setIsTeamMemberSending(false);
                              
                              await new Promise(r => setTimeout(r, 1000));
                              setIsTeamMemberSending(true);
                              await new Promise(r => setTimeout(r, 1000));
                              const response2 = {
                                id: `agent2-${Date.now()}`,
                                content: responses.response2,
                                user_id: null,
                                agent_id: responses.agent2.id,
                                sender_name: responses.agent2.name,
                                created_at: new Date().toISOString()
                              };
                              setTeamMemberMessages(prev => [...prev, response2]);
                              
                              // Store demo messages for persistence
                              setDemoMessages(prev => ({
                                ...prev,
                                [selectedTeamMemberId]: [userMessage, response1, response2]
                              }));
                              
                              setDisabledChats(prev => new Set([...prev, selectedTeamMemberId]));
                              setIsTeamMemberSending(false);
                              
                              // Show waitlist button after 1 second
                              await new Promise(r => setTimeout(r, 1000));
                              setShowWaitlistButton(prev => new Set([...prev, selectedTeamMemberId]));
                            }}
                          >
                            {isTeamMemberSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
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
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: team.gradient }}>
                        <Users className="h-5 w-5 text-white" />
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
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
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
                        teamGroupMessages.map((msg, index) => {
                          // Liam is the user (You) - treat his messages as user messages (blue bubbles)
                          const isUserMessage = msg.user_id !== null || msg.sender_name === "Liam";
                          // Look up member info for proper name and avatar
                          const memberInfo = msg.agent_id ? getTeamMemberById(msg.agent_id) : null;
                          const displayName = memberInfo?.member.name || msg.sender_name;
                          const msgIconColor = msg.isManager ? "text-blue-500" : "text-orange-500";
                          const msgBgColor = msg.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
                          const msgDate = new Date(msg.created_at);
                          const msgHour = msgDate.getHours();
                          
                          // Check if we need a session separator
                          let showSeparator = false;
                          let separatorText = "";
                          const isDemoMessage = msg.id.startsWith('user-') || msg.id.startsWith('agent1-') || msg.id.startsWith('agent2-');
                          const prevMsg = index > 0 ? teamGroupMessages[index - 1] : null;
                          const prevIsDemoMessage = prevMsg && (prevMsg.id.startsWith('user-') || prevMsg.id.startsWith('agent1-') || prevMsg.id.startsWith('agent2-'));
                          
                          if (index === 0) {
                            showSeparator = true;
                            separatorText = msgHour < 12 ? "Morning Session" : msgHour < 17 ? "Afternoon Session" : "Evening Session";
                          } else if (isDemoMessage && !prevIsDemoMessage) {
                            // Show session divider before first demo message based on current time
                            showSeparator = true;
                            const currentHour = new Date().getHours();
                            separatorText = currentHour < 12 ? "Morning Session" : currentHour < 17 ? "Afternoon Session" : "Evening Session";
                          } else {
                            const prevDate = new Date(teamGroupMessages[index - 1].created_at);
                            const prevHour = prevDate.getHours();
                            // Show separator when crossing session boundaries (12PM or 5PM)
                            if ((prevHour < 12 && msgHour >= 12) || (prevHour < 17 && msgHour >= 17 && prevHour >= 12)) {
                              showSeparator = true;
                              separatorText = msgHour < 17 ? "Afternoon Session" : "Evening Session";
                            }
                          }
                          
                          return (
                            <div key={msg.id}>
                              {showSeparator && (
                                <div className="flex items-center gap-4 my-6">
                                  <div className="flex-1 h-px bg-border" />
                                  <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/60 rounded-full border border-border/50">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {format(msgDate, "d MMM yyyy")} • {separatorText}
                                    </span>
                                  </div>
                                  <div className="flex-1 h-px bg-border" />
                                </div>
                              )}
                              <div className={`flex gap-4 group ${isUserMessage ? "justify-end" : ""}`}>
                                {!isUserMessage && (
                                  <div className="flex-shrink-0 self-center">
                                    <TeamMemberAvatar
                                      memberId={msg.agent_id}
                                      name={msg.sender_name}
                                      isManager={msg.isManager}
                                      size="xl"
                                    />
                                  </div>
                                )}
                                <div className={`${isUserMessage ? "flex flex-col items-end" : "flex-1"} self-center`}>
                                  <div className={`flex items-center gap-2 ${isUserMessage ? "mb-0.5 flex-row-reverse" : "mb-2"}`}>
                                    <span className="font-semibold">
                                      {isUserMessage ? "You" : displayName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(msgDate, "d MMM, h:mm a")}
                                    </span>
                                  </div>
                               <div
                                  className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm backdrop-blur-sm ${
                                    isUserMessage
                                      ? "bg-primary text-white"
                                      : "bg-muted/80"
                                  }`}
                                >
                                  <div 
                                    className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'} [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:my-1`}
                                    dangerouslySetInnerHTML={{ __html: msg.content }}
                                  />
                                </div>
                                {msg.files && msg.files.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {msg.files.map((file, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          setPreviewFile({
                                            name: file.name,
                                            type: file.type,
                                            size: file.size,
                                            uploadedBy: msg.sender_name,
                                            uploadedAt: msg.created_at,
                                          });
                                          setFilePreviewOpen(true);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 bg-muted/60 rounded-lg border border-border/50 max-w-[300px] hover:bg-muted/80 hover:border-primary/30 transition-all cursor-pointer text-left w-full"
                                      >
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                          <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{file.name}</p>
                                          <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                        </div>
                                        <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center">
                                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                      </button>
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
                            </div>
                          );
                        })
                      )}
                      
                      {/* Typing Indicator */}
                      {isTeamGroupSending && (
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-6 w-6 text-primary" />
                          </div>
                          <div className="inline-block px-4 py-3 rounded-2xl bg-muted/80 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Waitlist CTA in chat area */}
                      {showWaitlistButton.has(selectedTeamGroupId) && (
                        <div className="flex justify-center py-4 animate-fade-in">
                          <Button
                            onClick={() => setShowWaitlistDialog(true)}
                            className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                            Join the waitlist to get early access
                          </Button>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Team Group Input */}
                  <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
                    <div className="space-y-2 max-w-4xl mx-auto">
                      {disabledChats.has(selectedTeamGroupId) ? (
                        <div className="flex gap-2 w-full">
                          <Input
                            placeholder="Join the Elixa waiting list!"
                            className="flex-1 opacity-60"
                            disabled
                          />
                          <Button disabled>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Message ${team.name}...`}
                            value={teamGroupInput}
                            onChange={(e) => setTeamGroupInput(e.target.value)}
                            className="flex-1"
                            disabled={isTeamGroupSending}
                            onKeyPress={async (e) => {
                              if (e.key === "Enter" && teamGroupInput.trim() && !isTeamGroupSending) {
                                e.preventDefault();
                                const responses = getChatResponse(selectedTeamGroupId);
                                if (!responses) {
                                  toast({ title: "Demo Mode", description: "No responses configured for this chat." });
                                  return;
                                }
                                
                                setIsTeamGroupSending(true);
                                const userMessage = {
                                  id: `user-${Date.now()}`,
                                  content: teamGroupInput,
                                  user_id: "demo-user",
                                  agent_id: null,
                                  sender_name: "You",
                                  created_at: new Date().toISOString()
                                };
                                setTeamGroupMessages(prev => [...prev, userMessage]);
                                setTeamGroupInput("");
                                
                                await new Promise(r => setTimeout(r, 3000));
                                const response1 = {
                                  id: `agent1-${Date.now()}`,
                                  content: responses.response1,
                                  user_id: null,
                                  agent_id: responses.agent1.id,
                                  sender_name: responses.agent1.name,
                                  created_at: new Date().toISOString()
                                };
                                setTeamGroupMessages(prev => [...prev, response1]);
                                setIsTeamGroupSending(false);
                                
                                await new Promise(r => setTimeout(r, 1000));
                                setIsTeamGroupSending(true);
                                await new Promise(r => setTimeout(r, 1000));
                                const response2 = {
                                  id: `agent2-${Date.now()}`,
                                  content: responses.response2,
                                  user_id: null,
                                  agent_id: responses.agent2.id,
                                  sender_name: responses.agent2.name,
                                  created_at: new Date().toISOString()
                                };
                                setTeamGroupMessages(prev => [...prev, response2]);
                                
                                // Store demo messages for persistence
                                setDemoMessages(prev => ({
                                  ...prev,
                                  [selectedTeamGroupId]: [userMessage, response1, response2]
                                }));
                                
                                setDisabledChats(prev => new Set([...prev, selectedTeamGroupId]));
                                setIsTeamGroupSending(false);
                                
                                // Show waitlist button after 1 second
                                await new Promise(r => setTimeout(r, 1000));
                                setShowWaitlistButton(prev => new Set([...prev, selectedTeamGroupId]));
                              }
                            }}
                          />
                          <Button
                            disabled={isTeamGroupSending || !teamGroupInput.trim()}
                            onClick={async () => {
                              if (!teamGroupInput.trim() || isTeamGroupSending) return;
                              const responses = getChatResponse(selectedTeamGroupId);
                              if (!responses) {
                                toast({ title: "Demo Mode", description: "No responses configured for this chat." });
                                return;
                              }
                              
                              setIsTeamGroupSending(true);
                              const userMessage = {
                                id: `user-${Date.now()}`,
                                content: teamGroupInput,
                                user_id: "demo-user",
                                agent_id: null,
                                sender_name: "You",
                                created_at: new Date().toISOString()
                              };
                              setTeamGroupMessages(prev => [...prev, userMessage]);
                              setTeamGroupInput("");
                              
                              await new Promise(r => setTimeout(r, 3000));
                              const response1 = {
                                id: `agent1-${Date.now()}`,
                                content: responses.response1,
                                user_id: null,
                                agent_id: responses.agent1.id,
                                sender_name: responses.agent1.name,
                                created_at: new Date().toISOString()
                              };
                              setTeamGroupMessages(prev => [...prev, response1]);
                              setIsTeamGroupSending(false);
                              
                              await new Promise(r => setTimeout(r, 1000));
                              setIsTeamGroupSending(true);
                              await new Promise(r => setTimeout(r, 1000));
                              const response2 = {
                                id: `agent2-${Date.now()}`,
                                content: responses.response2,
                                user_id: null,
                                agent_id: responses.agent2.id,
                                sender_name: responses.agent2.name,
                                created_at: new Date().toISOString()
                              };
                              setTeamGroupMessages(prev => [...prev, response2]);
                              
                              // Store demo messages for persistence
                              setDemoMessages(prev => ({
                                ...prev,
                                [selectedTeamGroupId]: [userMessage, response1, response2]
                              }));
                              
                              setDisabledChats(prev => new Set([...prev, selectedTeamGroupId]));
                              setIsTeamGroupSending(false);
                              
                              // Show waitlist button after 1 second
                              await new Promise(r => setTimeout(r, 1000));
                              setShowWaitlistButton(prev => new Set([...prev, selectedTeamGroupId]));
                            }}
                          >
                            {isTeamGroupSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
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
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(true)}
              disabled={!selectedChat}
            >
              <Settings className="h-4 w-4" />
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
                             ? "bg-primary text-white"
                             : msg.error_message
                             ? "bg-destructive/10 border border-destructive"
                               : "bg-muted/80"
                           }`}
                         >
                           <div className={`text-sm prose prose-sm max-w-none text-left ${isMobile ? 'break-words' : ''} ${isUserMessage ? 'text-white [&_*]:!text-white' : 'dark:prose-invert'}`}>
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {msg.content}
                             </ReactMarkdown>
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
      {(selectedChat || showBrian || selectedTeamMemberId || selectedTeamGroupId) && (
        <Sheet open={showAutomations} onOpenChange={setShowAutomations}>
          <SheetContent side="right" className="w-full sm:w-96 p-0 [&>button:first-child]:hidden">
            <div className="h-full flex flex-col">
              <ChatRightPanel
                showBrian={showBrian}
                selectedChat={selectedChat}
                selectedTeamMemberId={selectedTeamMemberId}
                selectedTeamGroupId={selectedTeamGroupId}
                rightSidebarTab={rightSidebarTab}
                onTabChange={setRightSidebarTab}
                workspaceId={workspaceId || ''}
                userId={user?.id || ''}
                onFilePreview={(file) => {
                  setPreviewFile(file);
                  setFilePreviewOpen(true);
                }}
                onSelectTeamMember={(memberId) => {
                  setSelectedTeamGroupId(null);
                  setSelectedTeamMemberId(memberId);
                  setShowAutomations(false);
                }}
                showCloseButton={true}
                onClose={() => setShowAutomations(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Right Sidebar - Tabbed Panels (Desktop Only) */}
      {(selectedChat || showBrian || selectedTeamMemberId || selectedTeamGroupId) && (
        <div className="hidden lg:block w-80 border-l border-border/50 bg-gradient-to-b from-muted/30 to-muted/50 backdrop-blur-xl overflow-hidden shadow-xl">
          <ChatRightPanel
            showBrian={showBrian}
            selectedChat={selectedChat}
            selectedTeamMemberId={selectedTeamMemberId}
            selectedTeamGroupId={selectedTeamGroupId}
            rightSidebarTab={rightSidebarTab}
            onTabChange={setRightSidebarTab}
            workspaceId={workspaceId || ''}
            userId={user?.id || ''}
            onFilePreview={(file) => {
              setPreviewFile(file);
              setFilePreviewOpen(true);
            }}
            onSelectTeamMember={(memberId) => {
              setSelectedTeamGroupId(null);
              setSelectedTeamMemberId(memberId);
            }}
          />
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

      {/* File Preview Dialog */}
      <FilePreviewDialog
        open={filePreviewOpen}
        onOpenChange={setFilePreviewOpen}
        file={previewFile}
        uploadedBy={previewFile?.uploadedBy}
        uploadedAt={previewFile?.uploadedAt}
      />
      </div>
    </div>
  );
};

export default Workspace;
