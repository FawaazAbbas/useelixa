import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncResult {
  email: string;
  status: "created" | "updated" | "failed";
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("EMAILOCTOPUS_API_KEY");
    const listId = Deno.env.get("EMAILOCTOPUS_LIST_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!apiKey || !listId) {
      return new Response(
        JSON.stringify({ error: "EmailOctopus not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all waitlist signups
    const { data: signups, error: fetchError } = await supabase
      .from("waitlist_signups")
      .select("id, name, email, company")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Failed to fetch signups:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch signups" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting bulk sync for ${signups?.length || 0} contacts`);

    const results: SyncResult[] = [];

    for (const signup of signups || []) {
      try {
        // Try to create the contact first
        const createPayload = {
          api_key: apiKey,
          email_address: signup.email,
          fields: {
            FullName: signup.name || "",
            Company: signup.company || "",
            Source: "EW",
          },
          tags: ["waitlist", "elixa"],
          status: "SUBSCRIBED",
        };

        const createResponse = await fetch(
          `https://emailoctopus.com/api/1.6/lists/${listId}/contacts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createPayload),
          }
        );

        const createData = await createResponse.json();

        if (createResponse.ok) {
          results.push({ email: signup.email, status: "created" });
          console.log(`Created contact: ${signup.email}`);
        } else if (createData.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
          // Contact exists, update it
          const encoder = new TextEncoder();
          const hashData = encoder.encode(signup.email.toLowerCase());
          const hashBuffer = await crypto.subtle.digest("MD5", hashData);
          const contactId = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

          const updateResponse = await fetch(
            `https://emailoctopus.com/api/1.6/lists/${listId}/contacts/${contactId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                api_key: apiKey,
                fields: {
                  FullName: signup.name || "",
                  Company: signup.company || "",
                  Source: "EW",
                },
                tags: { "waitlist": true, "elixa": true },
                status: "SUBSCRIBED",
              }),
            }
          );

          if (updateResponse.ok) {
            results.push({ email: signup.email, status: "updated" });
            console.log(`Updated contact: ${signup.email}`);
          } else {
            const updateError = await updateResponse.json();
            results.push({ email: signup.email, status: "failed", error: updateError.error?.message });
            console.error(`Failed to update ${signup.email}:`, updateError);
          }
        } else {
          results.push({ email: signup.email, status: "failed", error: createData.error?.message });
          console.error(`Failed to create ${signup.email}:`, createData);
        }

        // Rate limiting - EmailOctopus allows 100 requests per 10 seconds
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.push({ email: signup.email, status: "failed", error: error.message });
        console.error(`Error processing ${signup.email}:`, error);
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.status === "created").length,
      updated: results.filter(r => r.status === "updated").length,
      failed: results.filter(r => r.status === "failed").length,
      results,
    };

    console.log(`Bulk sync complete:`, summary);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in bulk-sync-emailoctopus function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
