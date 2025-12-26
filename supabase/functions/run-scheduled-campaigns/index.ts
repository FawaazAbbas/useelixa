import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[Scheduler] Checking for scheduled email campaigns...");

    const now = new Date().toISOString();

    // Find campaigns that are scheduled and due to run
    const { data: dueCampaigns, error: fetchError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) {
      console.error("[Scheduler] Error fetching campaigns:", fetchError);
      throw fetchError;
    }

    // Also find recurring campaigns that are due
    const { data: recurringCampaigns, error: recurringError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("is_recurring", true)
      .in("status", ["sent", "scheduled"])
      .not("next_recurring_run", "is", null)
      .lte("next_recurring_run", now);

    if (recurringError) {
      console.error("[Scheduler] Error fetching recurring campaigns:", recurringError);
    }

    const allDueCampaigns = [
      ...(dueCampaigns || []),
      ...(recurringCampaigns || []),
    ];

    if (allDueCampaigns.length === 0) {
      console.log("[Scheduler] No campaigns due to run");
      return new Response(
        JSON.stringify({ processed: 0, message: "No campaigns due" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Scheduler] Found ${allDueCampaigns.length} campaigns to process`);

    const results = [];

    for (const campaign of allDueCampaigns) {
      console.log(`[Scheduler] Processing campaign: ${campaign.name} (${campaign.id})`);

      try {
        // Get all contacts for the campaign based on audience filter
        let contactsQuery = supabase.from("outreach_contacts").select("id, email, name");
        
        if (campaign.audience_filter) {
          contactsQuery = contactsQuery.eq("audience", campaign.audience_filter);
        }

        const { data: contacts, error: contactsError } = await contactsQuery;

        if (contactsError) {
          console.error(`[Scheduler] Error fetching contacts for campaign ${campaign.id}:`, contactsError);
          results.push({ campaign_id: campaign.id, status: "failed", error: contactsError.message });
          continue;
        }

        if (!contacts || contacts.length === 0) {
          console.log(`[Scheduler] No contacts found for campaign ${campaign.id}`);
          
          await supabase
            .from("email_campaigns")
            .update({ 
              status: "sent", 
              sent_at: now,
              sent_count: 0,
              failed_count: 0,
            })
            .eq("id", campaign.id);
          
          results.push({ campaign_id: campaign.id, status: "completed", sent: 0 });
          continue;
        }

        // For recurring campaigns, filter out contacts already emailed in this campaign
        let recipients = contacts.map(c => ({
          email: c.email,
          name: c.name,
          outreach_contact_id: c.id,
        }));

        if (campaign.is_recurring) {
          const { data: sentEmails } = await supabase
            .from("email_sends")
            .select("outreach_contact_id")
            .eq("campaign_id", campaign.id)
            .eq("status", "sent");

          const sentIds = new Set(sentEmails?.map(e => e.outreach_contact_id) || []);
          
          // For recurring, we send to everyone again - reset the filter
          // But we could also skip already sent if that's preferred
          console.log(`[Scheduler] Recurring campaign - sending to all ${recipients.length} contacts`);
        }

        // Update campaign status to sending
        await supabase
          .from("email_campaigns")
          .update({ 
            status: "sending",
            recipient_count: recipients.length,
          })
          .eq("id", campaign.id);

        // Invoke the send-marketing-email function
        const { error: invokeError } = await supabase.functions.invoke("send-marketing-email", {
          body: {
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            subject: campaign.subject,
            body_html: campaign.body_html,
            recipients,
          },
        });

        if (invokeError) {
          console.error(`[Scheduler] Error invoking send function for ${campaign.id}:`, invokeError);
          results.push({ campaign_id: campaign.id, status: "failed", error: invokeError.message });
          continue;
        }

        // Calculate next recurring run if applicable
        if (campaign.is_recurring && campaign.recurrence_pattern) {
          const nextRun = calculateNextRecurringRun(
            campaign.recurrence_pattern,
            campaign.scheduled_at
          );

          await supabase
            .from("email_campaigns")
            .update({
              last_recurring_run: now,
              next_recurring_run: nextRun,
            })
            .eq("id", campaign.id);

          console.log(`[Scheduler] Set next recurring run for ${campaign.id}: ${nextRun}`);
        }

        results.push({ campaign_id: campaign.id, status: "started", recipients: recipients.length });

      } catch (error) {
        console.error(`[Scheduler] Exception processing campaign ${campaign.id}:`, error);
        results.push({
          campaign_id: campaign.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`[Scheduler] Processed ${allDueCampaigns.length} campaigns`);

    return new Response(
      JSON.stringify({
        processed: allDueCampaigns.length,
        results,
        message: `Processed ${allDueCampaigns.length} campaigns`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Scheduler] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateNextRecurringRun(pattern: string, baseTime: string): string {
  const base = new Date(baseTime);
  const now = new Date();
  let next = new Date(base);

  // Start from the original scheduled time and find next occurrence after now
  while (next <= now) {
    switch (pattern) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        // Unknown pattern, just add a day
        next.setDate(next.getDate() + 1);
    }
  }

  return next.toISOString();
}
