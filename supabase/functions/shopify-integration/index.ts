import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShopifyCredentials {
  shop_domain: string;
  access_token: string;
}

async function getShopifyCredentials(supabase: any, userId: string): Promise<ShopifyCredentials | null> {
  // First get the account_label for shop domain
  const { data: credentialRow, error } = await supabase
    .from("user_credentials")
    .select("account_label, account_email")
    .eq("user_id", userId)
    .eq("credential_type", "shopifyApi")
    .single();

  if (error || !credentialRow) {
    console.log("[Shopify] No credentials found for user");
    return null;
  }

  // Get decrypted access token
  const credential = await getDecryptedCredentials(supabase, userId, "shopifyApi");
  if (!credential) {
    return null;
  }

  return {
    shop_domain: credentialRow.account_label || credentialRow.account_email,
    access_token: credential.access_token,
  };
}

async function callShopifyAPI(
  shopDomain: string,
  accessToken: string,
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const url = `https://${shopDomain}/admin/api/2024-01/${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Shopify] API Error: ${response.status} - ${errorText}`);
    throw new Error(`Shopify API error: ${response.status}`);
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

    const credentials = await getShopifyCredentials(supabase, user.id);
    if (!credentials) {
      return new Response(
        JSON.stringify({ error: "Shopify not connected. Please add your Shopify store in Connections." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, params } = await req.json();
    console.log(`[Shopify] Action: ${action}`, params);

    let result;
    const startTime = Date.now();

    switch (action) {
      case "get_shop": {
        result = await callShopifyAPI(credentials.shop_domain, credentials.access_token, "shop.json");
        break;
      }

      case "list_products": {
        const limit = params?.limit || 10;
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `products.json?limit=${limit}`
        );
        break;
      }

      case "get_product": {
        if (!params?.product_id) {
          throw new Error("product_id is required");
        }
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `products/${params.product_id}.json`
        );
        break;
      }

      case "list_orders": {
        const limit = params?.limit || 10;
        const status = params?.status || "any";
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `orders.json?limit=${limit}&status=${status}`
        );
        break;
      }

      case "get_order": {
        if (!params?.order_id) {
          throw new Error("order_id is required");
        }
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `orders/${params.order_id}.json`
        );
        break;
      }

      case "list_customers": {
        const limit = params?.limit || 10;
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `customers.json?limit=${limit}`
        );
        break;
      }

      case "get_customer": {
        if (!params?.customer_id) {
          throw new Error("customer_id is required");
        }
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `customers/${params.customer_id}.json`
        );
        break;
      }

      case "list_inventory": {
        const limit = params?.limit || 10;
        result = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          `inventory_items.json?limit=${limit}`
        );
        break;
      }

      case "get_analytics_summary": {
        // Get recent orders for basic analytics
        const ordersResponse = await callShopifyAPI(
          credentials.shop_domain,
          credentials.access_token,
          "orders.json?limit=50&status=any"
        );
        
        const orders = ordersResponse.orders || [];
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0);
        const paidOrders = orders.filter((o: any) => o.financial_status === "paid");
        
        result = {
          total_orders: orders.length,
          paid_orders: paidOrders.length,
          total_revenue: totalRevenue.toFixed(2),
          average_order_value: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00",
          currency: orders[0]?.currency || "USD",
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
      tool_name: `shopify_${action}`,
      credential_type: "shopify",
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
    console.error("[Shopify] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});