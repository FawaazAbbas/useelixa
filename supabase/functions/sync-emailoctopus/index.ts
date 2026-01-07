import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  email: string;
  name: string;
  company?: string;
  position?: string;
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

    const { email, name, company, position }: SyncRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing contact to EmailOctopus: ${email}`);

    const emailOctopusPayload = {
      api_key: apiKey,
      email_address: email,
      fields: {
        FullName: name || "",
        Company: company || "",
        Source: "EW",
      },
      tags: ["waitlist", "elixa"],
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
      // Handle duplicate contact gracefully
      if (data.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
        console.log(`Contact already exists in EmailOctopus: ${email}`);
        return new Response(
          JSON.stringify({ success: true, message: "Contact already exists" }),
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
