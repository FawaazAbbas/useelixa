import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Code, XCircle, Sparkles } from "lucide-react";

const competitors = [
  {
    name: "Private Developers",
    price: "£500+",
    verdict: "TOO EXPENSIVE",
    accentColor: "red" as const,
    icon: Code,
    failure:
      "Building tools for the rich. The businesses who need help most can't afford them.",
  },
  {
    name: "N8N",
    price: "£24/month",
    verdict: "TOO TECHNICAL",
    accentColor: "amber" as const,
    logo: "/logos/n8nLogo.png",
    failure:
      "Brilliant if you're a developer. But most founders came to build businesses, not write code.",
  },
  {
    name: "Motion",
    price: "£35/month",
    verdict: "TOO GENERIC",
    accentColor: "slate" as const,
    logo: "/logos/MotionLogo.png",
    failure:
      "One-size-fits-all AI. Your bookkeeper and marketer can't be the same 'assistant.'",
  },
];

const getFailureStyles = (color: "red" | "amber" | "slate") => {
  const styles = {
    red: {
      border: "border-l-4 border-red-500",
      bg: "bg-gradient-to-r from-red-50/60 to-white",
      verdict: "text-red-600 bg-red-100",
      x: "text-red-400",
      icon: "text-red-500",
    },
    amber: {
      border: "border-l-4 border-amber-500",
      bg: "bg-gradient-to-r from-amber-50/60 to-white",
      verdict: "text-amber-600 bg-amber-100",
      x: "text-amber-400",
      icon: "text-amber-500",
    },
    slate: {
      border: "border-l-4 border-slate-400",
      bg: "bg-gradient-to-r from-slate-100/60 to-white",
      verdict: "text-slate-600 bg-slate-200",
      x: "text-slate-400",
      icon: "text-slate-500",
    },
  };
  return styles[color];
};

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Background: Warm-to-cool bridge from Slide 2 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-slate-50 to-white" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-slate-100/50 to-transparent" />

      <div className="relative z-10 h-full px-6 md:px-12 lg:px-20 py-8 flex flex-col justify-center">
        {/* Hero Header - Centered, dramatic */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-center mb-6"
        >
          <span className="text-orange-500 text-xs uppercase tracking-widest font-semibold mb-3 block">
            The Promise Land
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            AI employees were supposed to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-400">
              change everything
            </span>
          </h2>
        </motion.div>

        {/* Subtitle - Italic quote */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-lg md:text-xl text-slate-500 italic text-center mb-10 max-w-2xl mx-auto"
        >
          "But the options available today? They all fail in different ways."
        </motion.p>

        {/* Failure Cards - Left-border accent style */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10"
        >
          {competitors.map((comp, index) => {
            const styles = getFailureStyles(comp.accentColor);
            return (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`${styles.border} ${styles.bg} rounded-xl p-5 shadow-sm`}
              >
                {/* Logo/Icon + Name - PROMINENT */}
                <div className="flex items-center gap-3 mb-3">
                  {comp.logo ? (
                    <img
                      src={comp.logo}
                      alt={`${comp.name} logo`}
                      className="h-8 w-auto object-contain"
                    />
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
                  <XCircle className={`w-4 h-4 ${styles.x}`} />
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

        {/* Hope Callout - Glow effect, centered */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="bg-gradient-to-r from-orange-50 via-white to-slate-50 border border-orange-200/50 
                     rounded-2xl p-6 max-w-3xl mx-auto shadow-lg shadow-orange-100/30"
        >
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
        </motion.div>
      </div>
    </section>
  );
};
