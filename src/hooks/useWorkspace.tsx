import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWorkspace = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<{ workspace_id: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaceId(null);
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    const fetchWorkspaces = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id);

      if (!error && data && data.length > 0) {
        setWorkspaces(data);
        // Use first workspace as active (can be extended to workspace picker)
        setWorkspaceId(data[0].workspace_id);
      } else {
        if (error) console.error("Error fetching workspaces:", error);
        setWorkspaceId(null);
        setWorkspaces([]);
      }
      
      setLoading(false);
    };

    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (id: string) => {
    if (workspaces.some(w => w.workspace_id === id)) {
      setWorkspaceId(id);
    }
  };

  return { workspaceId, workspaces, loading, switchWorkspace };
};
