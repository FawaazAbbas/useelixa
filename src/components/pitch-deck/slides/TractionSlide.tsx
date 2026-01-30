import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingUp, Users, Zap, Calendar, Lightbulb } from "lucide-react";

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
  { icon: Zap, label: "MVP Live", value: "Jan 2025", done: true, subtitle: "Platform launched", story: "Core workspace with AI chat ready" },
  { icon: Users, label: "Beta Users", value: "500+", done: true, subtitle: "Early adopters", story: "Testing with real SME customers" },
  { icon: TrendingUp, label: "Target Signups", value: "10,000", done: false, subtitle: "Growth goal", story: "Building toward scale" },
  { icon: Calendar, label: "Target Date", value: "Aug 2025", done: false, subtitle: "Scale milestone", story: "8 months to reach 10k users" },
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
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-6"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-semibold">Traction</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Where We Are Today
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
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              We've gone from idea to working MVP in just 6 months. Our platform is live, 
              early users are onboarded, and we're now focused on scaling to our first 10,000 customers.
            </p>
          </motion.div>

          {/* Big numbers row */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-10"
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
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`bg-white border rounded-2xl p-5 shadow-lg shadow-slate-200/50 text-left ${
                  milestone.done ? 'border-teal-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    milestone.done ? 'bg-teal-100' : 'bg-slate-100'
                  }`}>
                    <milestone.icon className={`w-5 h-5 ${milestone.done ? 'text-teal-600' : 'text-slate-400'}`} />
                  </div>
                  {milestone.done && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Done
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-slate-900 mb-0.5">{milestone.value}</div>
                <div className="text-sm font-medium text-slate-700 mb-1">{milestone.label}</div>
                <div className="text-xs text-slate-500">{milestone.story}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Journey Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mt-10"
          >
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-5 flex gap-4">
              <Lightbulb className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-semibold text-slate-900">The journey so far:</span> From concept to MVP in 6 months. 
                  Now laser-focused on reaching 10k users and proving product-market fit with Shopify merchants.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
