import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Rocket, Users, Target, Code, TrendingUp, ArrowDown } from "lucide-react";

const AnimatedCounter = ({ end, suffix = "", delay = 0 }: { end: number; suffix?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        let start = 0;
        const increment = end / 40;
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 25);
        return () => clearInterval(timer);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, end, delay]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const statCards = [
  { value: 3500, suffix: "+", label: "Waitlist Signups", icon: Users, color: "from-teal-500 to-emerald-500" },
  { value: 50, suffix: "%", label: "MVP Complete", icon: Code, color: "from-blue-500 to-cyan-500" },
  { value: 0, suffix: "Mar", label: "Launch Target", icon: Rocket, color: "from-purple-500 to-pink-500", isText: true },
];

const milestones = [
  { month: "Mar", title: "Soft Launch", subtitle: "First Revenue", icon: Rocket, done: false },
  { month: "Apr", title: "Dev Program", subtitle: "Marketplace Opens", icon: Code, done: false },
  { month: "May", title: "AI Employees", subtitle: "£50k ARR", icon: Users, done: false },
  { month: "Aug", title: "Scale", subtitle: "10K Users • £250k ARR", icon: Target, done: false },
];

export const TractionRoadmapSlide = () => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true });
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setProgressWidth(35), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section className="pitch-slide pitch-slide-traction-roadmap">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/40" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-2 block font-semibold">
              Traction & Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              From Early Momentum to Market Leadership
            </h2>
          </motion.div>

          {/* Section 1: Where We Are */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-4"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Where We Are</h3>
              </div>

              {/* Stat Cards */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                className="grid grid-cols-3 gap-3 mb-4"
              >
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-xl p-4 text-center"
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-slate-900">
                      {stat.isText ? (
                        <span>Mar</span>
                      ) : (
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} delay={index * 100} />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress Bar */}
              <div ref={progressRef} className="relative">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-medium">Dec</span>
                  <span className="text-teal-600 font-bold">Waitlist Progress</span>
                  <span className="font-medium">10K Target</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressWidth}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual Connector */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="flex justify-center mb-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <ArrowDown className="w-5 h-5 text-white" />
            </div>
          </motion.div>

          {/* Section 2: Where We're Going */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-4"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Where We're Going</h3>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-slate-200 rounded-full hidden md:block">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "0%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </div>

                {/* Milestone Nodes */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={defaultViewport}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="flex flex-col items-center text-center"
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                        index === 0 ? 'from-teal-500 to-teal-600' :
                        index === 1 ? 'from-emerald-500 to-emerald-600' :
                        index === 2 ? 'from-green-500 to-green-600' :
                        'from-lime-500 to-lime-600'
                      } flex items-center justify-center shadow-lg mb-2 relative z-10`}>
                        <milestone.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                        {milestone.month} '25
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{milestone.title}</h4>
                      <p className="text-xs text-slate-500">{milestone.subtitle}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Narrative */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-r-xl p-4">
              <p className="text-base md:text-lg text-slate-700 leading-relaxed italic">
                "In less than a month, thousands of businesses raised their hands for Elixa. 
                With each milestone building on the last, we're moving from MVP to market leadership 
                with <span className="font-semibold text-teal-700 not-italic">proven product-market fit.</span>"
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
