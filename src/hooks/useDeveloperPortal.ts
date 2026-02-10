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
    
    if (data) setAgents(data as AgentSubmission[]);
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

  const createAgent = async (agent: Partial<AgentSubmission>) => {
    if (!profile) return null;
    const slug = agent.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("agent_submissions")
      .insert({ ...agent, developer_id: profile.id, slug } as any)
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return null;
    }
    toast({ title: "Agent created" });
    await fetchAgents();
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
  };
};
