import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/utils/analytics";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface EmailInviteFormProps {
  inviterEmail: string;
  inviterName: string;
  referralCode: string;
}

export const EmailInviteForm = ({ inviterEmail, inviterName, referralCode }: EmailInviteFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your friend's email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Self-referral prevention
    if (email.trim().toLowerCase() === inviterEmail.toLowerCase()) {
      toast({
        title: "Can't invite yourself",
        description: "You cannot use your own email as a referral",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("send-referral-invite", {
        body: {
          inviter_email: inviterEmail,
          inviter_name: inviterName,
          invitee_email: email.trim().toLowerCase(),
          referral_code: referralCode,
        },
      });

      if (error) throw error;

      if (data?.error) {
        setStatus("error");
        setErrorMessage(data.error);
        toast({
          title: "Couldn't send invite",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setStatus("success");
      trackEvent({ action: "referral_invite_sent", category: "engagement", label: "email" });
      toast({
        title: "Invite sent! 🎉",
        description: `We've sent an invitation to ${email}`,
      });
      setEmail("");
      
      // Reset success state after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error("Error sending invite:", err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      toast({
        title: "Failed to send invite",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="friend@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
          className="h-10"
          disabled={loading}
        />
        <Button
          onClick={handleSendInvite}
          disabled={loading || !email.trim()}
          className="h-10 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </div>
      )}
      {status === "success" && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle2 className="w-3 h-3" />
          Invite sent successfully!
        </div>
      )}
    </div>
  );
};
