import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePositionRequest {
  email: string;
  waitlist_position: number;
  referral_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("EMAILOCTOPUS_API_KEY");
    const listId = Deno.env.get("EMAILOCTOPUS_LIST_ID");

    if (!apiKey || !listId) {
      console.error("Missing EmailOctopus configuration");
      return new Response(
        JSON.stringify({ error: "EmailOctopus not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, waitlist_position, referral_count }: UpdatePositionRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Updating waitlist position for: ${email}, position: ${waitlist_position}, referrals: ${referral_count}`);

    // Build tags based on referral milestones
    const tags: string[] = [];
    
    if (referral_count >= 2) {
      tags.push("milestone_2");
    }
    if (referral_count >= 3) {
      tags.push("milestone_3");
    }
    if (referral_count >= 4) {
      tags.push("milestone_4_plus");
    }
    if (referral_count >= 10) {
      tags.push("milestone_10_lifetime");
    }

    // Build fields with updated position
    const fields: Record<string, string> = {
      WaitlistPosition: waitlist_position.toString(),
      ReferralCount: referral_count.toString(),
    };

    // EmailOctopus requires MD5 hash of lowercase email for the contact ID
    const encoder = new TextEncoder();
    const hashData = encoder.encode(email.toLowerCase());
    const hashBuffer = await crypto.subtle.digest("MD5", hashData);
    const contactId = new TextDecoder().decode(encodeHex(new Uint8Array(hashBuffer)));

    console.log(`Updating EmailOctopus contact: ${contactId}`);

    // Use PUT to update existing contact
    const updateResponse = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${listId}/contacts/${contactId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          fields,
          tags,
        }),
      }
    );

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      console.error("Failed to update EmailOctopus contact:", updateData);
      return new Response(
        JSON.stringify({ error: "Failed to update contact", details: updateData }),
        { status: updateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully updated waitlist position for: ${email}`, updateData);

    return new Response(
      JSON.stringify({ success: true, contact: updateData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in update-waitlist-position function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
