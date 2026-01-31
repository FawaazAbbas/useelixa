import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Shield, Target, Network, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Built by Experts",
    subtitle: "QUALITY",
    description:
      "Every Elixa agent is created by a vetted private developer, not a generic AI factory. Real-world know-how, reliability, and performance you can trust—at a price small businesses can actually afford.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Target,
    title: "Role-Specific Specialists",
    subtitle: "SPECIALISTS",
    description:
      "Each agent is a true specialist—a Google Ads marketer, an SEO analyst, a bookkeeper, a customer support agent. Designed to execute with the depth and nuance of a real teammate.",
    gradient: "from-primary to-blue-600",
    featured: true,
  },
  {
    icon: Network,
    title: "Unified Workspace",
    subtitle: "COLLABORATIVE",
    description:
      "All AI employees work together in one workspace. Every agent shares context, communicates seamlessly, and connects to 90+ tools—automate work without the chaos of disconnected apps.",
    gradient: "from-purple-500 to-violet-600",
  },
];

export const OurSolutionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-our-solution">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20" />
      
      {/* Soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-primary text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Our Solution
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Meet{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Elixa</span>
            </h2>
            <p className="text-xl text-slate-600">Your company, staffed with AI.</p>
          </motion.div>

          {/* Description Card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-10"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-lg text-slate-700 leading-relaxed">
                Elixa is more than just another "AI assistant." It's a{" "}
                <span className="font-semibold text-primary">marketplace of real AI employees</span>, each created by
                specialist developers, trained for a specific business role, and ready to work together in a unified,
                fully connected workspace.
              </p>
            </div>
          </motion.div>

          {/* Three Pillars */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 ${
                  pillar.featured
                    ? "border-2 border-primary/30 ring-4 ring-primary/5"
                    : "border border-slate-200"
                }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-5`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>

                {/* Subtitle */}
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">
                  {pillar.subtitle}
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Tagline */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/5 via-purple-50/50 to-primary/5 border border-primary/10 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl md:text-2xl font-semibold text-slate-800">
                AI employees that <span className="text-primary">think</span>,{" "}
                <span className="text-purple-600">remember</span>, and <span className="text-blue-600">execute</span>
              </p>
              <p className="text-slate-500 mt-2">Built for the way you actually work.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
