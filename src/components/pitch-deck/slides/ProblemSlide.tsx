import { motion } from "framer-motion";
import { fadeInUp, slideInRight, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { TrendingDown, Clock, DollarSign, AlertTriangle, ArrowDown } from "lucide-react";

const painPoints = [
  { 
    icon: DollarSign, 
    value: "£39,039", 
    emotionalLabel: "The salary you can't afford",
    context: "Average UK employee cost per year"
  },
  { 
    icon: Clock, 
    value: "24 days", 
    emotionalLabel: "Time stolen from growth",
    context: "Lost to admin tasks annually"
  },
  { 
    icon: TrendingDown, 
    value: "10-30%", 
    emotionalLabel: "Money bleeding away",
    context: "Wasted on unused software"
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
          {/* Hook Question */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest mb-4 block font-medium">The Challenge</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              What if running your business costs{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                more than you realize?
              </span>
            </h2>
          </motion.div>

          {/* Story Lead */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              Every day, SME owners wake up to the same harsh reality: there's too much to do, 
              not enough time, and definitely not enough money to hire the help they desperately need.
            </p>
          </motion.div>

          {/* Emotional Pain Points */}
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
                <p className="text-slate-500 text-sm">{point.context}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* The Vicious Cycle */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">The Vicious Cycle</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Without help, you work harder. Working harder burns you out. 
                    Burnout kills growth. And the cycle continues—leaving you trapped 
                    between <span className="font-semibold">needing help</span> and <span className="font-semibold">not affording it</span>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Insight Callout */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900 rounded-2xl p-6 text-center">
              <p className="text-white text-lg md:text-xl font-medium">
                <span className="text-orange-400">The cruel irony:</span> You can't afford to get help, 
                but you can't afford <span className="italic">not</span> to get help.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
