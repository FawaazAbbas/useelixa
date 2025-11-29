import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentStatusEmailRequest {
  agent_name: string;
  agent_id: string;
  publisher_email: string;
  review_status: 'approved' | 'rejected';
  reviewer_notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent_name, agent_id, publisher_email, review_status, reviewer_notes }: AgentStatusEmailRequest = await req.json();

    console.log(`Sending ${review_status} email for agent: ${agent_name} to ${publisher_email}`);

    const isApproved = review_status === 'approved';
    const subject = isApproved 
      ? `🎉 Your agent "${agent_name}" has been approved!` 
      : `Your agent "${agent_name}" needs revision`;

    const htmlContent = isApproved 
      ? `
        <h1>Congratulations! Your agent has been approved!</h1>
        <p>Great news! Your agent <strong>${agent_name}</strong> has been reviewed and approved for publication on ELIXA.</p>
        <p>Your agent is now live and available for users to install.</p>
        <p><a href="https://elixa.app/marketplace/${agent_id}" style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Your Agent</a></p>
        <p style="margin-top: 24px; color: #666;">Thank you for contributing to the ELIXA marketplace!</p>
      `
      : `
        <h1>Agent Review Feedback</h1>
        <p>Thank you for submitting <strong>${agent_name}</strong> to ELIXA.</p>
        <p>After reviewing your agent, we found some issues that need to be addressed before it can be published:</p>
        <div style="background: #f9fafb; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-wrap;">${reviewer_notes || 'Please review your agent configuration and ensure all requirements are met.'}</p>
        </div>
        <p>Please make the necessary updates and resubmit your agent.</p>
        <p><a href="https://elixa.app/publish" style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Update & Resubmit</a></p>
        <p style="margin-top: 24px; color: #666;">If you have questions, please reach out to our support team.</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "ELIXA <onboarding@resend.dev>",
      to: [publisher_email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-agent-status-email function:", error);
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
