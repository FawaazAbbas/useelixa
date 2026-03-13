import { useState, useEffect } from "react";
import { GitBranch } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { OrgChart } from "@/components/team/OrgChart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface OrgMember {
  user_id: string;
  role: string;
  job_title: string | null;
  reports_to: string | null;
  display_name: string;
  avatar_url: string | null;
}

const Hierarchy = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data: om } = await supabase
        .from("org_members")
        .select("org_id, role, user_id, reports_to, job_title")
        .eq("user_id", user.id)
        .single();
      if (!om) { setLoading(false); return; }
      setOrgId(om.org_id);
      setIsAdmin(om.role === "owner" || om.role === "admin");

      const { data: allMembers } = await supabase
        .from("org_members")
        .select("user_id, role, reports_to, job_title")
        .eq("org_id", om.org_id);

      if (!allMembers) { setLoading(false); return; }

      // Fetch profiles for display names
      const userIds = allMembers.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      setMembers(allMembers.map(m => ({
        user_id: m.user_id,
        role: m.role,
        job_title: m.job_title,
        reports_to: m.reports_to,
        display_name: profileMap.get(m.user_id)?.display_name || "Unknown",
        avatar_url: profileMap.get(m.user_id)?.avatar_url || null,
      })));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleUpdateReportsTo = async (userId: string, reportsTo: string | null) => {
    if (!orgId) return;
    await supabase
      .from("org_members")
      .update({ reports_to: reportsTo })
      .eq("org_id", orgId)
      .eq("user_id", userId);
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, reports_to: reportsTo } : m));
  };

  const handleUpdateJobTitle = async (userId: string, jobTitle: string) => {
    if (!orgId) return;
    await supabase
      .from("org_members")
      .update({ job_title: jobTitle })
      .eq("org_id", orgId)
      .eq("user_id", userId);
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, job_title: jobTitle } : m));
  };

  return (
    <PageLayout title="Hierarchy" icon={GitBranch}>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <OrgChart
          members={members}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onUpdateReportsTo={handleUpdateReportsTo}
          onUpdateJobTitle={handleUpdateJobTitle}
        />
      )}
    </PageLayout>
  );
};

export default Hierarchy;
