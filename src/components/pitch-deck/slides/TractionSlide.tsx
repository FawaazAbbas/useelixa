import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Rocket, Users, Calendar, TrendingUp, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AnimatedProgress = ({ end, delay = 0 }: { end: number; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        let start = 0;
        const increment = end / 60;
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setProgress(end);
            clearInterval(timer);
          } else {
            setProgress(start);
          }
        }, 1000 / 60);
        return () => clearInterval(timer);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, end, delay]);

  return <span ref={ref}>{Math.floor(progress).toLocaleString()}</span>;
};

const timelineSteps = [
  { month: "Nov", label: "Development Starts", done: true, icon: Rocket },
  { month: "Dec", label: "Waitlist Launched", done: true, icon: Users },
  { month: "Feb", label: "Beta Testing", done: false, icon: TrendingUp },
  { month: "Mar", label: "Launch Ready", done: false, icon: Calendar },
];

const metrics = [
  { value: 3500, suffix: "+", label: "Waitlist Signups", gradient: "from-teal-500 to-blue-500" },
  { value: 5, suffix: "", label: "Months to MVP", gradient: "from-blue-500 to-purple-500" },
  { value: "Mar", suffix: "", label: "Launch Target", gradient: "from-purple-500 to-pink-500", isText: true },
];

export const TractionSlide = () => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true });
  const [waitlistProgress, setWaitlistProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setWaitlistProgress(35);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section className="pitch-slide pitch-slide-traction">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/40 to-slate-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-5xl w-full text-center">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-10"
          >
            <span className="inline-block text-teal-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Traction
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Where We Are Today
            </h2>
          </motion.div>

          {/* Waitlist Progress Bar */}
          <motion.div
            ref={progressRef}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="font-semibold text-slate-900">Waitlist Momentum</span>
                </div>
                <span className="text-sm text-slate-500">Target: <span className="font-bold text-teal-600">10K</span></span>
              </div>
              
              <div className="relative">
                <Progress value={waitlistProgress} className="h-4 bg-slate-100" />
                <div className="flex justify-between mt-3 text-sm">
                  <div className="text-slate-500">
                    <span className="font-medium">Dec</span>
                    <span className="text-xs block">Started</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-teal-600 text-xl">
                      <AnimatedProgress end={3500} delay={500} />+
                    </span>
                    <span className="text-xs block text-slate-500">Current signups</span>
                  </div>
                  <div className="text-right text-slate-500">
                    <span className="font-medium">Mar</span>
                    <span className="text-xs block">10K Target</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Development Timeline */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900">MVP Development Timeline</span>
              </div>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                {/* Timeline steps */}
                <div className="grid grid-cols-4 gap-4 relative">
                  {timelineSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ${
                        step.done 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold mt-3 ${step.done ? 'text-teal-600' : 'text-slate-400'}`}>
                        {step.month}
                      </span>
                      <span className="text-xs text-slate-500 text-center mt-1">{step.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Narrative */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-2xl p-6">
              <p className="text-lg text-slate-700 leading-relaxed italic">
                "In less than a month, thousands of businesses have raised their hands for Elixa. 
                While demand surges, our MVP—started in November—is racing toward launch in March. 
                <span className="font-semibold text-teal-700 not-italic"> Market need and execution are moving in sync.</span>"
              </p>
            </div>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {metrics.map((metric, index) => (
              <motion.div key={index} variants={scaleIn} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${metric.gradient}`}>
                  {metric.isText ? metric.value : <AnimatedProgress end={metric.value as number} />}{metric.suffix}
                </div>
                <p className="text-sm text-slate-500 mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
