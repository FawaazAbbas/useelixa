import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, floatUp, defaultViewport } from "../slideAnimations";
import { Flame, TrendingDown, PoundSterling, ArrowRight } from "lucide-react";

const painPoints = [
  { 
    icon: Flame,
    category: "BURNOUT",
    accentColor: "orange",
    statValue: "46%",
    statLabel: "of small business owners report burnout",
    detail: "Nearly half of UK businesses with 1-9 employees are burning out from wearing every hat."
  },
  { 
    icon: TrendingDown,
    category: "STUCK",
    accentColor: "blue",
    statValue: "32%",
    statLabel: "can't grow—they're too busy",
    detail: "1 in 3 owners say daily operations prevent them from hiring or expanding."
  },
  { 
    icon: PoundSterling,
    category: "UNAFFORDABLE",
    accentColor: "emerald",
    statValue: "£30,800",
    statLabel: "to hire just one employee",
    detail: "Average UK salary—before NI, pension, and recruitment costs."
  },
];

const cycleSteps = [
  { label: "No Help", color: "bg-slate-100 border-slate-300" },
  { label: "Work Harder", color: "bg-orange-100 border-orange-300" },
  { label: "Burnout", color: "bg-red-100 border-red-300" },
  { label: "No Growth", color: "bg-slate-100 border-slate-300" },
];

const getAccentStyles = (color: string) => {
  const styles: Record<string, { border: string; bg: string; iconBg: string; text: string }> = {
    orange: {
      border: "border-t-4 border-orange-500",
      bg: "bg-gradient-to-b from-orange-50/80 to-white",
      iconBg: "bg-orange-100",
      text: "text-orange-600"
    },
    blue: {
      border: "border-t-4 border-blue-500",
      bg: "bg-gradient-to-b from-blue-50/80 to-white",
      iconBg: "bg-blue-100",
      text: "text-blue-600"
    },
    emerald: {
      border: "border-t-4 border-emerald-500",
      bg: "bg-gradient-to-b from-emerald-50/80 to-white",
      iconBg: "bg-emerald-100",
      text: "text-emerald-600"
    }
  };
  return styles[color] || styles.orange;
};

export const ProblemSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Light background with warm accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/30 to-slate-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-100/40 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Chapter Label */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-3"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest font-medium">The Challenge</span>
          </motion.div>

          {/* Main Title - Emotional Punch */}
          <motion.div
            variants={floatUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Founders Are{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Drowning
              </span>{" "}
              In Their Own Business
            </h2>
          </motion.div>

          {/* Short Hook Paragraph */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              Marketing. Finance. Operations. Support. Legal.{" "}
              <span className="font-semibold text-slate-800">Most founders handle it all alone</span>—not because they want to, but because they can't afford not to.
            </p>
          </motion.div>

          {/* Stat Cards - Bold, Scannable Format */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-5 mb-8"
          >
            {painPoints.map((point, index) => {
              const styles = getAccentStyles(point.accentColor);
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className={`${styles.border} ${styles.bg} rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300`}
                >
                  {/* Icon + Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                      <point.icon className={`w-5 h-5 ${styles.text}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                      {point.category}
                    </span>
                  </div>
                  
                  {/* MASSIVE Stat */}
                  <div className="mb-3">
                    <span className="text-4xl md:text-5xl font-bold text-slate-900">
                      {point.statValue}
                    </span>
                  </div>
                  
                  {/* Stat Label */}
                  <p className="text-slate-700 font-medium text-sm mb-3">
                    {point.statLabel}
                  </p>
                  
                  {/* Divider */}
                  <div className="w-full h-px bg-slate-200 mb-3" />
                  
                  {/* Detail */}
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {point.detail}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* The Vicious Cycle - Visual Flow */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-slate-50 to-orange-50/50 border border-slate-200 rounded-2xl p-6">
              {/* Title */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-500 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">The Vicious Cycle</h3>
              </div>
              
              {/* Visual Cycle Flow */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-4">
                {cycleSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3">
                    <div className={`px-4 py-2 rounded-xl border-2 ${step.color}`}>
                      <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                    </div>
                    {index < cycleSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
                {/* Loop back arrow indicator */}
                <div className="hidden md:flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-sm text-slate-400 font-medium">↺ repeat</div>
                </div>
              </div>
              
              {/* Tagline */}
              <p className="text-center text-slate-600 text-sm italic">
                "Trapped between <span className="font-semibold text-slate-800">needing support</span> and <span className="font-semibold text-slate-800">not being able to afford it</span>."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
