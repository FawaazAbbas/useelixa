import { supabase } from "@/integrations/supabase/client";

export type AuditActionType = 
  | "setting_change"
  | "setting_created"
  | "role_change"
  | "member_removed"
  | "member_invited"
  | "integration_connect"
  | "integration_disconnect"
  | "ai_paused"
  | "ai_resumed"
  | "tool_approval_change";

export type AuditEntityType = 
  | "org_settings"
  | "org_members"
  | "user_credentials"
  | "orgs";

export interface AuditLogEntry {
  id: string;
  org_id: string;
  user_id: string;
  action_type: AuditActionType;
  entity_type: AuditEntityType;
  entity_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface LogAdminActionParams {
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

/**
 * Log an admin action to the audit log
 */
export async function logAdminAction({
  actionType,
  entityType,
  entityId,
  oldValue,
  newValue,
}: LogAdminActionParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user's org
    const { data: orgMember, error: orgError } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (orgError || !orgMember) {
      return { success: false, error: "Could not determine organization" };
    }

    // Insert audit log entry using type assertion for the new table
    const { error: insertError } = await supabase
      .from("admin_audit_log" as any)
      .insert({
        org_id: orgMember.org_id,
        user_id: user.id,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue,
        new_value: newValue,
        user_agent: navigator.userAgent,
      });

    if (insertError) {
      console.error("[AuditLog] Failed to insert:", insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[AuditLog] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Fetch audit logs for the current organization
 */
export async function fetchAuditLogs(options?: {
  limit?: number;
  actionType?: AuditActionType;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ data: AuditLogEntry[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: "User not authenticated" };
    }

    // Get user's org
    const { data: orgMember } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!orgMember) {
      return { data: [], error: "Could not determine organization" };
    }

    let query = supabase
      .from("admin_audit_log" as any)
      .select("*")
      .eq("org_id", orgMember.org_id)
      .order("created_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(100);
    }

    if (options?.actionType) {
      query = query.eq("action_type", options.actionType);
    }

    if (options?.startDate) {
      query = query.gte("created_at", options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte("created_at", options.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[AuditLog] Fetch error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data || []) as unknown as AuditLogEntry[] };
  } catch (error) {
    console.error("[AuditLog] Error:", error);
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}
