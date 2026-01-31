import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Calendar, Rocket, Users, Code, Layers, Target, Lightbulb } from "lucide-react";

const milestones = [
  {
    month: "Jan",
    year: "2025",
    title: "Workspace MVP",
    description: "Core platform ready",
    icon: Layers,
    color: "bg-slate-500",
    done: true,
    story: "Foundational workspace with AI chat, notes, and integrations"
  },
  {
    month: "Feb",
    year: "2025",
    title: "90+ Integrations",
    description: "Connect all tools",
    icon: Code,
    color: "bg-blue-500",
    done: true,
    story: "Google, Shopify, Slack, QuickBooks, HMRC, and more"
  },
  {
    month: "Mar",
    year: "2025",
    title: "Soft Launch",
    description: "Early users",
    icon: Rocket,
    color: "bg-teal-500",
    arr: "First Revenue",
    done: false,
    story: "Onboarding first paying customers from beta"
  },
  {
    month: "Apr",
    year: "2025",
    title: "Dev Program",
    description: "Invite builders",
    icon: Code,
    color: "bg-purple-500",
    done: false,
    story: "Opening marketplace for developer-created AI employees"
  },
  {
    month: "May",
    year: "2025",
    title: "AI Employees",
    description: "Talent pool live",
    icon: Users,
    color: "bg-primary",
    arr: "£50k ARR",
    done: false,
    story: "Full AI employee marketplace with specialized agents"
  },
  {
    month: "Aug",
    year: "2025",
    title: "10k Users",
    description: "Scale milestone",
    icon: Target,
    color: "bg-green-500",
    arr: "£250k ARR",
    done: false,
    story: "Proven product-market fit and scaling acquisition"
  },
];

export const RevenueSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-revenue">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-green-600 text-sm uppercase tracking-widest mb-4 block font-semibold">Roadmap</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Our Path to 10k Users
            </h2>
          </motion.div>

          {/* Story Text */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              This isn't just a list of milestones—it's a journey. Each step builds on the last, 
              moving us from MVP to a scalable platform with proven product-market fit.
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="relative mb-8"
          >
            {/* Timeline line - desktop */}
            <div className="absolute top-10 left-[8%] right-[8%] h-1 bg-slate-200 hidden md:block rounded-full"></div>
            <div className="absolute top-10 left-[8%] w-[30%] h-1 bg-gradient-to-r from-teal-400 to-teal-500 hidden md:block rounded-full"></div>
            
            {/* Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-2">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${milestone.color} flex items-center justify-center shadow-lg mb-2 relative z-10 ${milestone.done ? 'ring-4 ring-teal-200' : ''}`}>
                    <milestone.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    {milestone.done && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Month badge */}
                  <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                    {milestone.month} {milestone.year?.slice(-2)}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm mb-0.5 leading-tight">{milestone.title}</h3>
                  
                  {/* ARR Badge */}
                  {milestone.arr && (
                    <div className="bg-green-100 text-green-700 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                      {milestone.arr}
                    </div>
                  )}
                  
                  {/* Story text (hidden on very small screens) */}
                  <p className="text-[10px] text-slate-500 hidden md:block leading-tight px-1">{milestone.story}</p>
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
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 max-w-3xl mx-auto mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Revenue Projection</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-slate-500 mb-1">Mar (Launch)</div>
                <div className="text-xl md:text-2xl font-bold text-slate-900">First Revenue</div>
                <div className="text-xs text-slate-400">Validation point</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">May (AI Employees)</div>
                <div className="text-xl md:text-2xl font-bold text-primary">£50k ARR</div>
                <div className="text-xs text-slate-400">~350 paying users</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Aug (Scale)</div>
                <div className="text-xl md:text-2xl font-bold text-green-600">£250k ARR</div>
                <div className="text-xs text-slate-400">10k users @ ~£25/mo avg</div>
              </div>
            </div>
          </motion.div>

          {/* Growth Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-5 flex gap-4">
              <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-semibold text-slate-900">The growth logic:</span> Shopify merchants already pay $120/month for apps. 
                  Converting just 0.2% of the 5.5M merchants to our £25/mo average would mean £250k ARR. That's our conservative target.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
