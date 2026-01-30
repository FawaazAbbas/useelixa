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
    category: "BURNOUT",
    accentColor: "orange",
    statValue: "46%",
    statLabel: "of small business owners report burnout",
    detail: "Nearly half of UK SMEs are burning out from wearing every hat.",
  },
  {
    icon: TrendingDown,
    category: "STUCK",
    accentColor: "orange",
    statValue: "32%",
    statLabel: "can't grow—they're too busy",
    detail: "1 in 3 say daily operations block hiring or expansion.",
  },
  {
    icon: PoundSterling,
    category: "UNAFFORDABLE",
    accentColor: "orange",
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

const getAccentStyles = (color: string) => {
  const styles: Record<string, { border: string; bg: string; iconBg: string; text: string }> = {
    orange: {
      border: "border-t-4 border-orange-500",
      bg: "bg-gradient-to-b from-orange-50/80 to-white",
      iconBg: "bg-orange-100",
      text: "text-orange-600",
    },
    blue: {
      border: "border-t-4 border-blue-500",
      bg: "bg-gradient-to-b from-blue-50/80 to-white",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    },
    emerald: {
      border: "border-t-4 border-emerald-500",
      bg: "bg-gradient-to-b from-emerald-50/80 to-white",
      iconBg: "bg-emerald-100",
      text: "text-emerald-600",
    },
  };
  return styles[color] || styles.orange;
};

export const ProblemSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-orange-50/30" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-100/30 to-transparent" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-7xl w-full">
          {/* Header Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-6">
            {/* Left: Title & Hook */}
            <motion.div variants={floatUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
              <span className="text-orange-500 text-xs uppercase tracking-widest font-semibold mb-2 block">
                The Challenge
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                Founders Are{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  Drowning
                </span>{" "}
                In Their Own Business
              </h2>

              {/* Visual: Responsibility Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {responsibilities.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm"
                  >
                    <item.icon className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-slate-700">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Story Paragraph */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex items-center"
            >
              <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  Most founders begin <span className="font-semibold text-slate-800">without a team</span>, handling
                  every function themselves. Each role demands new tools and processes, consuming significant time and
                  effort. With <span className="font-semibold text-orange-600">limited capital</span>, hiring
                  specialists isn't an option. So founders manage daily tasks instead of focusing on
                  <span className="font-semibold text-slate-800"> strategy and growth</span>—making it harder to move
                  the business forward.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-4 mb-6"
          >
            {painPoints.map((point, index) => {
              const styles = getAccentStyles(point.accentColor);
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className={`${styles.border} ${styles.bg} rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  {/* Stat */}
                  <div className="mb-2">
                    <span className="text-3xl md:text-4xl font-bold text-slate-900">{point.statValue}</span>
                  </div>

                  {/* Label */}
                  <p className="text-slate-700 font-medium text-xs mb-2">{point.statLabel}</p>

                  {/* Divider + Detail */}
                  <div className="w-full h-px bg-slate-200 mb-2" />
                  <p className="text-slate-500 text-[11px] leading-relaxed">{point.detail}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Vicious Cycle */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
            <div className="bg-gradient-to-r from-slate-50 via-white to-orange-50/50 border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: Title */}
                <div className="flex items-center gap-2 md:min-w-[180px]">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span className="text-base">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">The Catch-22 Situation</h3>
                    <p className="text-[10px] text-slate-500">The trap founders can't escape</p>
                  </div>
                </div>

                {/* Center: Cycle Flow */}
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

                {/* Right: Tagline */}
                <p className="text-xs text-slate-600 italic text-center md:text-right md:max-w-[200px]">
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
