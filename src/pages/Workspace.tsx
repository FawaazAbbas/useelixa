import { useState, useEffect } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search, LayoutList, X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

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
  const [selectedChat, setSelectedChat] = useState<any>(agents[0]);
  const [message, setMessage] = useState("");
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showAutomations, setShowAutomations] = useState(false);
  
  const isGroupChat = selectedChat.type === "group";
  const currentMessages = isGroupChat ? mockGroupMessages : mockMessages;

  useEffect(() => {
    if (workspaceId) {
      fetchAutomations();
    }
  }, [workspaceId]);

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
      {/* Sidebar */}
      <div className="w-64 bg-chat-sidebar border-r border-chat-border flex flex-col">
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
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedChat(agent)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors ${
                    selectedChat.id === agent.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {agent.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background ${
                      agent.status === "online" ? "bg-green-500" : "bg-gray-500"
                    }`} />
                  </div>
                  <span className="text-sm truncate text-white">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Group Chats */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Group Chats</h3>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {groupChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors ${
                    selectedChat.id === chat.id ? "bg-muted/50" : ""
                  }`}
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="text-sm truncate text-white">{chat.name}</div>
                    <div className="text-xs text-muted-foreground">{chat.memberCount} members</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Marketplace Button */}
        <div className="p-3 border-t border-chat-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/marketplace')}
          >
            <Store className="h-4 w-4" />
            <span>Browse Marketplace</span>
          </Button>
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
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {isGroupChat ? (
              <>
                <Hash className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{selectedChat.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedChat.members.join(", ")}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Avatar>
                  <AvatarFallback>
                    {selectedChat.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{selectedChat.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedChat.status}</div>
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${!msg.isAgent ? "flex-row-reverse" : ""}`}
              >
                <Avatar>
                  <AvatarFallback>
                    {msg.isAgent ? (msg.avatar || msg.sender.substring(0, 2).toUpperCase()) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${!msg.isAgent ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.isAgent
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              placeholder={`Message ${selectedChat.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Handle send
                }
              }}
            />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Automations */}
      <div className={`${showAutomations ? 'fixed inset-0 z-50 bg-background lg:relative lg:z-auto' : 'hidden'} lg:block w-full lg:w-80 border-l bg-muted/30 p-4 overflow-y-auto`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Automations</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowAutomations(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
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
                          onClick={() => handleSeeTask(automation.task!.id)}
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
