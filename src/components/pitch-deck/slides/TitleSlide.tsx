import { motion } from "framer-motion";
import { fadeInUp, floatUp } from "../slideAnimations";
import { SlideShell } from "../SlideShell";

export const TitleSlide = () => {
  return (
    <SlideShell background="gradient">
      {/* Logo/Wordmark - centered (cols 4-9) */}
      <motion.div
        variants={floatUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-start-4 md:col-span-6 flex flex-col items-center justify-center pt-24 md:pt-32"
      >
        <div className="relative mb-8">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-slate-900 tracking-tight">
            ELIXA
          </h1>
          <div className="absolute inset-0 text-7xl md:text-8xl lg:text-9xl font-bold text-primary/20 blur-2xl pointer-events-none">
            ELIXA
          </div>
        </div>
      </motion.div>

      {/* Tagline - centered (cols 3-10) */}
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-start-3 md:col-span-8 text-center text-2xl md:text-3xl text-slate-600 font-medium"
      >
        AI Employees That Work For You
      </motion.p>

      {/* Pill/Badge - centered (cols 5-8) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-start-5 md:col-span-4 flex justify-center mt-6"
      >
        <span className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-widest">
          Pre-Seed Deck • 2025
        </span>
      </motion.div>

      {/* Footer line - bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="col-span-12 flex items-end justify-center pb-4"
      >
        <p className="text-sm text-slate-400">
          useelixa.com • hello@useelixa.com
        </p>
      </motion.div>
    </SlideShell>
  );
};
