import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  email: string;
  name: string;
  company?: string;
  position?: string;
  source?: string;
  // Referral-specific fields
  referral_code?: string;
  referred_by_code?: string;
  reward_unlocked?: boolean;
  // Waitlist position fields
  waitlist_position?: number;
  referral_count?: number;
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

    const { 
      email, 
      name, 
      company, 
      position, 
      source,
      referral_code,
      referred_by_code,
      reward_unlocked,
      waitlist_position,
      referral_count
    }: SyncRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing contact to EmailOctopus: ${email}`);

    // Build tags based on referral status
    const tags = ["waitlist", "elixa"];
    
    if (referral_code) {
      tags.push("has_referral_code");
    }
    
    if (referred_by_code) {
      tags.push("was_referred");
    }
    
    if (reward_unlocked) {
      tags.push("reward_unlocked");
    }

    // Add milestone tags based on referral count
    if (referral_count && referral_count >= 2) {
      tags.push("milestone_2");
    }
    if (referral_count && referral_count >= 3) {
      tags.push("milestone_3");
    }
    if (referral_count && referral_count >= 4) {
      tags.push("milestone_4_plus");
    }
    if (referral_count && referral_count >= 10) {
      tags.push("milestone_10_lifetime");
    }

    // Build fields with referral data
    const fields: Record<string, string> = {
      FullName: name || "",
      Company: company || "",
      Source: source || "EW",
    };

    if (referral_code) {
      fields.ReferralCode = referral_code;
    }

    if (referred_by_code) {
      fields.ReferredBy = referred_by_code;
    }

    // Add waitlist position
    if (waitlist_position) {
      fields.WaitlistPosition = waitlist_position.toString();
    }

    if (referral_count !== undefined) {
      fields.ReferralCount = referral_count.toString();
    }

    const emailOctopusPayload = {
      api_key: apiKey,
      email_address: email,
      fields,
      tags,
      status: "SUBSCRIBED",
    };

    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${listId}/contacts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailOctopusPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle duplicate contact - UPDATE instead of skip
      if (data.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
        console.log(`Contact exists, updating: ${email}`);
        
        // EmailOctopus requires MD5 hash of lowercase email for the contact ID
        const encoder = new TextEncoder();
        const hashData = encoder.encode(email.toLowerCase());
        const hashBuffer = await crypto.subtle.digest("MD5", hashData);
        const contactId = new TextDecoder().decode(encodeHex(new Uint8Array(hashBuffer)));
        
        // Use PUT to update existing contact - only update fields, not status
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
          console.error("Failed to update existing contact:", updateData);
          return new Response(
            JSON.stringify({ error: "Failed to update existing contact", details: updateData }),
            { status: updateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`Successfully updated contact: ${email}`, updateData);
        return new Response(
          JSON.stringify({ success: true, updated: true, contact: updateData }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle invalid parameters (e.g., disposable email domains blocked by EmailOctopus)
      if (data.error?.code === "INVALID_PARAMETERS") {
        console.log(`Skipping invalid contact (likely disposable email): ${email}`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "Invalid or blocked email domain" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("EmailOctopus API error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.message || "Failed to sync contact" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully synced contact to EmailOctopus: ${email}`, data);

    return new Response(
      JSON.stringify({ success: true, contact: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in sync-emailoctopus function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
