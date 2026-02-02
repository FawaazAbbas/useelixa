import { motion } from "framer-motion";
import { fadeInUp, floatUp, defaultViewport } from "../slideAnimations";
import { ChevronDown } from "lucide-react";

export const TitleSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-title">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/50" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Logo */}
        <motion.div
          variants={floatUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-slate-900 tracking-tight">
              ELIXA
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-primary/20 blur-2xl">
              ELIXA
            </div>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-2xl md:text-3xl text-slate-600 font-medium mb-8"
        >
          AI Employees That Work For You
        </motion.p>

        {/* Pre-Seed badge */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <span className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-widest">
            Pre-Seed Deck • 2025
          </span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-slate-400"
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
