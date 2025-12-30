import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Bell, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const EmailSubscribe = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("outreach_contacts")
        .insert({
          email,
          source: "waitlist_subscriber",
          status: "subscribed",
          audience: "waitlist_alerts"
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast.success("You're on the list!");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src="/elixa-logo.png" 
              alt="Elixa" 
              className="h-12 mx-auto mb-6 hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {isSubscribed ? (
                <CheckCircle2 className="w-8 h-8 text-primary" />
              ) : (
                <Bell className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSubscribed ? "You're on the list!" : "Sign Up to Our Email List"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isSubscribed 
                ? "We'll notify you as soon as our waiting list opens."
                : "Get alerted when our waiting list is open"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubscribed ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Thank you for your interest! Keep an eye on your inbox.
                </p>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Notify Me"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll only email you when the waiting list opens. No spam, ever.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to Elixa
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailSubscribe;
