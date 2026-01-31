import { motion, useInView } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Rocket, Code, Store, TrendingUp, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRef, useEffect, useState } from "react";

const demandStats = {
  current: 3500,
  target: 10000,
  startDate: "Dec '24",
  targetDate: "Mar '25",
  progress: 35
};

const milestones = [
  { 
    date: "Mar '25", 
    title: "Soft Launch", 
    detail: "First paying customers",
    icon: Rocket,
    color: "teal"
  },
  { 
    date: "Apr '25", 
    title: "Developer Program", 
    detail: "Devs invited to build",
    icon: Code,
    color: "purple"
  },
  { 
    date: "May '25", 
    title: "AI Marketplace", 
    detail: "£50k ARR",
    icon: Store,
    color: "blue"
  },
  { 
    date: "Aug '25", 
    title: "Scale", 
    detail: "10K users • £250k ARR",
    icon: TrendingUp,
    color: "green"
  },
];

const colorClasses = {
  teal: "bg-teal-100 text-teal-600",
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
};

const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export const TractionRoadmapSlide = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  const isProgressInView = useInView(progressRef, { once: true });
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (isProgressInView) {
      const timer = setTimeout(() => setProgressValue(demandStats.progress), 300);
      return () => clearTimeout(timer);
    }
  }, [isProgressInView]);

  return (
    <section className="pitch-slide pitch-slide-traction-roadmap">
      {/* Background gradient matching deck style */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />
      
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-20 py-16">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Header Section */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest font-medium mb-4 block">
              The Journey
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
              From First Signup to First Million
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Before we wrote a single line of code, we tested the market. We put up a simple landing page 
              and asked founders one question: <em>"Would you trust AI to run parts of your business?"</em> 
              The response was immediate. Within weeks, thousands of founders had raised their hands—not 
              just curious, but eager. That signal gave us the confidence to go all-in on building 
              the platform they were asking for.
            </p>
          </motion.div>

          {/* Two-Column Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            
            {/* Left: The Signal Card */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50"
            >
              <span className="text-teal-600 text-xs uppercase tracking-widest font-semibold mb-6 block">
                The Signal
              </span>
              
              <p className="text-slate-700 text-lg mb-6 italic">
                "We launched a waitlist in December."
              </p>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl md:text-6xl font-bold text-slate-900">
                  <AnimatedCounter target={demandStats.current} />+
                </span>
                <span className="text-slate-600 text-lg">businesses signed up</span>
              </div>

              {/* Progress Bar Section */}
              <div ref={progressRef} className="space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{demandStats.startDate}</span>
                  <span className="font-medium text-teal-600">10K by {demandStats.targetDate}</span>
                </div>
                <Progress 
                  value={progressValue} 
                  className="h-3 bg-slate-100"
                />
                <p className="text-sm text-slate-500">
                  On track to reach <span className="font-semibold text-slate-700">10,000 signups</span> by launch
                </p>
              </div>
            </motion.div>

            {/* Right: The Path Timeline */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50"
            >
              <span className="text-teal-600 text-xs uppercase tracking-widest font-semibold mb-6 block">
                The Path
              </span>

              {/* Horizontal Timeline Line */}
              <div className="relative mb-6">
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200" />
                <div className="flex justify-between relative">
                  {milestones.map((_, index) => (
                    <div 
                      key={index}
                      className="w-6 h-6 rounded-full bg-teal-500 border-4 border-white shadow-md z-10"
                    />
                  ))}
                </div>
              </div>

              {/* Milestone Cards */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                className="grid grid-cols-2 gap-4"
              >
                {milestones.map((milestone, index) => {
                  const IconComponent = milestone.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className={`w-8 h-8 rounded-lg ${colorClasses[milestone.color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium block mb-1">
                        {milestone.date}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {milestone.detail}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>

          {/* Insight Callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-slate-700 text-lg leading-relaxed">
              "The demand is real. The timeline is aggressive. 
              And we're executing exactly on schedule."
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
