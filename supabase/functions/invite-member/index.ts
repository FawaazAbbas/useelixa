import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, role, resend } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[InviteMember] User ${user.id} ${resend ? 'resending' : 'inviting'} ${email} as ${role}`);

    // Get the user's organization and check if they're admin
    const { data: orgMember, error: orgError } = await supabase
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .single();

    if (orgError || !orgMember) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (orgMember.role !== "owner" && orgMember.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can invite members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user with this email already exists
    const { data: existingUsers } = await serviceSupabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from("org_members")
        .select("user_id")
        .eq("org_id", orgMember.org_id)
        .eq("user_id", existingUser.id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: "User is already a member of this organization" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add existing user to org
      const { error: addError } = await serviceSupabase
        .from("org_members")
        .insert({
          org_id: orgMember.org_id,
          user_id: existingUser.id,
          role: role || "member",
        });

      if (addError) {
        console.error("[InviteMember] Error adding member:", addError);
        throw addError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${email} has been added to your organization`,
          type: "added"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For new users, send an invite email
    const { data: inviteData, error: inviteError } = await serviceSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        org_id: orgMember.org_id,
        role: role || "member",
      },
    });

    if (inviteError) {
      console.error("[InviteMember] Invite error:", inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Track pending invitation in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    if (resend) {
      // Update existing invitation
      await serviceSupabase
        .from("pending_invitations")
        .update({ expires_at: expiresAt, created_at: new Date().toISOString() })
        .eq("org_id", orgMember.org_id)
        .eq("email", email);
    } else {
      // Create new pending invitation record
      await serviceSupabase
        .from("pending_invitations")
        .upsert({
          org_id: orgMember.org_id,
          email: email,
          role: role || "member",
          invited_by: user.id,
          status: "pending",
          expires_at: expiresAt,
        }, { onConflict: 'org_id,email' });
    }

    // Pre-create the org membership (will be fully activated when user signs up)
    if (inviteData?.user?.id) {
      await serviceSupabase
        .from("org_members")
        .insert({
          org_id: orgMember.org_id,
          user_id: inviteData.user.id,
          role: role || "member",
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resend ? `Invitation resent to ${email}` : `Invitation sent to ${email}`,
        type: "invited"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[InviteMember] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});