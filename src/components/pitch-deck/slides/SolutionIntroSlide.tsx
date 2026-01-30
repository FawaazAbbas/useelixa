import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Code, XCircle, Sparkles } from "lucide-react";

const competitors = [
  {
    name: "Private Developers",
    price: "£500+",
    verdict: "TOO EXPENSIVE",
    verdictColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: Code,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    failure: "At £500+ per agent, they're building tools for the rich. The businesses who need help most can't afford them.",
  },
  {
    name: "N8N",
    price: "£24/month",
    verdict: "TOO TECHNICAL",
    verdictColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    logo: "/logos/n8nLogo.png",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    failure: "A brilliant tool... if you're a developer. But most founders aren't. They came to build businesses, not write code.",
  },
  {
    name: "Motion",
    price: "£35/month",
    verdict: "TOO GENERIC",
    verdictColor: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    logo: "/logos/MotionLogo.png",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    failure: "Generic AI that treats every business the same. Your bookkeeper and your marketer can't be the same 'AI assistant.'",
  },
];

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="max-w-6xl w-full">
          {/* The Promise with Doubt */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-4"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">The Promise</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              AI employees were supposed to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                change everything
              </span>
            </h2>
          </motion.div>

          {/* The But... */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              But the options available today? They all fail in different ways.
            </p>
          </motion.div>

          {/* Competitor Failure Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8"
          >
            {competitors.map((comp, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`${comp.bgColor} border-2 ${comp.borderColor} rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden`}
              >
                {/* X Mark */}
                <div className="absolute top-3 right-3">
                  <XCircle className={`w-6 h-6 ${comp.verdictColor} opacity-50`} />
                </div>

                {/* Logo or Icon */}
                <div className="h-12 flex items-center justify-start mb-4">
                  {comp.logo ? (
                    <img src={comp.logo} alt={`${comp.name} logo`} className="h-8 w-auto object-contain" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl ${comp.iconBg} flex items-center justify-center`}>
                      <comp.icon className={`w-5 h-5 ${comp.iconColor}`} />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-1">{comp.name}</h3>
                <div className={`text-2xl font-bold ${comp.verdictColor} mb-2`}>{comp.price}</div>

                {/* Verdict badge */}
                <div className={`${comp.bgColor} border ${comp.borderColor} rounded-lg py-1.5 px-3 inline-block mb-4 w-fit`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${comp.verdictColor}`}>{comp.verdict}</p>
                </div>

                {/* Failure narrative */}
                <p className="text-sm text-slate-600 leading-relaxed mt-auto">
                  {comp.failure}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Transition Question */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-teal-500" />
              </div>
              <p className="text-xl md:text-2xl font-semibold text-slate-900">
                What if AI employees could be{" "}
                <span className="text-teal-600">affordable</span>, require{" "}
                <span className="text-blue-600">no technical skills</span>, AND be{" "}
                <span className="text-purple-600">specialized</span> for your exact needs?
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
