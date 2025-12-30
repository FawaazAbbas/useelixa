import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Bell, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-fuchsia-500/10 blur-[80px]"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-block">
            <img 
              src="/elixa-logo.png" 
              alt="Elixa" 
              className="h-14 mx-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-violet-500/50 to-fuchsia-500/50 rounded-3xl blur-xl opacity-30" />
          
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-10 shadow-2xl">
            {/* Icon */}
            <motion.div 
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/25"
              animate={isSubscribed ? {} : { 
                boxShadow: [
                  "0 10px 40px -10px hsl(var(--primary) / 0.4)",
                  "0 10px 60px -10px hsl(var(--primary) / 0.6)",
                  "0 10px 40px -10px hsl(var(--primary) / 0.4)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isSubscribed ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <Bell className="w-10 h-10 text-white" />
              )}
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              {isSubscribed ? "You're on the list!" : "Get Early Access"}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground text-center mb-8 max-w-sm mx-auto">
              {isSubscribed 
                ? "We'll notify you as soon as our waiting list opens."
                : "Be the first to know when our waiting list opens"
              }
            </p>

            {isSubscribed ? (
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Keep an eye on your inbox</span>
                  <Sparkles className="w-5 h-5" />
                </div>
                <Link to="/">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-base border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-violet-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-muted-foreground z-10" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-base bg-background/50 border-border/50 rounded-xl focus:border-primary/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div 
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Subscribing...
                    </span>
                  ) : (
                    "Notify Me"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground/70">
                  We'll only email you when the waiting list opens. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </motion.div>

        {/* Back link */}
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/" className="hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2">
            <span>←</span>
            <span>Back to Elixa</span>
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default EmailSubscribe;
