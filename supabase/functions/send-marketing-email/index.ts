import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRecipient {
  email: string;
  name?: string;
  outreach_contact_id?: string;
}

interface MarketingEmailRequest {
  campaign_id?: string;
  campaign_name: string;
  subject: string;
  body_html: string;
  recipients: EmailRecipient[];
  from_email?: string;
  from_name?: string;
  resume_from_index?: number; // For resuming interrupted campaigns
}

const ELASTIC_EMAIL_API_URL = "https://api.elasticemail.com/v4/emails/transactional";
const BATCH_SIZE = 100; // Process in batches of 100 emails
const PROGRESS_UPDATE_INTERVAL = 10; // Update progress every 10 emails

async function sendElasticEmail(
  apiKey: string,
  to: string,
  toName: string | undefined,
  subject: string,
  bodyHtml: string,
  fromEmail: string,
  fromName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Replace {{name}} placeholder with recipient name
    const personalizedBody = bodyHtml.replace(/\{\{name\}\}/gi, toName || "there");
    const personalizedSubject = subject.replace(/\{\{name\}\}/gi, toName || "there");

    const response = await fetch(ELASTIC_EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": apiKey,
      },
      body: JSON.stringify({
        Recipients: {
          To: [toName ? `${toName} <${to}>` : to],
        },
        Content: {
          Body: [
            {
              ContentType: "HTML",
              Content: personalizedBody,
              Charset: "utf-8",
            },
          ],
          Subject: personalizedSubject,
          From: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Elastic Email API error:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, messageId: result.MessageID };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

async function processEmailBatch(
  supabase: any,
  elasticEmailApiKey: string,
  campaignId: string,
  recipients: EmailRecipient[],
  subject: string,
  bodyHtml: string,
  fromEmail: string,
  fromName: string,
  startIndex: number
): Promise<{ processedCount: number; sentCount: number; failedCount: number; cancelled: boolean }> {
  let sentCount = 0;
  let failedCount = 0;
  let processedCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    // Check if campaign was cancelled
    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("status")
      .eq("id", campaignId)
      .single();

    if (campaign?.status === "cancelled") {
      console.log(`Campaign ${campaignId} was cancelled. Stopping at index ${startIndex + i}`);
      return { processedCount, sentCount, failedCount, cancelled: true };
    }

    const recipient = recipients[i];
    const result = await sendElasticEmail(
      elasticEmailApiKey,
      recipient.email,
      recipient.name,
      subject,
      bodyHtml,
      fromEmail,
      fromName
    );

    // Log the send
    await supabase.from("email_sends").insert({
      campaign_id: campaignId,
      outreach_contact_id: recipient.outreach_contact_id || null,
      recipient_email: recipient.email,
      recipient_name: recipient.name || null,
      status: result.success ? "sent" : "failed",
      sent_at: result.success ? new Date().toISOString() : null,
      error_message: result.error || null,
    });

    // Update outreach contact if exists
    if (recipient.outreach_contact_id && result.success) {
      const { data: contactData } = await supabase
        .from("outreach_contacts")
        .select("email_count")
        .eq("id", recipient.outreach_contact_id)
        .single();

      const currentCount = contactData?.email_count || 0;

      await supabase
        .from("outreach_contacts")
        .update({
          last_contacted_at: new Date().toISOString(),
          email_count: currentCount + 1,
          status: "contacted",
        })
        .eq("id", recipient.outreach_contact_id);
    }

    if (result.success) {
      sentCount++;
    } else {
      failedCount++;
    }
    processedCount++;

    // Update campaign progress periodically
    if (processedCount % PROGRESS_UPDATE_INTERVAL === 0) {
      await supabase
        .from("email_campaigns")
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq("id", campaignId);
      
      console.log(`Progress: ${startIndex + processedCount}/${startIndex + recipients.length} emails processed`);
    }

    // Rate limit: wait 100ms between sends
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { processedCount, sentCount, failedCount, cancelled: false };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const elasticEmailApiKey = Deno.env.get("ELASTICEMAIL_API_KEY");
    if (!elasticEmailApiKey) {
      console.error("ELASTICEMAIL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestData: MarketingEmailRequest = await req.json();
    const {
      campaign_id,
      campaign_name,
      subject,
      body_html,
      recipients,
      from_email = "outreach@elixa.app",
      from_name = "Elixa Team",
      resume_from_index = 0,
    } = requestData;

    console.log(`Starting campaign "${campaign_name}" with ${recipients.length} recipients (starting from index ${resume_from_index})`);

    // Create campaign if not exists
    let campaignId: string = campaign_id || "";
    if (!campaign_id) {
      const { data: newCampaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: campaign_name,
          subject,
          body_html,
          recipient_count: recipients.length,
          created_by: user.id,
          status: "sending",
          sent_count: 0,
          failed_count: 0,
        })
        .select()
        .single();

      if (campaignError) {
        console.error("Error creating campaign:", campaignError);
        return new Response(
          JSON.stringify({ error: "Failed to create campaign" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      campaignId = newCampaign.id;
    } else {
      // Update existing campaign status to sending if resuming
      await supabase
        .from("email_campaigns")
        .update({ status: "sending" })
        .eq("id", campaignId);
    }

    // Slice recipients based on resume index
    const remainingRecipients = recipients.slice(resume_from_index);
    
    // Process emails in background using waitUntil
    const backgroundTask = async () => {
      console.log(`Background task started for campaign ${campaignId}`);
      
      let totalSent = 0;
      let totalFailed = 0;
      let currentIndex = resume_from_index;
      let wasCancelled = false;

      // Process in batches
      for (let i = 0; i < remainingRecipients.length; i += BATCH_SIZE) {
        const batch = remainingRecipients.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}, emails ${currentIndex + 1} to ${currentIndex + batch.length}`);

        const result = await processEmailBatch(
          supabase,
          elasticEmailApiKey,
          campaignId,
          batch,
          subject,
          body_html,
          from_email,
          from_name,
          currentIndex
        );

        totalSent += result.sentCount;
        totalFailed += result.failedCount;
        currentIndex += result.processedCount;

        // Update campaign progress after each batch
        await supabase
          .from("email_campaigns")
          .update({
            sent_count: totalSent,
            failed_count: totalFailed,
          })
          .eq("id", campaignId);

        if (result.cancelled) {
          wasCancelled = true;
          console.log(`Campaign ${campaignId} cancelled after processing ${currentIndex} emails`);
          break;
        }
      }

      // Finalize campaign status
      const finalStatus = wasCancelled ? "cancelled" : "sent";
      await supabase
        .from("email_campaigns")
        .update({
          status: finalStatus,
          sent_at: wasCancelled ? null : new Date().toISOString(),
          sent_count: totalSent,
          failed_count: totalFailed,
        })
        .eq("id", campaignId);

      console.log(`Campaign ${campaignId} ${finalStatus}: ${totalSent} sent, ${totalFailed} failed`);
    };

    // Use EdgeRuntime.waitUntil for background processing
    // @ts-ignore - EdgeRuntime is available in Supabase edge functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(backgroundTask());
    } else {
      // Fallback for local testing - run synchronously
      await backgroundTask();
    }

    // Return immediately with campaign info
    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        message: `Campaign started. Processing ${remainingRecipients.length} emails in background.`,
        total_recipients: recipients.length,
        starting_from: resume_from_index,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-marketing-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Handle shutdown gracefully
addEventListener("beforeunload", (ev: any) => {
  console.log("Function shutting down:", ev.detail?.reason);
});

serve(handler);
