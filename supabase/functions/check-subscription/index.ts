import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Product IDs for subscription plans (LIVE MODE)
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_Tqek332KZ0AVBr": "starter",
  "prod_TqelSWxx4HFiS8": "pro",
  "prod_TqelktwA0bb6o1": "unlimited",
};

// Plan limits
const PLAN_LIMITS: Record<string, { credits: number; unlimited: boolean; premium: boolean }> = {
  starter: { credits: 1000, unlimited: false, premium: false },
  pro: { credits: 5000, unlimited: false, premium: true },
  unlimited: { credits: 0, unlimited: true, premium: true },
  trial: { credits: 100, unlimited: false, premium: false },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning trial status");
      return new Response(JSON.stringify({
        subscribed: false,
        plan: "trial",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription found");
      return new Response(JSON.stringify({
        subscribed: false,
        plan: "trial",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const planId = PRODUCT_TO_PLAN[productId] || "starter";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      productId,
      planId,
      subscriptionEnd 
    });

    // Get plan limits
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.trial;

    // Get user's org membership
    const { data: orgMember } = await supabaseClient
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (orgMember?.org_id) {
      // Update org plan in database
      const { error: updateError } = await supabaseClient
        .from("orgs")
        .update({
          plan: planId,
          monthly_credits: limits.credits,
          is_unlimited: limits.unlimited,
          has_premium_models: limits.premium,
          connector_limit: null, // Unlimited for all paid plans
          trial_ends_at: null, // Clear trial when subscribed
        })
        .eq("id", orgMember.org_id);

      if (updateError) {
        logStep("Warning: Failed to update org", { error: updateError.message });
      } else {
        logStep("Org plan updated", { orgId: orgMember.org_id, planId });
      }
    }

    return new Response(JSON.stringify({
      subscribed: true,
      plan: planId,
      subscription_end: subscriptionEnd,
      limits,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
