import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport, getExportSafeVariants, getExportSafeViewport } from "../slideAnimations";
import { Calendar, Rocket, Users, Code, Layers, Target } from "lucide-react";
import { usePDFExportContext } from "../PDFExportContext";

const milestones = [
  {
    month: "Jan",
    year: "2025",
    title: "Workspace MVP",
    description: "Core platform",
    icon: Layers,
    color: "bg-slate-500",
    done: true,
  },
  {
    month: "Feb",
    year: "2025",
    title: "90+ Integrations",
    description: "Connect tools",
    icon: Code,
    color: "bg-blue-500",
    done: true,
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
  },
  {
    month: "Apr",
    year: "2025",
    title: "Dev Program",
    description: "Invite builders",
    icon: Code,
    color: "bg-purple-500",
    done: false,
  },
  {
    month: "May",
    year: "2025",
    title: "AI Employees",
    description: "Talent pool",
    icon: Users,
    color: "bg-primary",
    arr: "£50k ARR",
    done: false,
  },
  {
    month: "Aug",
    year: "2025",
    title: "10k Users",
    description: "Scale target",
    icon: Target,
    color: "bg-green-500",
    arr: "£250k ARR",
    done: false,
  },
];

export const RevenueSlide = () => {
  const { isExporting } = usePDFExportContext();

  return (
    <section className="pitch-slide pitch-slide-revenue">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
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
            variants={getExportSafeVariants(staggerContainer, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
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
                  variants={getExportSafeVariants(scaleIn, isExporting)}
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
                  <p className="text-[10px] md:text-xs text-slate-500 mb-1">{milestone.description}</p>
                  
                  {/* ARR Badge */}
                  {milestone.arr && (
                    <div className="bg-green-100 text-green-700 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">
                      {milestone.arr}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ARR Projection Summary */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
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
