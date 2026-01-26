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
  { icon: Zap, label: "MVP Live", value: "Jan 2025", done: true },
  { icon: Users, label: "Beta Users", value: "500+", done: true },
  { icon: TrendingUp, label: "Projected Signups", value: "10,000", done: false },
  { icon: Calendar, label: "Target Date", value: "Feb 2025", done: false },
];

export const TractionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-traction">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(180,30%,8%)] to-[hsl(240,30%,8%)]" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
      
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
            <span className="text-teal-400 text-sm uppercase tracking-widest mb-4 block">Traction</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Growing Fast
            </h2>
          </motion.div>

          {/* Big number */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-16"
          >
            <div className="inline-block">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                <AnimatedCounter end={10000} />
              </div>
              <p className="text-2xl text-muted-foreground mt-4">
                Projected signups by <span className="text-white font-semibold">February 2025</span>
              </p>
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
                className={`bg-white/5 border rounded-2xl p-6 ${
                  milestone.done ? 'border-teal-500/30' : 'border-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  milestone.done ? 'bg-teal-500/20' : 'bg-white/10'
                }`}>
                  <milestone.icon className={`w-6 h-6 ${milestone.done ? 'text-teal-400' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-xl font-bold text-white mb-1">{milestone.value}</div>
                <div className="text-sm text-muted-foreground">{milestone.label}</div>
                {milestone.done && (
                  <span className="inline-block mt-2 text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                    ✓ Complete
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
