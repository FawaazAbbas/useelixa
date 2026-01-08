import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  email: string;
  name: string;
  referral_count: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, referral_count } = (await req.json()) as NotifyRequest;

    if (!email || !name) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("Resend API key not configured, skipping email");
      return new Response(
        JSON.stringify({ success: true, email_sent: false, message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background-color: #f5f5f5;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          </div>
          <div style="padding: 32px; text-align: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🤖</span>
            </div>
            <h2 style="font-size: 22px; color: #111827; margin: 0 0 16px;">
              You've unlocked 3 free AI agents!
            </h2>
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
              Hey ${name}! Thanks to your ${referral_count} successful referrals, you've earned 3 free AI employees when Elixa launches.
            </p>
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #166534; margin: 0;">
                <strong>Your Reward:</strong><br>
                3x AI Agents (Value: $297/mo)
              </p>
            </div>
            <p style="font-size: 14px; color: #6B7280;">
              Keep sharing to unlock even more rewards! Refer 10 friends to get Premium Access.
            </p>
          </div>
          <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
            <a href="https://elixa.ai/referral?email=${encodeURIComponent(email)}" style="color: #8B5CF6; text-decoration: none; font-weight: 500;">
              View your referral dashboard →
            </a>
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
        to: [email],
        subject: "🎉 You've unlocked 3 free AI agents!",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Error sending reward notification email:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Reward notification email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, email_sent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending reward notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
