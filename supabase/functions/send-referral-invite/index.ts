import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  inviter_email: string;
  inviter_name: string;
  invitee_email: string;
  referral_code: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inviter_email, inviter_name, invitee_email, referral_code } = (await req.json()) as InviteRequest;

    if (!inviter_email || !invitee_email || !referral_code) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const referralLink = `https://elixa.ai/signup?ref=${referral_code}`;

    // Create invite record in database
    const inviteResponse = await fetch(
      `${supabaseUrl}/rest/v1/waitlist_invites`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          inviter_email,
          inviter_name,
          invitee_email,
          status: "pending",
          email_sent: !!resendApiKey,
          email_sent_at: resendApiKey ? new Date().toISOString() : null,
        }),
      }
    );

    if (!inviteResponse.ok) {
      const error = await inviteResponse.text();
      console.error("Error creating invite record:", error);
    }

    // Update invites_sent count
    await fetch(
      `${supabaseUrl}/rest/v1/rpc/increment_invites_sent`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: inviter_email }),
      }
    ).catch(console.error);

    // Send email if Resend is configured
    if (resendApiKey) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited! 🎉</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                <strong>${inviter_name}</strong> thinks you'd love Elixa - they're building AI employees that actually get work done.
              </p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Join the waitlist using their referral code, and you'll both get <strong>3 free AI agents</strong> when Elixa launches!
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Join the Waitlist
                </a>
              </div>
              <p style="font-size: 14px; color: #6B7280; text-align: center;">
                Your invite code: <strong style="color: #8B5CF6;">${referral_code}</strong>
              </p>
            </div>
            <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                Elixa - AI Employees That Actually Work
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Elixa <hello@elixa.ai>",
          to: [invitee_email],
          subject: `${inviter_name} thinks you'd love Elixa!`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.text();
        console.error("Error sending email:", error);
        return new Response(
          JSON.stringify({ success: true, email_sent: false, message: "Invite recorded but email failed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Invite email sent successfully to:", invitee_email);
    }

    return new Response(
      JSON.stringify({ success: true, email_sent: !!resendApiKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending referral invite:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
