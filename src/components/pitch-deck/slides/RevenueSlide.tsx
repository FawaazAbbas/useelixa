import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { TrendingUp, Users, DollarSign, Repeat } from "lucide-react";

const AnimatedCounter = ({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / 120;
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const projections = [
  { year: "Year 1", arr: 250, users: 5000 },
  { year: "Year 2", arr: 1200, users: 25000 },
  { year: "Year 3", arr: 5000, users: 100000 },
];

export const RevenueSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-revenue">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-12"
          >
            <span className="text-green-600 text-sm uppercase tracking-widest mb-4 block font-medium">Revenue Model</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Business Model
            </h2>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">£14.99</div>
              <div className="text-slate-500 text-sm">ARPU/month</div>
            </motion.div>
            <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50">
              <Repeat className="w-8 h-8 text-teal-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">95%</div>
              <div className="text-slate-500 text-sm">Target Retention</div>
            </motion.div>
            <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">3:1</div>
              <div className="text-slate-500 text-sm">LTV:CAC Ratio</div>
            </motion.div>
            <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">70%</div>
              <div className="text-slate-500 text-sm">Gross Margin</div>
            </motion.div>
          </motion.div>

          {/* Projections */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50"
          >
            <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">ARR Projections (£k)</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {projections.map((proj, index) => (
                <div key={index} className="text-center">
                  <div className="text-slate-500 mb-2">{proj.year}</div>
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    £<AnimatedCounter end={proj.arr} suffix="k" />
                  </div>
                  <div className="text-sm text-slate-500">
                    <AnimatedCounter end={proj.users} /> users
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
