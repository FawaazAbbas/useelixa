import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Users, TrendingDown, PoundSterling, AlertTriangle } from "lucide-react";

const painPoints = [
  { 
    icon: Users, 
    value: "46%", 
    emotionalLabel: "Burning out from wearing every hat",
    context: "of smallest UK businesses report burnout from handling too many roles themselves"
  },
  { 
    icon: TrendingDown, 
    value: "32%", 
    emotionalLabel: "Too busy to grow",
    context: "can't hire or expand because they're drowning in operational duties"
  },
  { 
    icon: PoundSterling, 
    value: "£30,800", 
    emotionalLabel: "The cost of one hire",
    context: "average UK salary—before NI, pension, and recruitment costs"
  },
];

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
            className="text-center mb-4"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest font-medium">The Challenge</span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Founders are stretched thin{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                managing every part of the business
              </span>
            </h2>
          </motion.div>

          {/* Story Paragraph */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              Most founders start without a team—taking on marketing, finance, operations, customer support, 
              and legal matters alone. Each function demands new tools and processes. With limited capital, 
              hiring specialists isn't an option. So founders spend their energy on daily tasks instead of 
              strategy and growth, making it harder to move the business forward.
            </p>
          </motion.div>

          {/* Pain Point Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center group hover:shadow-xl hover:border-orange-200 transition-all duration-300"
              >
                {/* Emotional Label */}
                <p className="text-orange-600 font-medium text-sm mb-3 uppercase tracking-wide">
                  {point.emotionalLabel}
                </p>
                
                {/* Icon + Stat */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <point.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-slate-900">{point.value}</div>
                </div>
                
                {/* Context */}
                <p className="text-slate-500 text-sm leading-relaxed">{point.context}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* The Vicious Cycle Callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">The Vicious Cycle</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Without help, you work harder. Working harder leads to burnout. 
                    Burnout kills growth. And the cycle continues—leaving founders trapped 
                    between <span className="font-semibold">needing support</span> and <span className="font-semibold">not being able to afford it</span>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
