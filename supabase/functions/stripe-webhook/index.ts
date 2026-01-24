import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product IDs for subscription plans
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TqW6RM18o3Eyzd": "starter",
  "prod_TqW6xtQM170Yg8": "pro",
  "prod_TqW7nnxVAdzhpT": "unlimited",
};

// Plan limits
const PLAN_LIMITS: Record<string, { credits: number; unlimited: boolean; premium: boolean }> = {
  starter: { credits: 1000, unlimited: false, premium: false },
  pro: { credits: 5000, unlimited: false, premium: true },
  unlimited: { credits: 0, unlimited: true, premium: true },
  trial: { credits: 100, unlimited: false, premium: false },
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR: Invalid signature", { error: err instanceof Error ? err.message : String(err) });
      return new Response(`Webhook signature verification failed`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { 
          sessionId: session.id, 
          mode: session.mode,
          metadata: session.metadata 
        });

        if (session.mode === "payment" && session.metadata?.type === "credit_purchase") {
          // Credit purchase completed
          const creditAmount = parseInt(session.metadata.credit_amount || "0", 10);
          const userId = session.metadata.user_id;

          if (creditAmount > 0 && userId) {
            await handleCreditPurchase(supabase, userId, creditAmount);
          }
        } else if (session.mode === "subscription") {
          // Subscription checkout - the subscription.created event handles the rest
          logStep("Subscription checkout completed, waiting for subscription event");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          customerId: subscription.customer 
        });

        if (subscription.status === "active") {
          await handleSubscriptionUpdate(stripe, supabase, subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription canceled", { subscriptionId: subscription.id });
        
        await handleSubscriptionCanceled(stripe, supabase, subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { 
          invoiceId: invoice.id, 
          amountPaid: invoice.amount_paid,
          customerId: invoice.customer 
        });
        
        // For recurring subscription invoices, ensure plan is synced
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          if (subscription.status === "active") {
            await handleSubscriptionUpdate(stripe, supabase, subscription);
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCreditPurchase(supabase: any, userId: string, creditAmount: number) {
  logStep("Processing credit purchase", { userId, creditAmount });

  try {
    // Get user's org
    const { data: orgMember, error: orgError } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (orgError || !orgMember) {
      logStep("ERROR: Could not find org for user", { userId, error: orgError?.message });
      return;
    }

    const orgId = orgMember.org_id;
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // Upsert usage stats with credits purchased
    const { data: existingStats } = await supabase
      .from("usage_stats")
      .select("credits_purchased")
      .eq("org_id", orgId)
      .eq("month", currentMonth)
      .maybeSingle();

    const currentPurchased = existingStats?.credits_purchased || 0;
    const newTotal = currentPurchased + creditAmount;

    const { error: upsertError } = await supabase
      .from("usage_stats")
      .upsert({
        org_id: orgId,
        month: currentMonth,
        credits_purchased: newTotal,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "org_id,month",
      });

    if (upsertError) {
      logStep("ERROR: Failed to update credits", { error: upsertError.message });
    } else {
      logStep("Credits added successfully", { orgId, creditAmount, newTotal });
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      org_id: orgId,
      type: "billing",
      title: "Credits Added",
      message: `${creditAmount.toLocaleString()} credits have been added to your account.`,
      action_url: "/billing",
    });

  } catch (error) {
    logStep("ERROR in handleCreditPurchase", { error: error instanceof Error ? error.message : String(error) });
  }
}

async function handleSubscriptionUpdate(stripe: Stripe, supabase: any, subscription: Stripe.Subscription) {
  logStep("Processing subscription update", { subscriptionId: subscription.id });

  try {
    // Get customer email
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      logStep("Customer deleted, skipping");
      return;
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      logStep("No email on customer, skipping");
      return;
    }

    // Find user by email using auth admin
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      logStep("ERROR listing users", { error: userError.message });
      return;
    }

    const user = users?.users?.find((u: any) => u.email === email);
    if (!user) {
      logStep("No user found with email", { email });
      return;
    }

    // Get user's org
    const { data: orgMember } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!orgMember) {
      logStep("No org found for user", { userId: user.id });
      return;
    }

    // Determine plan from product
    const productId = subscription.items.data[0]?.price?.product as string;
    const planId = PRODUCT_TO_PLAN[productId] || "starter";
    const limits = PLAN_LIMITS[planId];

    logStep("Updating org plan", { orgId: orgMember.org_id, planId, productId });

    // Update org
    const { error: updateError } = await supabase
      .from("orgs")
      .update({
        plan: planId,
        monthly_credits: limits.credits,
        is_unlimited: limits.unlimited,
        has_premium_models: limits.premium,
        connector_limit: null, // Unlimited for paid plans
        trial_ends_at: null,
        plan_started_at: new Date().toISOString(),
      })
      .eq("id", orgMember.org_id);

    if (updateError) {
      logStep("ERROR updating org", { error: updateError.message });
    } else {
      logStep("Org plan updated successfully", { orgId: orgMember.org_id, planId });

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        org_id: orgMember.org_id,
        type: "billing",
        title: "Plan Upgraded",
        message: `Your plan has been upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}.`,
        action_url: "/billing",
      });
    }

  } catch (error) {
    logStep("ERROR in handleSubscriptionUpdate", { error: error instanceof Error ? error.message : String(error) });
  }
}

async function handleSubscriptionCanceled(stripe: Stripe, supabase: any, subscription: Stripe.Subscription) {
  logStep("Processing subscription cancellation", { subscriptionId: subscription.id });

  try {
    // Get customer email
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      logStep("Customer deleted, skipping");
      return;
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      logStep("No email on customer, skipping");
      return;
    }

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u: any) => u.email === email);
    
    if (!user) {
      logStep("No user found with email", { email });
      return;
    }

    // Get user's org
    const { data: orgMember } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!orgMember) {
      logStep("No org found for user", { userId: user.id });
      return;
    }

    // Downgrade to trial
    const trialLimits = PLAN_LIMITS.trial;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { error: updateError } = await supabase
      .from("orgs")
      .update({
        plan: "trial",
        monthly_credits: trialLimits.credits,
        is_unlimited: false,
        has_premium_models: false,
        connector_limit: 2,
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq("id", orgMember.org_id);

    if (updateError) {
      logStep("ERROR downgrading org", { error: updateError.message });
    } else {
      logStep("Org downgraded to trial", { orgId: orgMember.org_id });

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        org_id: orgMember.org_id,
        type: "billing",
        title: "Subscription Canceled",
        message: "Your subscription has been canceled. You've been moved to the trial plan.",
        action_url: "/billing",
      });
    }

  } catch (error) {
    logStep("ERROR in handleSubscriptionCanceled", { error: error instanceof Error ? error.message : String(error) });
  }
}
