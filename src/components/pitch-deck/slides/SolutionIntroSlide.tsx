import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Code, XCircle, Sparkles } from "lucide-react";

const competitors = [
  {
    name: "Private Developers",
    price: "£500+",
    verdict: "TOO EXPENSIVE",
    accentColor: "red" as const,
    icon: Code,
    failure: "Building tools for the rich. The businesses who need help most can't afford them.",
  },
  {
    name: "N8N",
    price: "£24/month",
    verdict: "TOO TECHNICAL",
    accentColor: "amber" as const,
    logo: "/logos/n8nLogo.png",
    failure: "Brilliant if you're a developer. But most founders came to build businesses, not write code.",
  },
  {
    name: "Motion",
    price: "£35/month",
    verdict: "TOO GENERIC",
    accentColor: "slate" as const,
    logo: "/logos/MotionLogo.png",
    failure: "One-size-fits-all AI. Your bookkeeper and marketer can't be the same 'assistant.'",
  },
];

const getFailureStyles = (color: "red" | "amber" | "slate") => {
  const styles = {
    red: {
      border: "border-l-4 border-red-500",
      bg: "bg-gradient-to-r from-red-50/60 to-white",
      verdict: "text-red-600 bg-red-100",
    },
    amber: {
      border: "border-l-4 border-amber-500",
      bg: "bg-gradient-to-r from-amber-50/60 to-white",
      verdict: "text-amber-600 bg-amber-100",
    },
    slate: {
      border: "border-l-4 border-slate-400",
      bg: "bg-gradient-to-r from-slate-100/60 to-white",
      verdict: "text-slate-600 bg-slate-200",
    },
  };
  return styles[color];
};

export const SolutionIntroSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-slate-100/50 to-transparent" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-orange-500">The Promise Land</span>
      </motion.div>

      {/* H1 (cols 1-10) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-10 pitch-h1">
        AI employees were supposed to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-400">
          change everything
        </span>
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-9 pitch-body italic"
      >
        "But the options available today? They all fail in different ways."
      </motion.p>

      {/* 3 comparison cards (cols 1-4, 5-8, 9-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {competitors.map((comp, index) => {
          const styles = getFailureStyles(comp.accentColor);
          return (
            <motion.div key={index} variants={scaleIn} className={`pitch-card ${styles.border} ${styles.bg}`}>
              {/* Logo/Icon + Name */}
              <div className="flex items-center gap-3 mb-3">
                {comp.logo ? (
                  <img src={comp.logo} alt={`${comp.name} logo`} className="h-8 w-auto object-contain" />
                ) : (
                  <div className={`w-10 h-10 rounded-lg ${styles.verdict} flex items-center justify-center`}>
                    <comp.icon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{comp.name}</h3>
                  <span className="text-sm text-slate-400 line-through">{comp.price}</span>
                </div>
              </div>

              {/* Verdict Badge */}
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-slate-400" />
                <span className={`${styles.verdict} rounded-full py-1 px-3 text-xs font-bold uppercase tracking-wide`}>
                  {comp.verdict}
                </span>
              </div>

              {/* Failure Story */}
              <p className="text-sm text-slate-600 leading-relaxed">{comp.failure}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Punchline card (cols 2-11, centered) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-start-2 md:col-span-10"
      >
        <div className="pitch-card bg-gradient-to-r from-orange-50 via-white to-slate-50 border-orange-200/50 shadow-lg shadow-orange-100/30">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-500">What if there was another way?</span>
          </div>
          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              Affordable
            </span>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
              No Code Required
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Specialized for YOU
            </span>
          </div>
        </div>
      </motion.div>
    </SlideShell>
  );
};
