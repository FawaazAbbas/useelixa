import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Bot, Code, Wrench, Sparkles } from "lucide-react";

const competitors = [
  {
    icon: Code,
    name: "Private Developers",
    price: "£500+",
    caption: "Expensive",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: Wrench,
    name: "N8N",
    price: "£24/month",
    caption: "DIY solution",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: Sparkles,
    name: "Motion",
    price: "£35/month",
    caption: "Not very smart",
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
];

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="max-w-6xl w-full text-center">
          {/* Question */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">The Promise</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              The solution?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                AI employees
              </span>
            </h2>
          </motion.div>

          {/* But... */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <p className="text-2xl md:text-3xl text-slate-500">But where are they? What are the options?</p>
          </motion.div>

          {/* Competitor comparison boxes */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {competitors.map((comp, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`${comp.bgColor} border ${comp.borderColor} rounded-2xl p-6 text-center shadow-lg`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${comp.bgColor} flex items-center justify-center mx-auto mb-4 border ${comp.borderColor}`}
                >
                  <comp.icon className={`w-6 h-6 ${comp.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{comp.name}</h3>
                <div className={`text-3xl font-bold ${comp.color} mb-2`}>{comp.price}</div>
                <p className="text-slate-500 text-sm italic">"{comp.caption}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
