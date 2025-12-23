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
}

const ELASTIC_EMAIL_API_URL = "https://api.elasticemail.com/v4/emails/transactional";

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
    console.log("Email sent successfully:", result);
    return { success: true, messageId: result.MessageID };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
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
      from_email = "outreach@elixa.ai",
      from_name = "Elixa Team",
    } = requestData;

    console.log(`Starting campaign "${campaign_name}" with ${recipients.length} recipients`);

    // Create campaign if not exists
    let campaignId = campaign_id;
    if (!campaignId) {
      const { data: newCampaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: campaign_name,
          subject,
          body_html,
          recipient_count: recipients.length,
          created_by: user.id,
          status: "sending",
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
    }

    // Process emails with rate limiting (1 per second to be safe)
    const results: { email: string; success: boolean; error?: string }[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await sendElasticEmail(
        elasticEmailApiKey,
        recipient.email,
        recipient.name,
        subject,
        body_html,
        from_email,
        from_name
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
        // First get current email_count
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

      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }

      // Rate limit: wait 100ms between sends
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update campaign status
    await supabase
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq("id", campaignId);

    console.log(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        sent_count: sentCount,
        failed_count: failedCount,
        results,
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

serve(handler);
