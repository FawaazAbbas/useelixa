import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { logAdminAction } from "@/utils/auditLog";

export interface TeamMember {
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

export const useTeam = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!user) return;

    try {
      // Get the user's organization
      const { data: orgMember, error: orgError } = await supabase
        .from("org_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .single();

      if (orgError || !orgMember) {
        console.error("No organization found for user");
        setLoading(false);
        return;
      }

      setCurrentUserRole(orgMember.role);

      // Get organization details
      const { data: org, error: orgDetailError } = await supabase
        .from("orgs")
        .select("*")
        .eq("id", orgMember.org_id)
        .single();

      if (orgDetailError) throw orgDetailError;
      setOrganization(org);

      // Get all members of this organization with their profiles
      const { data: orgMembers, error: membersError } = await supabase
        .from("org_members")
        .select(`
          user_id,
          role,
          created_at
        `)
        .eq("org_id", orgMember.org_id);

      if (membersError) throw membersError;

      // Fetch profiles for each member
      const memberIds = orgMembers.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", memberIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedMembers: TeamMember[] = orgMembers.map(m => ({
        ...m,
        display_name: profileMap.get(m.user_id)?.display_name || "Unknown",
        avatar_url: profileMap.get(m.user_id)?.avatar_url || undefined,
      }));

      setMembers(enrichedMembers);
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const updateMemberRole = async (userId: string, newRole: "admin" | "member") => {
    if (!organization || currentUserRole !== "owner" && currentUserRole !== "admin") {
      toast.error("You don't have permission to change roles");
      return false;
    }

    // Find the member to get their current role
    const member = members.find(m => m.user_id === userId);
    const oldRole = member?.role;

    try {
      const { error } = await supabase
        .from("org_members")
        .update({ role: newRole })
        .eq("org_id", organization.id)
        .eq("user_id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction({
        actionType: "role_change",
        entityType: "org_members",
        entityId: userId,
        oldValue: { role: oldRole, email: member?.email },
        newValue: { role: newRole },
      });

      setMembers(prev => 
        prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m)
      );
      toast.success("Role updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
      return false;
    }
  };

  const removeMember = async (userId: string) => {
    if (!organization || currentUserRole !== "owner" && currentUserRole !== "admin") {
      toast.error("You don't have permission to remove members");
      return false;
    }

    // Can't remove yourself if you're the owner
    if (userId === user?.id) {
      toast.error("You cannot remove yourself");
      return false;
    }

    // Find the member to log their details
    const member = members.find(m => m.user_id === userId);

    try {
      const { error } = await supabase
        .from("org_members")
        .delete()
        .eq("org_id", organization.id)
        .eq("user_id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction({
        actionType: "member_removed",
        entityType: "org_members",
        entityId: userId,
        oldValue: { 
          email: member?.email, 
          role: member?.role,
          display_name: member?.display_name,
        },
      });

      setMembers(prev => prev.filter(m => m.user_id !== userId));
      toast.success("Member removed successfully");
      return true;
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
      return false;
    }
  };

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  return {
    organization,
    members,
    loading,
    currentUserRole,
    isAdmin,
    updateMemberRole,
    removeMember,
    refetch: fetchTeamData,
  };
};
