import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Brain, Zap, Database, MessageCircle } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "Experts Built These",
    subtitle: "THINK",
    description: "Created by specialists who've spent years in accounting, marketing, and law. Not generic bots—real expertise encoded.",
    gradient: "from-green-100 to-emerald-100",
    iconColor: "text-green-600",
    accentColor: "text-green-600",
  },
  {
    icon: Zap,
    title: "Real Specialists",
    subtitle: "EXECUTE",
    description: "Not 'a marketer'—a Google Ads specialist, an SEO analyst, a bookkeeper. Each AI does ONE thing exceptionally well.",
    gradient: "from-primary/10 to-blue-100",
    iconColor: "text-primary",
    accentColor: "text-primary",
    featured: true,
  },
  {
    icon: Database,
    title: "They Know You",
    subtitle: "REMEMBER",
    description: "Every AI shares one memory of your business. Ask once, they all know. No more repeating yourself.",
    gradient: "from-purple-100 to-violet-100",
    iconColor: "text-purple-600",
    accentColor: "text-purple-600",
  },
];

export const OurSolutionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-our-solution">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20" />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-12">
        <div className="max-w-7xl w-full">
          {/* The Big Reveal */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-4"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-semibold">
              Our Solution
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 leading-tight">
              Meet{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Elixa</span>:
              AI employees that <span className="italic">actually</span> work
            </h2>
          </motion.div>

          {/* The Vision */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              Imagine Slack, but every conversation is with an AI expert 
              who knows your <span className="font-semibold text-slate-900">entire business</span>.
            </p>
          </motion.div>

          {/* Three Pillars */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`bg-white rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${
                  pillar.featured 
                    ? 'border-2 border-primary/30 shadow-primary/10 hover:shadow-primary/20' 
                    : 'border border-slate-200 shadow-slate-200/60 hover:shadow-slate-200/70'
                }`}
              >
                {/* Subtitle Badge */}
                <div className={`text-xs font-bold uppercase tracking-widest ${pillar.accentColor} mb-3`}>
                  {pillar.subtitle}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4`}>
                  <pillar.icon className={`w-7 h-7 ${pillar.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* The Context Problem - Dramatic Version */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">The Problem With Every Other AI</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    You tell ChatGPT about your business. Tomorrow, you ask it something—and it's forgotten everything. 
                    You're explaining your business <span className="text-white font-semibold">over and over again</span>.
                  </p>
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                    <p className="text-white font-medium">
                      <span className="text-primary">Elixa is different.</span> Tell us once. Our AI employees share a knowledge base. 
                      Your Google Ads specialist knows what your bookkeeper knows. Your SEO analyst can reference 
                      your customer support conversations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
