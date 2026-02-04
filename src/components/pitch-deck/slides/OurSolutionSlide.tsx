import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Shield, Target, Network } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Built by Experts",
    subtitle: "QUALITY",
    description:
      "Every Elixa agent is created by a vetted private developer, not a generic AI factory. Real-world know-how, reliability, and performance you can trust—at a price small businesses can actually afford.",
    gradient: "from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    accentColor: "text-amber-600",
  },
  {
    icon: Target,
    title: "Role-Specific Specialists",
    subtitle: "SPECIALISTS",
    description:
      "Each agent is a true specialist—a Google Ads marketer, an SEO analyst, a bookkeeper, a customer support agent. Designed to execute with the depth and nuance of a real teammate.",
    gradient: "from-primary/10 to-blue-100",
    iconColor: "text-primary",
    accentColor: "text-primary",
    featured: true,
  },
  {
    icon: Network,
    title: "Unified Workspace",
    subtitle: "COLLABORATIVE",
    description:
      "All AI employees work together in one workspace. Every agent shares context, communicates seamlessly, and connects to 90+ tools—automate work without the chaos of disconnected apps.",
    gradient: "from-purple-100 to-violet-100",
    iconColor: "text-purple-600",
    accentColor: "text-purple-600",
  },
];

export const OurSolutionSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      {/* Section label (cols 1-4) */}
      <motion.div 
        variants={fadeInUp} 
        initial="hidden" 
        animate="visible" 
        className="col-span-12 md:col-span-4"
      >
        <span className="pitch-label text-primary">Our Solution</span>
      </motion.div>

      {/* H1 (cols 1-9) */}
      <motion.h2 
        variants={fadeInUp} 
        initial="hidden" 
        animate="visible" 
        className="col-span-12 md:col-span-9 pitch-h1"
      >
        Meet{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Elixa</span>:
        Your company, staffed with AI.
      </motion.h2>

      {/* Intro line (cols 1-10) */}
      <motion.p 
        variants={fadeInUp} 
        initial="hidden" 
        animate="visible" 
        className="col-span-12 md:col-span-10 pitch-body"
      >
        A marketplace of real AI employees, each created by specialist developers, trained for a specific business role, 
        and ready to work together in a unified, fully connected workspace.
      </motion.p>

      {/* 3 pillar cards (cols 1-4, 5-8, 9-12) */}
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="visible" 
        className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            className={`pitch-card transition-all duration-300 hover:shadow-xl ${
              pillar.featured
                ? 'border-2 border-primary/30 shadow-primary/10 hover:shadow-primary/20'
                : 'hover:shadow-slate-200/70'
            }`}
          >
            {/* Subtitle Badge */}
            <div className={`text-xs font-bold uppercase tracking-widest ${pillar.accentColor} mb-3`}>
              {pillar.subtitle}
            </div>

            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4`}
            >
              <pillar.icon className={`w-7 h-7 ${pillar.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom value strip (cols 1-12) */}
      <motion.div 
        variants={fadeInUp} 
        initial="hidden" 
        animate="visible" 
        className="col-span-12"
      >
        <div className="pitch-card bg-gradient-to-r from-primary/5 via-purple-50/50 to-primary/5 border-primary/20 text-center">
          <p className="text-xl md:text-2xl font-semibold text-slate-800">
            AI employees that <span className="text-primary">think</span>,{" "}
            <span className="text-purple-600">remember</span>, and <span className="text-blue-600">execute</span>—
            <span className="text-slate-600 font-normal">built for the way you actually work.</span>
          </p>
        </div>
      </motion.div>
    </SlideShell>
  );
};
