import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Code, XCircle, Sparkles, ArrowRight } from "lucide-react";

const competitors = [
  {
    name: "Private Developers",
    price: "£500+",
    verdict: "TOO EXPENSIVE",
    icon: Code,
    failure: "Building tools for the rich. The businesses who need help most can't afford them.",
    color: "red",
  },
  {
    name: "N8N",
    price: "£24/month",
    verdict: "TOO TECHNICAL",
    logo: "/logos/n8nLogo.png",
    failure: "Brilliant if you're a developer. But most founders came to build businesses, not write code.",
    color: "amber",
  },
  {
    name: "Motion",
    price: "£35/month",
    verdict: "TOO GENERIC",
    logo: "/logos/MotionLogo.png",
    failure: "One-size-fits-all AI. Your bookkeeper and marketer can't be the same 'assistant.'",
    color: "slate",
  },
];

const getStyles = (color: string) => {
  const styles: Record<string, { badge: string; border: string; icon: string }> = {
    red: { badge: "bg-red-100 text-red-700", border: "border-l-red-500", icon: "text-red-500" },
    amber: { badge: "bg-amber-100 text-amber-700", border: "border-l-amber-500", icon: "text-amber-500" },
    slate: { badge: "bg-slate-200 text-slate-700", border: "border-l-slate-400", icon: "text-slate-500" },
  };
  return styles[color] || styles.slate;
};

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Transition gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-slate-50" />
      
      {/* Subtle geometric */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-slate-100/50 to-transparent" />

      <div className="relative z-10 h-full px-8 md:px-16 lg:px-24 flex flex-col justify-center">
        {/* Header - dramatic centered */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-center mb-12"
        >
          <span className="inline-block text-orange-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
            The Promise Land
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-4">
            AI employees were supposed to{" "}
            <span className="text-slate-400">change everything</span>
          </h2>
          <p className="text-xl text-slate-500 italic max-w-xl mx-auto">
            "But the options available today? They all fail in different ways."
          </p>
        </motion.div>

        {/* Failure Cards - clean horizontal layout */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
        >
          {competitors.map((comp, index) => {
            const styles = getStyles(comp.color);
            return (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`bg-white border-l-4 ${styles.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-all`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {comp.logo ? (
                    <img src={comp.logo} alt={comp.name} className="h-8 w-auto object-contain" />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center`}>
                      <comp.icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{comp.name}</h3>
                    <span className="text-sm text-slate-400 line-through">{comp.price}</span>
                  </div>
                </div>

                {/* Verdict */}
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className={`w-4 h-4 ${styles.icon}`} />
                  <span className={`${styles.badge} rounded-full py-1 px-3 text-xs font-bold uppercase tracking-wide`}>
                    {comp.verdict}
                  </span>
                </div>

                {/* Failure explanation */}
                <p className="text-sm text-slate-600 leading-relaxed">{comp.failure}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Hope Callout - elevated design */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/5 via-white to-purple-50 border border-primary/20 rounded-2xl p-8 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-slate-600">What if there was another way?</span>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="px-5 py-2.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                Affordable
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
              <span className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                No Code Required
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
              <span className="px-5 py-2.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Specialized for YOU
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
