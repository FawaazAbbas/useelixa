import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Loader2, Bot, Users, PanelRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { ChatspaceSidebar, type InstalledAgent } from "@/components/ai-employees/ChatspaceSidebar";
import { AgentSettingsPanel } from "@/components/ai-employees/AgentSettingsPanel";
import { AgentMarketplace } from "@/components/ai-employees/AgentMarketplace";
import { ProposalCard } from "@/components/ai-employees/ProposalCard";
import { AgentAvatar } from "@/components/ai-employees/AgentAvatar";
import { cn } from "@/lib/utils";

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

interface FullInstallation {
  installationId: string;
  agentId: string;
  workspaceId: string;
  permissions: Record<string, unknown>;
  requiresApproval: boolean;
  riskTier: string;
  deployedAt: string | null;
  // From joined submission
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
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [allAgents, setAllAgents] = useState<AIEmployee[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = installations.find((i) => i.installationId === selectedId) || null;

  // Fetch installations + all public agents
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

      // Map installations
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

      // Map all agents for marketplace
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
      }));
      setAllAgents(agents);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load agents");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load messages when selection changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId);
  }, [selectedId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedId || !selected || !user) return;

    const text = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: AgentMessage = {
      id: tempId,
      role: "user",
      content: text,
      metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Persist user message
      await supabase.from("agent_messages").insert({
        workspace_id: selected.workspaceId,
        installation_id: selectedId,
        role: "user",
        content: text,
      });

      // Call orchestrator with deterministic routing
      const { data, error } = await supabase.functions.invoke("ai-employee-orchestrator", {
        body: {
          actorType: "installed_agent",
          actorId: selectedId,
          message: text,
          userId: user.id,
        },
      });

      if (error) throw error;

      const assistantContent = data?.response || "I couldn't process that request.";

      // Persist assistant message
      await supabase.from("agent_messages").insert({
        workspace_id: selected.workspaceId,
        installation_id: selectedId,
        role: "assistant",
        content: assistantContent,
        metadata: { tools_used: data?.tools_used || [], actions: data?.actions || [] },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          metadata: { tools_used: data?.tools_used || [], actions: data?.actions || [] },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          metadata: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const installedAgentIds = new Set(installations.map((i) => i.agentId));

  const installAgent = async (agentId: string) => {
    if (!workspaceId || !user) {
      toast.error("No workspace found.");
      return;
    }
    try {
      setInstallingId(agentId);
      const { error } = await supabase.from("agent_installations").insert({
        agent_id: agentId,
        workspace_id: workspaceId,
        user_id: user.id,
        deployed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Agent installed & deployed");
      await fetchData();
    } catch (err) {
      console.error("Error installing agent:", err);
      toast.error("Failed to install agent");
    } finally {
      setInstallingId(null);
    }
  };

  const uninstallAgent = async (agentId: string) => {
    if (!user) return;
    try {
      setInstallingId(agentId);
      const { error } = await supabase
        .from("agent_installations")
        .delete()
        .eq("agent_id", agentId)
        .eq("user_id", user.id);
      if (error) throw error;

      if (selected?.agentId === agentId) {
        setSelectedId(null);
        setShowSettings(false);
      }
      toast.success("Agent uninstalled");
      await fetchData();
    } catch (err) {
      console.error("Error uninstalling agent:", err);
      toast.error("Failed to uninstall agent");
    } finally {
      setInstallingId(null);
    }
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

  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <MainNavSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Sign in to use AI Employees</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      <div className="flex-1 flex overflow-hidden">
      {/* Left pane */}
      <ChatspaceSidebar
        agents={sidebarAgents}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setShowSettings(false);
        }}
        onBrowse={() => setShowBrowse(true)}
      />

      {/* Center pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Chat header */}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSettings(!showSettings)}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto">
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

                {messages.map((msg) => (
                  <div key={msg.id}>
                    <div
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <AgentAvatar
                          name={selected.name}
                          avatarColor={(selected.capabilityManifest as any)?.avatarColor}
                          iconUrl={selected.iconUrl}
                          className="h-7 w-7 flex-shrink-0 mt-1"
                        />
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-xl px-4 py-2.5 text-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:my-2 [&>h2]:my-1.5 [&>h3]:my-1 [&>li]:my-0.5">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>

                    {/* Render proposals from metadata */}
                    {msg.metadata &&
                      Array.isArray((msg.metadata as any).actions) &&
                      (msg.metadata as any).actions
                        .filter((a: any) => a.type === "proposal")
                        .map((proposal: any, idx: number) => (
                          <div key={idx} className="ml-10 mt-2">
                            <ProposalCard
                              proposalId={proposal.proposalId || `proposal-${idx}`}
                              title={proposal.title || "Action Required"}
                              summary={proposal.summary}
                              status={proposal.status || "pending"}
                            />
                          </div>
                        ))}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <AgentAvatar
                      name={selected.name}
                      avatarColor={(selected.capabilityManifest as any)?.avatarColor}
                      iconUrl={selected.iconUrl}
                      className="h-7 w-7 flex-shrink-0 mt-1"
                    />
                    <div className="bg-muted rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.name}…`}
                  className="min-h-[44px] max-h-[120px] resize-none"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="self-end h-[44px] w-[44px] flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="font-medium text-foreground">Select an agent</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose an agent from the sidebar to start chatting
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowBrowse(true)}>
                Browse Agents
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right pane */}
      {showSettings && selected && (
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
      </div>
    </div>
  );
}
