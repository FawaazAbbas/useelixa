import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Loader2, Bot, Users, PanelRight, User, Copy, Check, Trash2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { ChatspaceSidebar, type InstalledAgent, type DMContact } from "@/components/ai-employees/ChatspaceSidebar";
import { AgentSettingsPanel } from "@/components/ai-employees/AgentSettingsPanel";
import { AgentMarketplace } from "@/components/ai-employees/AgentMarketplace";
import { MissingConnectionsDialog } from "@/components/ai-employees/MissingConnectionsDialog";
import { INTEGRATION_MAPPINGS } from "@/config/integrationMapping";
import { ProposalCard } from "@/components/ai-employees/ProposalCard";
import { AgentAvatar } from "@/components/ai-employees/AgentAvatar";
import { StreamingMessage } from "@/components/ai-employees/StreamingMessage";
import { AgentFileOutput } from "@/components/ai-employees/AgentFileOutput";
import { useAgentStream } from "@/hooks/useAgentStream";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ── Lazy-import the full Chat page for embedding ──
import Chat from "@/pages/Chat";

export interface AIEmployee {
  id: string;
  org_id: string;
  name: string;
  role: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
  allowed_tools: string[] | null;
  can_delegate_to: string[] | null;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  source?: "native" | "endpoint";
  developer_name?: string;
  avatarColor?: string | null;
}

interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface DMMessage {
  id: string;
  dm_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface FullInstallation {
  installationId: string;
  agentId: string;
  workspaceId: string;
  permissions: Record<string, unknown>;
  requiresApproval: boolean;
  riskTier: string;
  deployedAt: string | null;
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: string | null;
  executionStatus: string;
  capabilityManifest: Record<string, unknown> | null;
}

export default function AIEmployees() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [installations, setInstallations] = useState<FullInstallation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"elixa" | "agent" | "dm">("elixa");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [allAgents, setAllAgents] = useState<AIEmployee[]>([]);
  const [dmContacts, setDmContacts] = useState<DMContact[]>([]);
  const [missingDialog, setMissingDialog] = useState<{
    open: boolean;
    agentId: string;
    agentName: string;
    required: string[];
    connected: string[];
  }>({ open: false, agentId: "", agentName: "", required: [], connected: [] });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = installations.find((i) => i.installationId === selectedId) || null;
  const stream = useAgentStream(conversationId);

  // Fetch installations + all public agents + DM contacts
  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [installResult, agentsResult] = await Promise.all([
        supabase
          .from("agent_installations")
          .select("*, agent_submissions(id, name, description, icon_url, category, execution_status, capability_manifest)")
          .eq("user_id", user.id)
          .not("deployed_at", "is", null),
        supabase
          .from("agent_submissions")
          .select("*, developer_profiles(company_name)")
          .eq("status", "approved")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
      ]);

      const mapped: FullInstallation[] = (installResult.data || [])
        .filter((row: any) => row.agent_submissions)
        .map((row: any) => ({
          installationId: row.id,
          agentId: row.agent_id,
          workspaceId: row.workspace_id,
          permissions: row.permissions || {},
          requiresApproval: row.requires_approval,
          riskTier: row.risk_tier,
          deployedAt: row.deployed_at,
          name: row.agent_submissions.name,
          description: row.agent_submissions.description,
          iconUrl: row.agent_submissions.icon_url,
          category: row.agent_submissions.category,
          executionStatus: row.agent_submissions.execution_status,
          capabilityManifest: row.agent_submissions.capability_manifest,
        }));
      setInstallations(mapped);

      const agents: AIEmployee[] = (agentsResult.data || []).map((agent: any) => ({
        id: agent.id,
        org_id: "",
        name: agent.name,
        role: agent.category || "agent",
        description: agent.description,
        avatar_url: agent.icon_url,
        system_prompt: agent.system_prompt,
        allowed_tools: agent.allowed_tools,
        can_delegate_to: null,
        is_active: agent.execution_status === "ready",
        is_template: false,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        source: "endpoint" as const,
        developer_name: (agent.developer_profiles as any)?.company_name || undefined,
        avatarColor: (agent.capability_manifest as any)?.avatarColor || null,
        capabilityManifest: agent.capability_manifest || null,
      }));
      setAllAgents(agents);

      // Fetch DM contacts
      await fetchDMContacts();
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load agents");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  const fetchDMContacts = async () => {
    if (!user) return;
    const { data: dms } = await supabase
      .from("workspace_dms")
      .select("id, user_a, user_b")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
    
    if (!dms || dms.length === 0) { setDmContacts([]); return; }

    const otherUserIds = dms.map(dm => dm.user_a === user.id ? dm.user_b : dm.user_a);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", otherUserIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    setDmContacts(dms.map(dm => {
      const otherId = dm.user_a === user.id ? dm.user_b : dm.user_a;
      const profile = profileMap.get(otherId);
      return {
        dmId: dm.id,
        userId: otherId,
        displayName: profile?.display_name || "Unknown",
        avatarUrl: profile?.avatar_url || null,
      };
    }));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load messages when selection changes
  useEffect(() => {
    if (selectedType === "agent" && selectedId) {
      loadMessages(selectedId);
      setConversationId(null);
    } else if (selectedType === "dm" && selectedId) {
      loadDMMessages(selectedId);
    } else {
      setMessages([]);
      setDmMessages([]);
      setConversationId(null);
    }
  }, [selectedId, selectedType]);

  // Realtime for DM messages
  useEffect(() => {
    if (selectedType !== "dm" || !selectedId) return;
    const channel = supabase
      .channel(`dm-${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `dm_id=eq.${selectedId}`,
      }, (payload) => {
        setDmMessages(prev => [...prev, payload.new as DMMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, selectedType]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, dmMessages]);

  const loadMessages = async (installationId: string) => {
    const { data } = await supabase
      .from("agent_messages")
      .select("*")
      .eq("installation_id", installationId)
      .order("created_at", { ascending: true });

    setMessages(
      (data || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        metadata: m.metadata,
        created_at: m.created_at,
      }))
    );
  };

  const loadDMMessages = async (dmId: string) => {
    const { data } = await supabase
      .from("dm_messages")
      .select("*")
      .eq("dm_id", dmId)
      .order("created_at", { ascending: true });
    setDmMessages(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedId || !selected || !user) return;

    const text = input.trim();
    setInput("");
    setIsLoading(true);

    const convId = conversationId ?? crypto.randomUUID();
    if (!conversationId) setConversationId(convId);

    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: text, metadata: null, created_at: new Date().toISOString() },
    ]);

    try {
      await supabase.from("agent_messages").insert({
        workspace_id: selected.workspaceId,
        installation_id: selectedId,
        role: "user",
        content: text,
      });

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const orchestratorUrl = import.meta.env.VITE_ORCHESTRATOR_URL ?? "http://localhost:8000";
      const response = await fetch(`${orchestratorUrl}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          workspace_id: selected.workspaceId,
          user_id: user.id,
          message: text,
          agent_id: selected.agentId,
          conversation_id: convId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { detail?: string }).detail ?? `Request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = (data.message as string) || "I couldn't process that request.";
      const toolCalls: string[] = data.tool_calls_made || [];
      const outputFiles: { name: string; url: string; type: string }[] = data.files || [];

      await supabase.from("agent_messages").insert({
        workspace_id: selected.workspaceId,
        installation_id: selectedId,
        role: "assistant",
        content: assistantContent,
        metadata: { tool_calls: toolCalls, files: outputFiles },
      });

      setMessages((prev) => [
        ...prev,
        { id: `asst-${Date.now()}`, role: "assistant", content: assistantContent, metadata: { tool_calls: toolCalls, files: outputFiles }, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Sorry, I encountered an error. Please try again.", metadata: null, created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendDMMessage = async () => {
    if (!input.trim() || !selectedId || !user) return;
    const text = input.trim();
    setInput("");

    const optimistic: DMMessage = {
      id: `temp-${Date.now()}`,
      dm_id: selectedId,
      sender_id: user.id,
      content: text,
      created_at: new Date().toISOString(),
    };
    setDmMessages(prev => [...prev, optimistic]);

    const { error } = await supabase.from("dm_messages").insert({
      dm_id: selectedId,
      sender_id: user.id,
      content: text,
    });
    if (error) toast.error("Failed to send message");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedType === "dm") sendDMMessage();
      else sendMessage();
    }
  };

  const installedAgentIds = new Set(installations.map((i) => i.agentId));

  const installAgent = async (agentId: string) => {
    if (!workspaceId || !user) { toast.error("No workspace found."); return; }
    const agent = allAgents.find((a) => a.id === agentId);
    const manifest = (agent as any)?.capabilityManifest || (agent as any)?.capability_manifest;
    const toolsRequired = (manifest?.toolsRequired || []) as string[];

    if (toolsRequired.length > 0) {
      const { data: creds } = await supabase.from("user_credentials").select("credential_type, bundle_type").eq("user_id", user.id);
      const connectedKeys = (creds || []).map((c: any) => {
        const match = INTEGRATION_MAPPINGS.find(m => m.credentialType === c.credential_type && (!m.bundleType || m.bundleType === c.bundle_type));
        return match?.gatewayKey;
      }).filter(Boolean) as string[];
      const missing = toolsRequired.filter(k => !connectedKeys.includes(k));
      if (missing.length > 0) {
        setMissingDialog({ open: true, agentId, agentName: agent?.name || "Agent", required: toolsRequired, connected: connectedKeys });
        return;
      }
    }
    await doInstall(agentId);
  };

  const doInstall = async (agentId: string) => {
    if (!workspaceId || !user) return;
    try {
      setInstallingId(agentId);
      const { error } = await supabase.from("agent_installations").insert({
        agent_id: agentId, workspace_id: workspaceId, user_id: user.id, deployed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Agent installed & deployed");
      await fetchData();
    } catch (err) {
      console.error("Error installing agent:", err);
      toast.error("Failed to install agent");
    } finally { setInstallingId(null); }
  };

  const uninstallAgent = async (agentId: string) => {
    if (!user) return;
    try {
      setInstallingId(agentId);
      const { error } = await supabase.from("agent_installations").delete().eq("agent_id", agentId).eq("user_id", user.id);
      if (error) throw error;
      if (selected?.agentId === agentId) { setSelectedId(null); setShowSettings(false); setSelectedType("elixa"); }
      toast.success("Agent uninstalled");
      await fetchData();
    } catch (err) {
      console.error("Error uninstalling agent:", err);
      toast.error("Failed to uninstall agent");
    } finally { setInstallingId(null); }
  };

  const sidebarAgents: InstalledAgent[] = installations.map((i) => ({
    installationId: i.installationId,
    agentId: i.agentId,
    name: i.name,
    iconUrl: i.iconUrl,
    avatarColor: (i.capabilityManifest as any)?.avatarColor || null,
    category: i.category,
    executionStatus: i.executionStatus,
    deployedAt: i.deployedAt,
  }));

  const currentDMContact = dmContacts.find(d => d.dmId === selectedId);

  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <MainNavSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Sign in to use Chats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      <div className="flex-1 flex overflow-hidden">
        <ChatspaceSidebar
          agents={sidebarAgents}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelectElixa={() => { setSelectedType("elixa"); setSelectedId(null); setShowSettings(false); }}
          onSelect={(id) => { setSelectedType("agent"); setSelectedId(id); setShowSettings(false); }}
          onSelectDM={(dmId) => { setSelectedType("dm"); setSelectedId(dmId); setShowSettings(false); }}
          onBrowse={() => setShowBrowse(true)}
          dmContacts={dmContacts}
        />

        {/* Center pane */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedType === "elixa" ? (
            // Render full Chat experience embedded (without MainNavSidebar)
            <EmbeddedChatWrapper />
          ) : selectedType === "dm" && selectedId && currentDMContact ? (
            // DM chat
            <>
              <div className="h-14 border-b flex items-center px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentDMContact.avatarUrl || undefined} />
                    <AvatarFallback>{currentDMContact.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{currentDMContact.displayName}</p>
                    <p className="text-xs text-muted-foreground">Direct message</p>
                  </div>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 px-4">
                  {dmMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Avatar className="h-16 w-16 mb-4">
                        <AvatarImage src={currentDMContact.avatarUrl || undefined} />
                        <AvatarFallback className="text-2xl">{currentDMContact.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-medium text-foreground">{currentDMContact.displayName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Start a conversation</p>
                    </div>
                  )}
                  {dmMessages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={cn("flex items-start gap-3", isMe && "flex-row-reverse")}>
                        {isMe ? (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={currentDMContact.avatarUrl || undefined} />
                            <AvatarFallback>{currentDMContact.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-[75%]", isMe ? "ml-auto" : "mr-auto")}>
                          <div className={cn("rounded-2xl px-4 py-2.5", isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="border-t bg-card/80 backdrop-blur-sm p-4 flex-shrink-0">
                <div className="flex gap-3 items-end px-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${currentDMContact.displayName}…`}
                    className="min-h-[48px] max-h-[200px] resize-none rounded-xl"
                    rows={1}
                  />
                  <Button onClick={sendDMMessage} disabled={!input.trim()} size="icon" className="h-12 w-12 rounded-xl flex-shrink-0">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : selectedType === "agent" && selected ? (
            <>
              {/* Agent chat header */}
              <div className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <AgentAvatar
                    name={selected.name}
                    avatarColor={(selected.capabilityManifest as any)?.avatarColor}
                    iconUrl={selected.iconUrl}
                    className="h-8 w-8"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.executionStatus === "ready" ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(!showSettings)}>
                  <PanelRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6 px-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AgentAvatar
                        name={selected.name}
                        avatarColor={(selected.capabilityManifest as any)?.avatarColor}
                        iconUrl={selected.iconUrl}
                        className="h-16 w-16 mb-4"
                      />
                      <h3 className="text-lg font-medium text-foreground">{selected.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        {selected.description || "Start a conversation with this agent."}
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    const showTimeDivider = index > 0 && (() => {
                      const prevTime = new Date(messages[index - 1].created_at);
                      const currentTime = new Date(msg.created_at);
                      return (currentTime.getTime() - prevTime.getTime()) / (1000 * 60) > 30;
                    })();

                    const formatDividerTime = (timestamp: string) => {
                      const date = new Date(timestamp);
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      if (date.toDateString() === today.toDateString()) {
                        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      } else if (date.toDateString() === yesterday.toDateString()) {
                        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      }
                      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    };

                    return (
                      <div key={msg.id}>
                        {showTimeDivider && (
                          <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground px-2">
                              {formatDividerTime(msg.created_at)}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <AgentMessageBubble
                          msg={msg}
                          isUser={isUser}
                          agentName={selected.name}
                          agentAvatarColor={(selected.capabilityManifest as any)?.avatarColor}
                          agentIconUrl={selected.iconUrl}
                          onDelete={async () => {
                            await supabase.from("agent_messages").delete().eq("id", msg.id);
                            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          }}
                          onRetry={!isUser ? async () => {
                            let userIdx = index - 1;
                            while (userIdx >= 0 && messages[userIdx].role !== "user") userIdx--;
                            if (userIdx < 0) return;
                            await supabase.from("agent_messages").delete().eq("id", msg.id);
                            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                            setInput(messages[userIdx].content);
                          } : undefined}
                        />

                        {msg.metadata &&
                          Array.isArray((msg.metadata as any).actions) &&
                          (msg.metadata as any).actions
                            .filter((a: any) => a.type === "proposal")
                            .map((proposal: any, idx: number) => (
                              <div key={idx} className="ml-12 mt-2">
                                <ProposalCard
                                  proposalId={proposal.proposalId || `proposal-${idx}`}
                                  title={proposal.title || "Action Required"}
                                  summary={proposal.summary}
                                  status={proposal.status || "pending"}
                                />
                              </div>
                            ))}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <StreamingMessage
                      agentName={selected.name}
                      agentAvatarColor={(selected.capabilityManifest as any)?.avatarColor}
                      streamedText={stream.streamedText}
                      isStreaming={stream.isStreaming || isLoading}
                      activeToolCall={stream.activeToolCall}
                      toolCallHistory={stream.toolCallHistory}
                      error={stream.error}
                    />
                  )}
                </div>
              </ScrollArea>

              {/* Composer */}
              <div className="border-t bg-card/80 backdrop-blur-sm p-4 flex-shrink-0">
                <div className="w-full px-4">
                  <div className="flex gap-3 items-end">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selected.name}…`}
                      className="min-h-[48px] max-h-[200px] resize-none rounded-xl"
                      disabled={isLoading}
                      rows={1}
                    />
                    <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="h-12 w-12 rounded-xl flex-shrink-0">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="font-medium text-foreground">Select a chat</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a conversation from the sidebar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right pane */}
        {showSettings && selected && selectedType === "agent" && (
          <AgentSettingsPanel
            name={selected.name}
            description={selected.description}
            iconUrl={selected.iconUrl}
            category={selected.category}
            capabilityManifest={selected.capabilityManifest}
            permissions={selected.permissions}
            requiresApproval={selected.requiresApproval}
            riskTier={selected.riskTier}
            agentId={selected.agentId}
            onUninstall={() => uninstallAgent(selected.agentId)}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Browse Agents Dialog */}
        <Dialog open={showBrowse} onOpenChange={setShowBrowse}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Browse Agents</DialogTitle>
            </DialogHeader>
            <AgentMarketplace
              agents={allAgents}
              installedAgentIds={installedAgentIds}
              installingId={installingId}
              onInstall={installAgent}
              onUninstall={uninstallAgent}
              loading={dataLoading}
            />
          </DialogContent>
        </Dialog>

        <MissingConnectionsDialog
          open={missingDialog.open}
          onOpenChange={(open) => setMissingDialog((prev) => ({ ...prev, open }))}
          agentName={missingDialog.agentName}
          requiredIntegrations={missingDialog.required}
          connectedIntegrations={missingDialog.connected}
          onInstallAnyway={() => {
            setMissingDialog((prev) => ({ ...prev, open: false }));
            doInstall(missingDialog.agentId);
          }}
          installing={installingId === missingDialog.agentId}
        />
      </div>
    </div>
  );
}

// ── Embedded Chat wrapper (renders Chat without its own MainNavSidebar) ──
function EmbeddedChatWrapper() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Chat embedded />
    </div>
  );
}

// ── Message bubble component ──

interface AgentMessageBubbleProps {
  msg: AgentMessage;
  isUser: boolean;
  agentName: string;
  agentAvatarColor?: string | null;
  agentIconUrl?: string | null;
  onDelete?: () => void;
  onRetry?: () => void;
}

function AgentMessageBubble({ msg, isUser, agentName, agentAvatarColor, agentIconUrl, onDelete, onRetry }: AgentMessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [msg.content]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const markdownComponents = {
    code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      const isBlock = match || codeContent.includes('\n');
      if (isBlock) {
        return <CodeBlock language={match?.[1] || 'text'}>{codeContent}</CodeBlock>;
      }
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={cn("group flex items-start gap-3 w-full", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="h-9 w-9 rounded-full bg-muted border-2 border-muted flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <AgentAvatar
          name={agentName}
          avatarColor={agentAvatarColor}
          iconUrl={agentIconUrl}
          className="h-9 w-9 flex-shrink-0 border-2 border-muted"
        />
      )}
      <div className={cn("max-w-[85%]", isUser ? "ml-auto" : "mr-auto")}>
        <div className="rounded-2xl px-4 py-3 bg-muted">
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:p-0 [&_pre]:m-0 [&_pre]:bg-transparent">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {msg.content || " "}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && msg.metadata && Array.isArray((msg.metadata as any).files) && (
          <AgentFileOutput files={(msg.metadata as any).files} />
        )}

        <div className={cn(
          "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
          isUser ? "flex-row-reverse justify-start" : "justify-start"
        )}>
          <span>{formatTime(msg.created_at)}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy message">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            </Button>
            {!isUser && onRetry && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRetry} title="Regenerate response">
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={onDelete} title="Delete message">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
