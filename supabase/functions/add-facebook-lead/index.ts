import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

// Generate 8-character alphanumeric referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface FacebookLead {
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("FACEBOOK_LEAD_API_KEY");

    if (!expectedKey) {
      console.error("FACEBOOK_LEAD_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      console.warn("Invalid or missing API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Received Facebook lead:", JSON.stringify(body));

    // Support both single lead and array of leads
    const leads: FacebookLead[] = Array.isArray(body) ? body : [body];

    if (leads.length === 0) {
      return new Response(
        JSON.stringify({ error: "No leads provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: { email: string; status: string; error?: string }[] = [];
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const lead of leads) {
      const email = lead.email?.toLowerCase().trim();

      // Validate email
      if (!email || !email.includes("@")) {
        results.push({ email: email || "unknown", status: "error", error: "Invalid email" });
        errors++;
        continue;
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from("waitlist_signups")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        console.log(`Email ${email} already exists, skipping`);
        results.push({ email, status: "skipped", error: "Already exists" });
        skipped++;
        continue;
      }

      // Build name from available fields
      let name = lead.name;
      if (!name && (lead.first_name || lead.last_name)) {
        name = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
      }
      if (!name) {
        // Fallback: use email prefix
        name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      }

      // Get next waitlist position
      const { data: maxPositionData } = await supabase
        .from("waitlist_signups")
        .select("waitlist_position")
        .order("waitlist_position", { ascending: false })
        .limit(1)
        .maybeSingle();

      const waitlistPosition = (maxPositionData?.waitlist_position || 6999) + 1;
      const referralCode = generateReferralCode();

      // Insert into waitlist_signups
      const { error: insertError } = await supabase.from("waitlist_signups").insert({
        email,
        name,
        company: lead.company || null,
        source: "FBAD",
        referral_code: referralCode,
        waitlist_position: waitlistPosition,
        referral_count: 0,
        invites_sent: 0,
        reward_unlocked: false,
      });

      if (insertError) {
        console.error(`Failed to insert ${email}:`, insertError);
        results.push({ email, status: "error", error: insertError.message });
        errors++;
        continue;
      }

      // Insert into referral_codes table
      await supabase.from("referral_codes").insert({
        code: referralCode,
        user_email: email,
        max_uses: 3,
        reward_type: "3_free_agents",
      });

      console.log(`Successfully added Facebook lead: ${email}`);
      results.push({ email, status: "imported" });
      imported++;

      // Sync to EmailOctopus (one-way sync - Elixa is source of truth)
      try {
        await supabase.functions.invoke("sync-emailoctopus", {
          body: {
            email,
            name,
            company: lead.company || undefined,
            source: "FBAD",
            referral_code: referralCode,
            waitlist_position: waitlistPosition,
            referral_count: 0,
          },
        });
        console.log(`Synced ${email} to EmailOctopus`);
      } catch (syncError) {
        console.warn(`Failed to sync ${email} to EmailOctopus:`, syncError);
        // Don't fail the whole operation if sync fails
      }
    }

    console.log(`Processed ${leads.length} leads: ${imported} imported, ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: leads.length,
        imported,
        skipped,
        errors,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing Facebook lead:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
