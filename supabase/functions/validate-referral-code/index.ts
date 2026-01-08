import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateRequest {
  code: string;
  user_email?: string; // Email of the person trying to use the code
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, user_email } = (await req.json()) as ValidateRequest;

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: "Code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if code exists
    const { data: referralCode, error } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !referralCode) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid referral code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Self-referral prevention - check if user is trying to use their own code
    if (user_email && referralCode.user_email.toLowerCase() === user_email.toLowerCase()) {
      return new Response(
        JSON.stringify({ valid: false, error: "You cannot use your own referral code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code is expired
    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "This referral code has expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code has reached max uses
    if (referralCode.max_uses && referralCode.uses_count >= referralCode.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, error: "This referral code has reached its maximum uses" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get referrer info
    const { data: referrer } = await supabase
      .from("waitlist_signups")
      .select("name")
      .eq("email", referralCode.user_email)
      .single();

    return new Response(
      JSON.stringify({
        valid: true,
        code: referralCode.code,
        referrer_name: referrer?.name || "A friend",
        reward_type: referralCode.reward_type,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating referral code:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
