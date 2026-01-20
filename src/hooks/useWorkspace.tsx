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

    const fetchWorkspace = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setWorkspaceId(data.workspace_id);
      } else {
        console.error("Error fetching workspace:", error);
        setWorkspaceId(null);
      }
      
      setLoading(false);
    };

    fetchWorkspace();
  }, [user]);

  return { workspaceId, loading };
};
