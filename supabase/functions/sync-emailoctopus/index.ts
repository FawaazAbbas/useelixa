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
  use_case?: string;
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
      use_case,
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

    // Build tags based on referral status and source
    const tags = ["waitlist", "elixa"];

    // Add source-specific tags
    if (source === 'DEV') {
      tags.push("Dev");
    }
    if (source === 'FBAD') {
      tags.push("FBAD");
    }

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

    // EmailOctopus expects different "tags" shapes depending on endpoint:
    // - Create contact (POST): tags as string[]
    // - Update contact (PUT): tags as object map { [tagName]: true|false }
    const tagsArray = tags;
    const tagsObject: Record<string, boolean> = Object.fromEntries(tags.map((t) => [t, true]));

    // Build fields with referral data
    const fields: Record<string, string> = {
      FullName: name || "",
      Company: company || "",
      Source: source || "EW",
      use_case: use_case || position || "",
    };

    if (referral_code) {
      fields.ReferralCode = referral_code;
    }

    if (referred_by_code) {
      fields.ReferredBy = referred_by_code;
    }

    if (waitlist_position) {
      fields.WaitlistPosition = waitlist_position.toString();
    }

    if (referral_count !== undefined) {
      fields.ReferralCount = referral_count.toString();
    }

    console.log("Prepared fields for EmailOctopus:", JSON.stringify(fields));
    console.log("Prepared tags for EmailOctopus (POST array):", JSON.stringify(tagsArray));
    console.log("Prepared tags for EmailOctopus (PUT map):", JSON.stringify(tagsObject));

    const emailOctopusPayload = {
      api_key: apiKey,
      email_address: email,
      fields,
      tags: tagsArray,
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
        
        // Send all fields including custom ones (ReferralCode, WaitlistPosition, etc.)
        const updateResponse = await fetch(
          `https://emailoctopus.com/api/1.6/lists/${listId}/contacts/${contactId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: apiKey,
              email_address: email,
              fields,
              tags: tagsObject,
              status: "SUBSCRIBED",
            }),
          }
        );
        
        const updateData = await updateResponse.json();
        
        if (!updateResponse.ok) {
          console.error("Failed to update existing contact:", updateData);
          console.error("Request payload was:", JSON.stringify({ email_address: email, fields, tags: tagsObject }));
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

      // Handle invalid parameters.
      // NOTE: EmailOctopus uses INVALID_PARAMETERS for multiple cases, including unknown custom fields.
      // We should not silently "skip" here because that hides real schema mismatches.
      if (data.error?.code === "INVALID_PARAMETERS") {
        console.error("EmailOctopus rejected parameters:", data);
        console.error(
          "Rejected payload keys:",
          JSON.stringify({
            email_address: email,
            fieldKeys: Object.keys(fields),
            tagKeys: Object.keys(tagsObject),
          })
        );

        // Return 200 so the frontend doesn't treat this as a thrown Edge Function error,
        // but make it explicit that EmailOctopus rejected the payload.
        return new Response(
          JSON.stringify({
            success: false,
            rejected: true,
            error: "EmailOctopus rejected parameters (INVALID_PARAMETERS)",
            details: data,
            sent: {
              email_address: email,
              fields,
              tags: tagsObject,
            },
            hint:
              "This usually means one or more custom field keys do not match exactly in EmailOctopus. Verify the field *API keys* (not display labels) for: ReferralCode, ReferredBy, WaitlistPosition, ReferralCount, Source, Company, FullName.",
          }),
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
