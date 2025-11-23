import { useState, useEffect } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search, LayoutList, X, Store, Loader2, Users } from "lucide-react";
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
    }
  }, [selectedChat, fetchMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat?.id || sending) return;

    const messageText = message;
    setMessage("");
    
    if (selectedChat.type === 'group') {
      const agentIds = selectedChat.agents?.map((a: any) => a.id) || [];
      await sendMessage(selectedChat.id, agentIds, messageText, 'group');
    } else {
      await sendMessage(selectedChat.id, selectedChat.agent_id, messageText, 'direct');
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
                      selectedChat?.id === chat.id ? "bg-muted/50" : ""
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
                    selectedChat?.id === chat.id ? "bg-muted/50" : ""
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
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowAutomations(!showAutomations)}
            >
              <LayoutList className="h-4 w-4" />
              <span className="ml-2">Automations</span>
            </Button>
            <Button variant="ghost" size="icon">
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
                      <div
                        className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
                          isUserMessage
                            ? "bg-primary text-primary-foreground"
                            : msg.error_message
                            ? "bg-destructive/10 border border-destructive"
                            : "bg-muted"
                        }`}
                      >
                        <div className={`text-sm prose prose-sm dark:prose-invert max-w-none ${isMobile ? 'break-words' : ''}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
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
                  <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className={`p-4 border-t ${isMobile ? 'pb-safe' : ''}`}>
          <div className="flex gap-2 max-w-4xl mx-auto">
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
              disabled={!selectedChat || sending}
              className={isMobile ? 'text-base' : ''}
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage} 
              disabled={!selectedChat || sending || !message.trim()}
              className={isMobile ? 'h-10 w-10' : ''}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Automations Drawer for Mobile/Tablet */}
      <Sheet open={showAutomations} onOpenChange={setShowAutomations}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Automations</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {automations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3">
                    <p className="text-sm text-muted-foreground">No automations yet</p>
                    <Button size="sm" onClick={() => navigate('/tasks')}>
                      Create Automation
                    </Button>
                  </div>
                ) : (
                  automations.map((automation) => (
                    <Card key={automation.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium">{automation.name}</h4>
                          <Badge
                            variant={getStatusColor(automation.status)}
                            className="text-xs"
                          >
                            {automation.status}
                          </Badge>
                        </div>

                        {automation.task && (
                          <div className="mb-2 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              As part of{" "}
                              <span className="font-medium text-foreground">
                                {automation.task.title}
                              </span>
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs w-full"
                              onClick={() => {
                                if (automation.task?.id) {
                                  handleSeeTask(automation.task.id);
                                  setShowAutomations(false);
                                }
                              }}
                            >
                              See Task
                            </Button>
                          </div>
                        )}

                        {automation.progress !== null && automation.progress > 0 && (
                          <div className="mb-2">
                            <Progress value={automation.progress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {automation.progress}% complete
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mb-1">
                          Trigger: {automation.trigger}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last run:{" "}
                          {automation.last_run
                            ? formatDistanceToNow(new Date(automation.last_run), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Right Sidebar - Automations (Desktop Only) */}
      <div className="hidden lg:block w-80 border-l bg-muted/30 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Automations</h3>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {automations.length === 0 ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No automations yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              automations.map((automation) => (
                <Card key={automation.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium">{automation.name}</h4>
                      <Badge
                        variant={getStatusColor(automation.status)}
                        className="text-xs"
                      >
                        {automation.status}
                      </Badge>
                    </div>

                    {automation.task && (
                      <div className="mb-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          As part of{" "}
                          <span className="font-medium text-foreground">
                            {automation.task.title}
                          </span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs w-full"
                          onClick={() => {
                            if (automation.task?.id) {
                              handleSeeTask(automation.task.id);
                            }
                          }}
                        >
                          See Task
                        </Button>
                      </div>
                    )}

                    {automation.progress !== null && automation.progress > 0 && (
                      <div className="mb-2">
                        <Progress value={automation.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {automation.progress}% complete
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mb-1">
                      Trigger: {automation.trigger}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last run:{" "}
                      {automation.last_run
                        ? formatDistanceToNow(new Date(automation.last_run), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
