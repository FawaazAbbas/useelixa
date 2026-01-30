import { motion } from "framer-motion";
import { fadeInUp, slideInRight, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingDown, Clock, DollarSign } from "lucide-react";

const stats = [
  { icon: DollarSign, value: "£39,039", label: "Cost of ONE employee/year" },
  { icon: Clock, value: "24 days", label: "Lost to admin per year" },
  { icon: TrendingDown, value: "10-30%", label: "Software budget wasted" },
];

export const ProblemSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Light background with warm accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/30 to-slate-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-100/40 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest mb-4 block font-medium">The Problem</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              The primary struggle is dealing with{" "}
              <span className="text-orange-500">cost</span>
            </h2>
          </motion.div>

          {/* Story Text */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-10"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              Many SMEs and solo entrepreneurs lack sufficient funds to sustain their business or cover marketing expenses. 
              The expense of hiring a new employee—paying another salary—is often simply unaffordable.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={slideInRight}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-lg shadow-slate-200/50"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-slate-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Insight Callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-6">
              <p className="text-base md:text-lg text-slate-700 italic">
                <span className="font-semibold not-italic text-slate-900">The core issue:</span> Lack of funds to implement better solutions, 
                hire employees to streamline processes, and insufficient capacity to produce better outcomes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
