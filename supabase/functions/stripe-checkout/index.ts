import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

// Price IDs for subscription plans (LIVE MODE)
const PLAN_PRICES: Record<string, string> = {
  starter: "price_1SsxRTIiX8stjLLy68hnyhrD",
  pro: "price_1SsxRoIiX8stjLLyJM3f97VL",
  unlimited: "price_1SsxS6IiX8stjLLyndc2G85p",
};

// Credits product ID (LIVE MODE)
const CREDITS_PRODUCT_ID = "prod_Tqelsct2gcwdpM";

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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    const { type, planId, creditAmount, couponId, promoCode } = await req.json();
    logStep("Request payload", { type, planId, creditAmount, couponId, promoCode });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://workspace.elixa.app";
    let session: Stripe.Checkout.Session;

    // Build discounts array if coupon or promo code provided
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined = 
      couponId ? [{ coupon: couponId }] : 
      promoCode ? [{ promotion_code: promoCode }] : 
      undefined;

    // Determine if we should show the promo code field
    // Only show it if no discount is pre-applied
    const allowPromotionCodes = !couponId && !promoCode;

    if (type === "subscription") {
      // Subscription checkout
      const priceId = PLAN_PRICES[planId];
      if (!priceId) throw new Error(`Invalid plan ID: ${planId}`);

      logStep("Creating subscription session", { planId, priceId, couponId, promoCode, allowPromotionCodes });

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        allow_promotion_codes: allowPromotionCodes,
        discounts: discounts,
        success_url: `${siteUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/billing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      });
    } else if (type === "credits") {
      // One-time credit purchase
      if (!creditAmount || creditAmount < 100) {
        throw new Error("Credit amount must be at least 100");
      }

      // Calculate price in pence (6p per credit)
      const pricePerCredit = 6;
      const totalPence = creditAmount * pricePerCredit;

      logStep("Creating credit purchase session", { creditAmount, totalPence, couponId, promoCode, allowPromotionCodes });

      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product: CREDITS_PRODUCT_ID, // Elixa Credits product (LIVE)
              unit_amount: totalPence,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: allowPromotionCodes,
        discounts: discounts,
        success_url: `${siteUrl}/billing?credits=true&amount=${creditAmount}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/billing?canceled=true`,
        metadata: {
          user_id: user.id,
          credit_amount: String(creditAmount),
          type: "credit_purchase",
        },
      });
    } else {
      throw new Error(`Invalid checkout type: ${type}`);
    }

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
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
