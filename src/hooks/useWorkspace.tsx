import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWorkspace = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaceId(null);
      setLoading(false);
      return;
    }

    const ensureWorkspace = async () => {
      setLoading(true);

      // 1) Try to find an existing workspace membership
      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!memberError && member?.workspace_id) {
        setWorkspaceId(member.workspace_id);
        setLoading(false);
        return;
      }

      // 2) If none exists, create a default workspace + membership
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: "My Workspace",
          owner_id: user.id,
        })
        .select("id")
        .single();

      if (workspaceError || !workspace?.id) {
        console.error("Error creating workspace:", workspaceError);
        setWorkspaceId(null);
        setLoading(false);
        return;
      }

      const { error: memberCreateError } = await supabase
        .from("workspace_members")
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          role: "owner",
        });

      if (memberCreateError) {
        console.error("Error creating workspace membership:", memberCreateError);
        setWorkspaceId(null);
        setLoading(false);
        return;
      }

      setWorkspaceId(workspace.id);
      setLoading(false);
    };

    ensureWorkspace();
  }, [user]);

  return { workspaceId, loading };
};
