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

      // 2) Create via backend function (bypasses RLS safely)
      const { data, error } = await supabase.functions.invoke("ensure-workspace");

      if (error) {
        console.error("Error ensuring workspace:", error);
        setWorkspaceId(null);
        setLoading(false);
        return;
      }

      const ensuredId = (data as any)?.workspaceId as string | undefined;
      setWorkspaceId(ensuredId ?? null);
      setLoading(false);
    };

    ensureWorkspace();
  }, [user]);

  return { workspaceId, loading };
};
