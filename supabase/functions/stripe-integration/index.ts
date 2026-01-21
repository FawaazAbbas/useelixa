import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getStripeCredentials(supabase: any, userId: string) {
  const { data: credentials, error } = await supabase
    .from("user_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("credential_type", "stripe")
    .single();

  if (error || !credentials) {
    console.log("[Stripe] No credentials found for user");
    return null;
  }

  return credentials;
}

async function callStripeAPI(
  endpoint: string,
  apiKey: string,
  method: string = "GET",
  params?: Record<string, string>
) {
  const url = new URL(`https://api.stripe.com/v1/${endpoint}`);
  
  if (method === "GET" && params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method !== "GET" && params ? new URLSearchParams(params).toString() : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Stripe API error: ${response.status}`);
  }

  return response.json();
}

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = await getStripeCredentials(supabase, user.id);
    if (!credentials) {
      return new Response(
        JSON.stringify({ error: "Stripe not connected. Please add your Stripe API key in Connections." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = credentials.access_token;
    const { action, params } = await req.json();

    console.log(`[Stripe] Action: ${action}`, params);

    let result;
    const startTime = Date.now();

    switch (action) {
      case "get_balance": {
        result = await callStripeAPI("balance", apiKey);
        break;
      }

      case "list_charges": {
        const queryParams: Record<string, string> = {
          limit: String(params?.limit || 10),
        };
        if (params?.customer) queryParams.customer = params.customer;
        result = await callStripeAPI("charges", apiKey, "GET", queryParams);
        break;
      }

      case "list_customers": {
        const queryParams: Record<string, string> = {
          limit: String(params?.limit || 10),
        };
        if (params?.email) queryParams.email = params.email;
        result = await callStripeAPI("customers", apiKey, "GET", queryParams);
        break;
      }

      case "get_customer": {
        if (!params?.customer_id) {
          throw new Error("customer_id is required");
        }
        result = await callStripeAPI(`customers/${params.customer_id}`, apiKey);
        break;
      }

      case "list_payments": {
        const queryParams: Record<string, string> = {
          limit: String(params?.limit || 10),
        };
        result = await callStripeAPI("payment_intents", apiKey, "GET", queryParams);
        break;
      }

      case "list_subscriptions": {
        const queryParams: Record<string, string> = {
          limit: String(params?.limit || 10),
        };
        if (params?.customer) queryParams.customer = params.customer;
        if (params?.status) queryParams.status = params.status;
        result = await callStripeAPI("subscriptions", apiKey, "GET", queryParams);
        break;
      }

      case "list_invoices": {
        const queryParams: Record<string, string> = {
          limit: String(params?.limit || 10),
        };
        if (params?.customer) queryParams.customer = params.customer;
        result = await callStripeAPI("invoices", apiKey, "GET", queryParams);
        break;
      }

      case "get_revenue_summary": {
        // Get recent charges to calculate revenue
        const charges = await callStripeAPI("charges", apiKey, "GET", { limit: "100" });
        const successfulCharges = charges.data.filter((c: any) => c.status === "succeeded");
        const totalRevenue = successfulCharges.reduce((sum: number, c: any) => sum + c.amount, 0);
        
        result = {
          total_revenue_cents: totalRevenue,
          total_revenue_formatted: `$${(totalRevenue / 100).toFixed(2)}`,
          charge_count: successfulCharges.length,
          currency: successfulCharges[0]?.currency || "usd",
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Log the tool execution
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `stripe_${action}`,
      credential_type: "stripe",
      success: true,
      execution_time_ms: Date.now() - startTime,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Stripe] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});