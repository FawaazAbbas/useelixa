import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Users, TrendingDown, PoundSterling, AlertTriangle } from "lucide-react";

const painPoints = [
  { 
    icon: Users, 
    statValue: "46%",
    statContext: "of small business owners",
    headline: "report burnout",
    detail: "Nearly half of UK businesses with 1-9 employees say they're burning out from wearing every hat."
  },
  { 
    icon: TrendingDown, 
    statValue: "32%",
    statContext: "can't grow because",
    headline: "they're too busy",
    detail: "Nearly 1 in 3 owners say daily operations prevent them from hiring or expanding."
  },
  { 
    icon: PoundSterling, 
    statValue: "£30,800",
    statContext: "to hire just",
    headline: "one employee",
    detail: "The average UK salary—before NI, pension, and recruitment costs."
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

          {/* Pain Point Cards - Redesigned with inline contextual stats */}
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
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 group hover:shadow-xl hover:border-orange-200 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-orange-500" />
                </div>
                
                {/* Inline Contextual Stat - Sentence Style */}
                <div className="mb-3">
                  <p className="text-lg md:text-xl leading-snug">
                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {point.statValue}
                    </span>{" "}
                    <span className="text-slate-700 font-medium">
                      {point.statContext}
                    </span>
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-slate-900 mt-1">
                    {point.headline}
                  </p>
                </div>
                
                {/* Detail */}
                <p className="text-slate-500 text-sm leading-relaxed">{point.detail}</p>
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
