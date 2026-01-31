import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, floatUp, defaultViewport } from "../slideAnimations";
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
    icon: Flame,
    statValue: "46%",
    statLabel: "of small business owners report burnout",
    detail: "Nearly half of UK SMEs are burning out from wearing every hat.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingDown,
    statValue: "32%",
    statLabel: "can't grow—they're too busy",
    detail: "1 in 3 say daily operations block hiring or expansion.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: PoundSterling,
    statValue: "£30,800",
    statLabel: "to hire just one employee",
    detail: "Average UK salary—before NI, pension, and recruitment.",
    gradient: "from-red-500 to-rose-500",
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
  { label: "No Help", active: false },
  { label: "Work Harder", active: true },
  { label: "Burnout", active: true },
  { label: "No Growth", active: false },
];

export const ProblemSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-slate-50" />
      
      {/* Subtle accent */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-orange-100/40 to-transparent" />

      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={floatUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-10"
          >
            <span className="inline-block text-orange-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              The Challenge
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
              Founders Are{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Drowning
              </span>{" "}
              In Their Own Business
            </h2>

            {/* Responsibility Tags - clean pills */}
            <div className="flex flex-wrap gap-2">
              {responsibilities.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
                >
                  <item.icon className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-5 gap-8 mb-8">
            {/* Left: Story */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 h-full">
                <p className="text-base text-slate-600 leading-relaxed">
                  Most founders begin <span className="font-semibold text-slate-800">without a team</span>, handling
                  every function themselves. Each role demands new tools and processes, consuming significant time and
                  effort. With <span className="font-semibold text-orange-600">limited capital</span>, hiring
                  specialists isn't an option. So founders manage daily tasks instead of focusing on
                  <span className="font-semibold text-slate-800"> strategy and growth</span>—making it harder to move
                  the business forward.
                </p>
              </div>
            </motion.div>

            {/* Right: Stats */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="lg:col-span-3 grid gap-4"
            >
              {painPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-5"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center flex-shrink-0`}>
                    <point.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-bold text-slate-900">{point.statValue}</span>
                      <span className="text-sm text-slate-600">{point.statLabel}</span>
                    </div>
                    <p className="text-sm text-slate-500">{point.detail}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Vicious Cycle - minimal design */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
            <div className="bg-gradient-to-r from-slate-50 to-orange-50/50 border border-slate-200 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-3 md:min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">The Catch-22</h3>
                    <p className="text-xs text-slate-500">The trap founders can't escape</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center justify-center gap-3">
                  {cycleSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        step.active 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {step.label}
                      </div>
                      {index < cycleSteps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  ))}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-sm font-medium">↺</span>
                </div>

                <p className="text-sm text-slate-600 italic text-center md:text-right md:max-w-[220px]">
                  Trapped between <span className="font-semibold text-slate-800">needing support</span> and{" "}
                  <span className="font-semibold text-slate-800">not affording it</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
