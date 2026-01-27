import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingUp, Users, Zap, Calendar } from "lucide-react";

const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
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

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const milestones = [
  { icon: Zap, label: "MVP Live", value: "Jan 2025", done: true, subtitle: "Platform launched" },
  { icon: Users, label: "Beta Users", value: "500+", done: true, subtitle: "Early adopters" },
  { icon: TrendingUp, label: "Target Signups", value: "10,000", done: false, subtitle: "Growth goal" },
  { icon: Calendar, label: "Target Date", value: "Aug 2025", done: false, subtitle: "Scale milestone" },
];

export const TractionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-traction">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/40 to-slate-50" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-5xl w-full text-center">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">Traction</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
              Growing Fast
            </h2>
          </motion.div>

          {/* Big numbers row */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {/* Main number */}
              <div className="text-center">
                <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                  <AnimatedCounter end={10000} />
                </div>
                <p className="text-lg text-slate-500 mt-2">
                  Target users by <span className="text-slate-900 font-semibold">August 2025</span>
                </p>
              </div>
              
              {/* Secondary metric */}
              <div className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
                  £<AnimatedCounter end={250} />k
                </div>
                <p className="text-lg text-slate-500 mt-2">
                  Target <span className="text-slate-900 font-semibold">ARR</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`bg-white border rounded-2xl p-5 shadow-lg shadow-slate-200/50 ${
                  milestone.done ? 'border-teal-300' : 'border-slate-200'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  milestone.done ? 'bg-teal-100' : 'bg-slate-100'
                }`}>
                  <milestone.icon className={`w-5 h-5 ${milestone.done ? 'text-teal-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-0.5">{milestone.value}</div>
                <div className="text-sm font-medium text-slate-700">{milestone.label}</div>
                <div className="text-xs text-slate-400 mb-2">{milestone.subtitle}</div>
                {milestone.done && (
                  <span className="inline-block text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    ✓ Done
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
