import { useState } from "react";
import { Send, Plus, Settings, Hash, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const agents = [
  { id: "1", name: "customer-support-pro", status: "online" },
  { id: "2", name: "content-creator-ai", status: "online" },
  { id: "3", name: "data-analyst", status: "offline" },
];

const mockMessages = [
  {
    id: "1",
    sender: "customer-support-pro",
    content: "Hello! I'm ready to help with customer inquiries. You can ask me to check tickets, respond to customers, or analyze support trends.",
    timestamp: "10:30 AM",
    isAgent: true,
  },
  {
    id: "2",
    sender: "You",
    content: "Show me the latest customer tickets",
    timestamp: "10:32 AM",
    isAgent: false,
  },
  {
    id: "3",
    sender: "customer-support-pro",
    content: "Here are the 5 most recent tickets:\n\n1. Ticket #234 - Login issue (Priority: High)\n2. Ticket #235 - Feature request (Priority: Low)\n3. Ticket #236 - Billing question (Priority: Medium)\n4. Ticket #237 - Bug report (Priority: High)\n5. Ticket #238 - General inquiry (Priority: Low)\n\nWould you like me to provide more details on any of these?",
    timestamp: "10:32 AM",
    isAgent: true,
  },
];

const Workspace = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [message, setMessage] = useState("");

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-chat-sidebar border-r border-chat-border flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-chat-border">
          <button className="flex items-center justify-between w-full hover:bg-muted/50 rounded px-3 py-2 transition-colors">
            <div>
              <div className="font-bold text-white">My Workspace</div>
              <div className="text-xs text-muted-foreground">3 active agents</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-chat-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-9 bg-chat-bg border-chat-border text-white placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Agent List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Your Agents</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => navigate("/")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/50 transition-colors ${
                    selectedAgent.id === agent.id ? "bg-primary/20 text-white" : "text-muted-foreground"
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium truncate">{agent.name}</span>
                  {agent.status === "online" && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-3 border-t border-chat-border">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-muted/50 transition-colors">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-sm font-bold">
              U
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">User</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">{selectedAgent.name}</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isAgent ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    msg.isAgent ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 ${msg.isAgent ? "" : "flex flex-col items-end"}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 inline-block max-w-2xl ${
                      msg.isAgent
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                placeholder={`Message ${selectedAgent.name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // Handle send message
                    setMessage("");
                  }
                }}
                className="flex-1"
              />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
