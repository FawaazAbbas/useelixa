import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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

  const handleBrowseTools = () => {
    document.getElementById("tool-library")?.scrollIntoView({ behavior: "smooth" });
  };

  const toolLogos = [
    { name: "Gmail", src: "/logos/GoogleDriveLogo.png" },
    { name: "Shopify", src: "/logos/ShopifyLogo.svg" },
    { name: "Slack", src: "/logos/SlackLogo.svg" },
    { name: "Notion", src: "/logos/NotionLogo.svg" },
    { name: "Stripe", src: "/logos/StripeLogo.png" },
  ];

  const aiLogos = [
    { name: "Claude", initial: "C", color: "from-orange-500 to-amber-500" },
    { name: "Cursor", initial: "⌘", color: "from-blue-500 to-cyan-500" },
    { name: "Any AI", initial: "AI", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">MCP Connector Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text"
          >
            Connect Your Tools to AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Elixa is the bridge between your favorite apps and AI assistants. 
            Connect once, use everywhere.
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
              onClick={handleBrowseTools}
              className="text-lg px-8 py-6"
            >
              Browse Tools
            </Button>
          </motion.div>
        </div>

        {/* Visual: Tool logos connecting to AI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Tool logos */}
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              {toolLogos.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <img src={tool.src} alt={tool.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                </motion.div>
              ))}
            </div>

            {/* Connection lines */}
            <div className="relative w-full h-24 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet">
                <motion.path
                  d="M50,10 Q200,10 200,50 M150,10 Q200,10 200,50 M200,10 L200,50 M250,10 Q200,10 200,50 M350,10 Q200,10 200,50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 1 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Elixa hub */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30"
              >
                <span className="text-2xl font-bold text-primary-foreground">E</span>
              </motion.div>
            </div>

            {/* AI logos */}
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {aiLogos.map((ai, index) => (
                <motion.div
                  key={ai.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${ai.color} flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300`}
                >
                  <span className="text-xl md:text-2xl font-bold text-white">{ai.initial}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
