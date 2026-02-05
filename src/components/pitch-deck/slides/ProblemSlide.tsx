import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, floatUp } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import {
  Flame,
  TrendingDown,
  PoundSterling,
  ArrowRight,
  Briefcase,
  Scale,
  Users,
  HeadphonesIcon,
  Truck,
  Gavel,
} from "lucide-react";

const painPoints = [
  {
    statValue: "46%",
    statLabel: "of small business owners report burnout",
    detail: "Nearly half of UK SMEs are burning out from wearing every hat.",
  },
  {
    statValue: "32%",
    statLabel: "can't grow—they're too busy",
    detail: "1 in 3 say daily operations block hiring or expansion.",
  },
  {
    statValue: "£30,800",
    statLabel: "to hire just one employee",
    detail: "Average UK salary—before NI, pension, and recruitment.",
  },
];

const responsibilities = [
  { icon: Briefcase, label: "Marketing" },
  { icon: PoundSterling, label: "Finance" },
  { icon: Users, label: "Operations" },
  { icon: HeadphonesIcon, label: "Support" },
  { icon: Truck, label: "Distribution" },
  { icon: Gavel, label: "Legal" },
];

const cycleSteps = [
  { label: "No Help", color: "bg-slate-100 border-slate-300 text-slate-600" },
  { label: "Work Harder", color: "bg-orange-100 border-orange-300 text-orange-700" },
  { label: "Burnout", color: "bg-red-100 border-red-300 text-red-700" },
  { label: "No Growth", color: "bg-slate-100 border-slate-300 text-slate-600" },
];

export const ProblemSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute " />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-100/30 to-transparent" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-1">
        <span className="pitch-label text-orange-500">The Challenge</span>
      </motion.div>

      {/* H1 (cols 1-8) */}
      <motion.h2 variants={floatUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-12 pitch-h1">
        Founders Are{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Drowning</span> In
        Their Own Business
      </motion.h2>

      {/* Role pills row (cols 1-8) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-8 flex flex-wrap gap-2"
      >
        {responsibilities.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm"
          >
            <item.icon className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-medium text-slate-700">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Left narrative (cols 1-7) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-7 hidden md:block"
      >
        <div className="space-y-2">
          <p className="text-base text-slate-600 leading-relaxed">
            • Most founders begin <span className="font-semibold text-slate-800">without a team</span>
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            • Each role demands new tools, consuming time and effort
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            • <span className="font-semibold text-orange-600">Limited capital</span> means hiring isn't an option
          </p>
        </div>
      </motion.div>

      {/* Right paragraph card (cols 8-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-5">
        <div className="pitch-card">
          <p className="text-sm text-slate-600 leading-relaxed">
            So founders manage daily tasks instead of focusing on
            <span className="font-semibold text-slate-800"> strategy and growth</span>—making it harder to move the
            business forward.
          </p>
        </div>
      </motion.div>

      {/* KPI cards (cols 1-4, 5-8, 9-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {painPoints.map((point, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            className="pitch-card border-t-4 border-orange-500 bg-gradient-to-b from-orange-50/80 to-white"
          >
            <div className="mb-2">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">{point.statValue}</span>
            </div>
            <p className="text-slate-700 font-medium text-xs mb-2">{point.statLabel}</p>
            <div className="w-full h-px bg-slate-200 mb-2" />
            <p className="text-slate-500 text-[11px] leading-relaxed">{point.detail}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Catch-22 card (cols 1-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-gradient-to-r from-slate-50 via-white to-orange-50/50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 md:min-w-[180px]">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-base">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">The Catch-22</h3>
                <p className="text-[10px] text-slate-500">The trap founders can't escape</p>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap items-center justify-center gap-2">
              {cycleSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg border ${step.color}`}>
                    <span className="text-xs font-semibold">{step.label}</span>
                  </div>
                  {index < cycleSteps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-slate-400">
                <ArrowRight className="w-3 h-3" />
                <span className="text-xs font-medium">↺</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic text-center md:text-right md:max-w-[200px]">
              Trapped between <span className="font-semibold text-slate-800">needing support</span> and{" "}
              <span className="font-semibold text-slate-800">not affording it</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </SlideShell>
  );
};
