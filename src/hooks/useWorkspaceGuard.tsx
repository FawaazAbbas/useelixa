import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Redirects unauthenticated users to /auth and 
 * authenticated users with no workspace to /join-workspace.
 * Returns { ready: true } only when the user has at least one workspace.
 */
export const useWorkspaceGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    const check = async () => {
      setChecking(true);
      const { data } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1);

      if (!data || data.length === 0) {
        navigate("/join-workspace", { replace: true });
      } else {
        setReady(true);
      }
      setChecking(false);
    };

    check();
  }, [user, authLoading, navigate]);

  return { ready, loading: authLoading || checking };
};
