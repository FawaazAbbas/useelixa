import { motion } from "framer-motion";
import { ElixaMascot } from "@/components/ElixaMascot";
import { fadeInUp, floatUp, defaultViewport } from "../slideAnimations";
import { ChevronDown } from "lucide-react";

export const TitleSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-title">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,8%)] via-[hsl(220,40%,12%)] to-[hsl(260,30%,10%)]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Logo with glow */}
        <motion.div
          variants={floatUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-white tracking-tight">
              ELIXA
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-primary blur-2xl opacity-50">
              ELIXA
            </div>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-2xl md:text-3xl text-muted-foreground font-light tracking-widest uppercase mb-12"
        >
          Pre-Seed Deck
        </motion.p>

        {/* Mascot */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mb-16"
        >
          <ElixaMascot pose="waving" size="xl" animation="float" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-sm uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
