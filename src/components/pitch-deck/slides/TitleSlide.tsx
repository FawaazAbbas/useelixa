import { motion } from "framer-motion";
import { ElixaMascot } from "@/components/ElixaMascot";
import { fadeInUp, floatUp, defaultViewport } from "../slideAnimations";
import { ChevronDown } from "lucide-react";

export const TitleSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-title">
      {/* Refined gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50" />
      
      {/* Subtle geometric accents */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-200/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-200/30 rounded-full" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        {/* Pre-seed badge */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mb-8"
        >
          <span className="inline-block bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
            Pre-Seed Deck • 2025
          </span>
        </motion.div>

        {/* Logo with elegant treatment */}
        <motion.div
          variants={floatUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mb-8"
        >
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 tracking-tight">
            ELIXA
          </h1>
        </motion.div>

        {/* Tagline with refined typography */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-xl md:text-2xl lg:text-3xl text-slate-600 font-medium mb-6 tracking-tight"
        >
          AI Employees That Work For You
        </motion.p>

        {/* Value proposition - refined card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="max-w-2xl mb-12"
        >
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            A Slack-style workspace with an app store for AI employees. 
            They think, execute, and remember your entire business.
          </p>
        </motion.div>

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

        {/* Scroll indicator - minimal design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
