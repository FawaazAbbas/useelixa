import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, CheckSquare, Calendar, FileText, Newspaper } from "lucide-react";
import { ElixaMascot } from "@/components/ElixaMascot";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTryItOut = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };

  const handleSeeHowItWorks = () => {
    document.getElementById("workspace-features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text"
          >
            Your AI Assistant That Gets Work Done
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Elixa connects to your tools and handles tasks, emails, scheduling, and more — all through natural conversation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleTryItOut}
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            >
              Try it out
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSeeHowItWorks}
              className="text-lg px-8 py-6"
            >
              See how it works
            </Button>
          </motion.div>
        </div>

        {/* Visual: Workspace mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">Elixa Workspace</span>
            </div>

            {/* Workspace layout */}
            <div className="flex min-h-[300px] md:min-h-[400px]">
              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="hidden sm:flex flex-col w-48 border-r border-border/50 bg-muted/20 p-3 gap-1"
              >
                {[
                  { icon: MessageSquare, label: "Chat", active: true },
                  { icon: CheckSquare, label: "Tasks" },
                  { icon: Calendar, label: "Calendar" },
                  { icon: FileText, label: "Notes" },
                  { icon: Newspaper, label: "Digest" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      item.active 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                ))}
              </motion.div>

              {/* Chat area */}
              <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex justify-end"
                >
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm">What's on my calendar today?</p>
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <ElixaMascot pose="default" size="xs" className="w-10 h-10" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm mb-2">You have 3 meetings today:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 9:00 AM — Team standup</li>
                      <li>• 2:00 PM — Client call</li>
                      <li>• 4:00 PM — Design review</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                  className="flex gap-3 items-center"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <ElixaMascot pose="thinking" size="xs" className="w-10 h-10" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
