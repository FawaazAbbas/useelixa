import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { Rocket, Code, Store, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

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
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * target));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [hasAnimated, target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const TractionRoadmapSlide = () => {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(demandStats.progress), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pitch-slide pitch-slide-traction-roadmap">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/20 to-slate-50" />
      
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Main Grid: Narrative Left, Evidence Right */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: The Narrative (3 cols) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3 space-y-8"
            >
              <div>
                <span className="text-teal-600 text-sm uppercase tracking-widest font-medium mb-4 block">
                  The Journey
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  From First Signup<br />to First Million
                </h2>
              </div>

              {/* Narrative Paragraphs */}
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed max-w-xl">
                <p>
                  Before we wrote a single line of code, we tested the market. We put up a simple 
                  landing page and asked founders one question: <em className="text-slate-800">"Would you 
                  trust AI to run parts of your business?"</em>
                </p>
                <p>
                  The response was immediate. Within weeks, <span className="font-semibold text-slate-900">
                  thousands of founders</span> had raised their hands—not just curious, but eager. 
                  That signal gave us the confidence to go all-in.
                </p>
              </div>

              {/* Inline Stat with Progress */}
              <motion.div
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 max-w-md"
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-slate-900">
                    <AnimatedCounter target={demandStats.current} />+
                  </span>
                  <span className="text-slate-500">signups in weeks</span>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={progressValue} 
                    className="h-2 bg-slate-100"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{demandStats.startDate}</span>
                    <span className="text-teal-600 font-medium">10K by {demandStats.targetDate}</span>
                  </div>
                </div>
              </motion.div>

              {/* Closing line */}
              <p className="text-slate-500 italic border-l-2 border-teal-300 pl-4">
                "The demand is real. The timeline is aggressive. And we're executing exactly on schedule."
              </p>
            </motion.div>

            {/* Right Column: The Roadmap (2 cols) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                <span className="text-teal-600 text-xs uppercase tracking-widest font-semibold mb-6 block">
                  The Roadmap
                </span>

                {/* Vertical Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-400 via-purple-400 via-blue-400 to-green-400" />
                  
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {milestones.map((milestone, index) => {
                      const IconComponent = milestone.icon;
                      return (
                        <motion.div
                          key={index}
                          variants={scaleIn}
                          className="relative pl-10"
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${colorClasses[milestone.color as keyof typeof colorClasses]} flex items-center justify-center border-2 border-white shadow-sm`}>
                            <IconComponent className="w-3 h-3" />
                          </div>
                          
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-slate-900">
                                {milestone.title}
                              </h4>
                              <span className="text-xs text-slate-400 font-medium">
                                {milestone.date}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {milestone.detail}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
