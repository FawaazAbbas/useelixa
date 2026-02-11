import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface DeveloperProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  website: string | null;
  developer_bio: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentAction {
  id: string;
  agent_id: string;
  action_name: string;
  path: string;
  method: string;
  description: string | null;
  request_schema: any;
  response_schema: any;
  sort_order: number;
  created_at: string;
}

export interface AgentSubmission {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  version: string | null;
  system_prompt: string | null;
  allowed_tools: string[] | null;
  icon_url: string | null;
  config_file_url: string | null;
  status: string;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  download_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  hosting_type: string;
  runtime: string;
  external_endpoint_url: string | null;
  external_auth_header: string | null;
  external_auth_token: string | null;
  code_file_url: string | null;
  requirements: string | null;
  entry_function: string | null;
  execution_status: string;
  execution_error: string | null;
  actions?: AgentAction[];
}

export const useDeveloperPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [agents, setAgents] = useState<AgentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (user) {
      checkDeveloperRole();
    }
  }, [user]);

  const checkDeveloperRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "developer")
      .maybeSingle();

    setIsDeveloper(!!data);
    if (data) {
      await Promise.all([fetchProfile(), fetchAgents()]);
    }
    setLoading(false);
  };

  const assignDeveloperRole = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "developer" });
    
    if (error && !error.message.includes("duplicate")) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return false;
    }
    setIsDeveloper(true);
    await fetchProfile();
    return true;
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("developer_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) setProfile(data as DeveloperProfile);
  };

  const fetchAgents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("agent_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      const selfHostedIds = data.filter((a: any) => a.hosting_type === "self_hosted").map((a: any) => a.id);
      let actionsMap: Record<string, any[]> = {};
      if (selfHostedIds.length > 0) {
        const { data: actionsData } = await supabase
          .from("agent_actions" as any)
          .select("*")
          .in("agent_id", selfHostedIds)
          .order("sort_order", { ascending: true });
        if (actionsData) {
          for (const action of actionsData as any[]) {
            if (!actionsMap[action.agent_id]) actionsMap[action.agent_id] = [];
            actionsMap[action.agent_id].push(action);
          }
        }
      }
      setAgents(data.map((a: any) => ({ ...a, actions: actionsMap[a.id] || [] })) as AgentSubmission[]);
    }
  };

  const updateProfile = async (updates: Partial<DeveloperProfile>) => {
    if (!profile) return;
    const { error } = await supabase
      .from("developer_profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Profile updated" });
      await fetchProfile();
    }
  };

  const validateAgent = async (agentId: string): Promise<{ success: boolean; error?: string; error_type?: string }> => {
    try {
      // Set status to building
      await supabase
        .from("agent_submissions")
        .update({ execution_status: "building", execution_error: null } as any)
        .eq("id", agentId);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return { success: false, error: "Not authenticated" };

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ agent_id: agentId, message: "__validation_test__" }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        const errorMsg = result.error || "Validation failed";
        await supabase
          .from("agent_submissions")
          .update({ execution_status: "error", execution_error: errorMsg } as any)
          .eq("id", agentId);
        await fetchAgents();
        return { success: false, error: errorMsg, error_type: result.error_type };
      }

      await supabase
        .from("agent_submissions")
        .update({ execution_status: "ready", execution_error: null } as any)
        .eq("id", agentId);
      await fetchAgents();
      return { success: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Validation failed";
      await supabase
        .from("agent_submissions")
        .update({ execution_status: "error", execution_error: msg } as any)
        .eq("id", agentId);
      await fetchAgents();
      return { success: false, error: msg };
    }
  };

  const createAgent = async (agent: Partial<AgentSubmission>, actions?: { action_name: string; path: string; method: string; description: string }[]) => {
    if (!profile) return null;
    const slug = agent.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("agent_submissions")
      .insert({ ...agent, developer_id: profile.id, slug, execution_status: "building" } as any)
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return null;
    }

    // Insert actions if provided
    if (actions && actions.length > 0 && data) {
      const actionRows = actions.map((a, i) => ({
        agent_id: data.id,
        action_name: a.action_name,
        path: a.path,
        method: a.method,
        description: a.description || null,
        sort_order: i,
      }));
      const { error: actionsError } = await supabase
        .from("agent_actions" as any)
        .insert(actionRows as any);
      if (actionsError) {
        toast({ variant: "destructive", title: "Error saving actions", description: actionsError.message });
      }
    }

    toast({ title: "Agent created — validating..." });
    await fetchAgents();

    // Auto-validate platform-hosted agents with code
    if (data && agent.hosting_type !== "self_hosted" && (agent.code_file_url || data.code_file_url)) {
      // Don't await — let it run in background so UI updates immediately
      validateAgent(data.id);
    }

    return data;
  };

  const updateAgent = async (id: string, updates: Partial<AgentSubmission>) => {
    const { error } = await supabase
      .from("agent_submissions")
      .update(updates as any)
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Agent updated" });
      await fetchAgents();
    }
  };

  const submitForReview = async (id: string) => {
    await updateAgent(id, { status: "pending_review", submitted_at: new Date().toISOString() } as any);
  };

  const deleteAgent = async (id: string) => {
    const { error } = await supabase
      .from("agent_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Agent deleted" });
      await fetchAgents();
    }
  };

  return {
    user,
    profile,
    agents,
    loading,
    isDeveloper,
    assignDeveloperRole,
    updateProfile,
    createAgent,
    updateAgent,
    submitForReview,
    deleteAgent,
    fetchAgents,
    validateAgent,
  };
};
