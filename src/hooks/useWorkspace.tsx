import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWorkspace = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching workspace:", error);
      } else {
        setWorkspaceId(data?.workspace_id || null);
      }
      setLoading(false);
    };

    fetchWorkspace();
  }, [user]);

  return { workspaceId, loading };
};
