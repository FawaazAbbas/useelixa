import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Calendar, Rocket, Users, Code, Layers, Target } from "lucide-react";

const milestones = [
  {
    month: "Jan 2025",
    title: "Foundational Workspace",
    description: "Core platform development",
    icon: Layers,
    color: "bg-slate-500",
  },
  {
    month: "Feb",
    title: "90+ Integrations",
    description: "Onboard minimum integrations",
    icon: Code,
    color: "bg-blue-500",
  },
  {
    month: "Mar",
    title: "Soft Launch",
    description: "Invite early users",
    icon: Rocket,
    color: "bg-teal-500",
    arr: "First Revenue",
  },
  {
    month: "Mar",
    title: "Developer Program",
    description: "Invite developers to build",
    icon: Code,
    color: "bg-purple-500",
  },
  {
    month: "May",
    title: "AI Employee Section",
    description: "Launch talent pool",
    icon: Users,
    color: "bg-primary",
    arr: "£50k ARR",
  },
  {
    month: "Aug",
    title: "10k Users",
    description: "Scale milestone",
    icon: Target,
    color: "bg-green-500",
    arr: "£250k ARR",
  },
];

export const RevenueSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-revenue">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="text-green-600 text-sm uppercase tracking-widest mb-4 block font-medium">Roadmap</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Timeline & Projections
            </h2>
            <p className="text-xl text-slate-500">Our path from development to 10k users</p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 hidden md:block"></div>
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-primary to-green-500 hidden md:block"></div>
            
            {/* Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className={`w-16 h-16 rounded-full ${milestone.color} flex items-center justify-center shadow-lg mb-3 relative z-10`}>
                    <milestone.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Month badge */}
                  <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    {milestone.month}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{milestone.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{milestone.description}</p>
                  
                  {/* ARR Badge */}
                  {milestone.arr && (
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      {milestone.arr}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ARR Projection Summary */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">ARR Projection</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-slate-500 mb-1">Mar (Launch)</div>
                <div className="text-2xl font-bold text-slate-900">First Revenue</div>
                <div className="text-xs text-slate-400">Early adopters</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">May (AI Employees)</div>
                <div className="text-2xl font-bold text-primary">£50k ARR</div>
                <div className="text-xs text-slate-400">~350 paying users</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Aug (Scale)</div>
                <div className="text-2xl font-bold text-green-600">£250k ARR</div>
                <div className="text-xs text-slate-400">10k users @ ~£25/mo avg</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
