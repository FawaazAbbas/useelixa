import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Calendar, Rocket, Users, Code, Layers, Target, Lightbulb } from "lucide-react";

const milestones = [
  { month: "Jan", year: "2025", title: "Workspace MVP", icon: Layers, color: "bg-slate-500", done: true, story: "Core platform ready" },
  { month: "Feb", year: "2025", title: "90+ Integrations", icon: Code, color: "bg-blue-500", done: true, story: "All tools connected" },
  { month: "Mar", year: "2025", title: "Soft Launch", icon: Rocket, color: "bg-teal-500", arr: "First Revenue", done: false, story: "Early customers" },
  { month: "Apr", year: "2025", title: "Dev Program", icon: Code, color: "bg-purple-500", done: false, story: "Invite builders" },
  { month: "May", year: "2025", title: "AI Employees", icon: Users, color: "bg-primary", arr: "£50k ARR", done: false, story: "Talent pool live" },
  { month: "Aug", year: "2025", title: "10k Users", icon: Target, color: "bg-green-500", arr: "£250k ARR", done: false, story: "Scale milestone" },
];

const projections = [
  { date: "Mar (Launch)", value: "First Revenue", sub: "Validation point" },
  { date: "May (AI Employees)", value: "£50k ARR", sub: "~350 paying users", highlight: true },
  { date: "Aug (Scale)", value: "£250k ARR", sub: "10k users @ ~£25/mo avg", highlight: true, green: true },
];

export const RevenueSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-revenue">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-green-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Roadmap
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Our Path to 10k Users
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
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
            className="relative mb-10"
          >
            {/* Timeline line */}
            <div className="absolute top-10 left-[8%] right-[8%] h-1 bg-slate-200 hidden md:block rounded-full">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "30%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-2">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${milestone.color} flex items-center justify-center shadow-lg mb-3 relative z-10 ${milestone.done ? 'ring-4 ring-teal-200' : ''}`}>
                    <milestone.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    {milestone.done && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    {milestone.month} '{milestone.year?.slice(-2)}
                  </span>
                  
                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{milestone.title}</h3>
                  
                  {milestone.arr && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
                      {milestone.arr}
                    </span>
                  )}
                  
                  <p className="text-xs text-slate-500 hidden md:block">{milestone.story}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Projection */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Revenue Projection</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              {projections.map((proj, index) => (
                <div key={index}>
                  <div className="text-sm text-slate-500 mb-1">{proj.date}</div>
                  <div className={`text-xl md:text-2xl font-bold ${
                    proj.green ? 'text-green-600' : proj.highlight ? 'text-primary' : 'text-slate-900'
                  }`}>
                    {proj.value}
                  </div>
                  <div className="text-xs text-slate-400">{proj.sub}</div>
                </div>
              ))}
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
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-5 flex gap-4">
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
