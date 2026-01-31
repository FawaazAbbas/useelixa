import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Rocket, Users, Calendar, TrendingUp } from "lucide-react";
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

export const TractionSlide = () => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true });
  const [waitlistProgress, setWaitlistProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setWaitlistProgress(35); // Representing current progress toward 10K
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

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
            className="mb-8"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-semibold">Traction</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-900">Waitlist Momentum</span>
                </div>
                <span className="text-sm text-slate-500">Target: <span className="font-bold text-teal-600">10K</span></span>
              </div>
              
              <div className="relative">
                <Progress value={waitlistProgress} className="h-4 bg-slate-100" />
                <div className="flex justify-between mt-2 text-sm">
                  <div className="text-slate-500">
                    <span className="font-medium">Dec</span>
                    <span className="text-xs block">Started</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-teal-600 text-lg">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-5">
                <Rocket className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">MVP Development Timeline</span>
              </div>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 rounded-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                {/* Timeline steps */}
                <div className="grid grid-cols-4 gap-2 relative">
                  {timelineSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        step.done 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className={`font-bold mt-2 ${step.done ? 'text-teal-600' : 'text-slate-400'}`}>
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
            className="max-w-3xl mx-auto"
          >
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-6">
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed italic">
                "In less than a month, thousands of businesses have raised their hands for Elixa. 
                While demand surges, our MVP—started in November—is racing toward launch in March. 
                <span className="font-semibold text-teal-700 not-italic"> Market need and execution are moving in sync.</span>"
              </p>
            </div>
          </motion.div>

          {/* Key metrics row */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto"
          >
            <motion.div variants={scaleIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                <AnimatedProgress end={3500} />+
              </div>
              <p className="text-sm text-slate-500 mt-1">Waitlist Signups</p>
            </motion.div>
            <motion.div variants={scaleIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                5
              </div>
              <p className="text-sm text-slate-500 mt-1">Months to MVP</p>
            </motion.div>
            <motion.div variants={scaleIn} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Mar
              </div>
              <p className="text-sm text-slate-500 mt-1">Launch Target</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
