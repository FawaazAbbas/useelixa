import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { AnimatedCounter } from "../AnimatedCounter";
import { Rocket, Code, Store, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const demandStats = {
  current: 3500,
  target: 10000,
  progress: 35,
};

const milestones = [
  { date: "Mar '25", title: "Soft Launch", detail: "First paying customers", icon: Rocket, color: "teal" },
  { date: "Apr '25", title: "Developer Program", detail: "Devs invited to build", icon: Code, color: "purple" },
  { date: "May '25", title: "AI Marketplace", detail: "£50k ARR", icon: Store, color: "blue" },
  { date: "Aug '25", title: "Scale", detail: "10K users • £250k ARR", icon: TrendingUp, color: "green" },
];

const colorClasses = {
  teal: "bg-teal-100 text-teal-600",
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
};

export const TractionRoadmapSlide = () => {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(demandStats.progress), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute " />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-teal-600">The Journey</span>
      </motion.div>

      {/* H1 (cols 1-9) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-12 pitch-h1">
        From First Signup to First Million
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-9 pitch-body">
        Before writing code, we tested the market. The response was immediate.
      </motion.p>

      {/* Left column - Story + Traction (cols 1-7) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-7 space-y-4"
      >
        {/* Story card */}
        <div className="pitch-card">
          <p className="text-base text-slate-600 leading-relaxed">
            We put up a simple landing page and asked founders:{" "}
            <em className="text-slate-800">"Would you trust AI to run parts of your business?"</em> Within weeks,{" "}
            <span className="font-semibold text-slate-900">thousands of founders</span> had raised their hands.
          </p>
        </div>

        {/* Traction card */}
        <div className="pitch-card">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-slate-900">
              <AnimatedCounter end={demandStats.current} delay={800} />+
            </span>
            <span className="text-slate-500">signups in weeks</span>
          </div>
          <div className="space-y-2">
            <Progress value={progressValue} className="h-2 bg-slate-100" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Dec '24</span>
              <span className="text-teal-600 font-medium">10K by Mar '25</span>
            </div>
          </div>
        </div>

        {/* Quote card */}
        <div className="pitch-card border-l-4 border-teal-300 bg-slate-50">
          <p className="text-slate-500 italic text-sm">
            "The demand is real. The timeline is aggressive. And we're executing exactly on schedule."
          </p>
        </div>
      </motion.div>

      {/* Right column - Roadmap timeline (cols 8-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-5">
        <div className="pitch-card h-full">
          <span className="pitch-label text-teal-600 mb-4 block">The Roadmap</span>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-400 via-purple-400 via-blue-400 to-green-400" />

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              {milestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                return (
                  <motion.div key={index} variants={scaleIn} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full ${colorClasses[milestone.color as keyof typeof colorClasses]} flex items-center justify-center border-2 border-white shadow-sm`}
                    >
                      <IconComponent className="w-3 h-3" />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{milestone.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{milestone.date}</span>
                      </div>
                      <p className="text-xs text-slate-600">{milestone.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </SlideShell>
  );
};
