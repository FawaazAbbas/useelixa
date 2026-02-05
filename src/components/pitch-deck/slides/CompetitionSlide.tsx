import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Star } from "lucide-react";

const competitorCategories = [
  {
    category: "Marketplace",
    examples: "Agent.ai",
    differentiator: "They help you find agents; we ensure they persist in context.",
    color: "border-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    category: "Workflow Automation",
    examples: "n8n, Make",
    differentiator: "They make you build workflows; we provide ready AI employees.",
    color: "border-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    category: "In-House AI",
    examples: "Motion, Sintra",
    differentiator: "They are broad; we are role-specific.",
    color: "border-teal-500",
    bgColor: "bg-teal-50",
  },
];

// Positioning data for the 2x2 matrix
const quadrantData = [
  { name: "n8n", x: 20, y: 35, size: "md" },
  { name: "Motion", x: 75, y: 40, size: "md" },
  { name: "Sintra", x: 80, y: 75, size: "md" },
  { name: "Lindy", x: 70, y: 70, size: "sm" },
  { name: "Elixa", x: 25, y: 80, size: "lg", isUs: true },
];

export const CompetitionSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-orange-500">Competition</span>
      </motion.div>

      {/* H1 (cols 1-8) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-10 pitch-h1">
        Why We Win
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-9 pitch-body">
        Positioned in the sweet spot: Advanced capability at affordable prices.
      </motion.p>

      {/* Left - 3 claim cards (cols 1-6) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 space-y-3"
      >
        {competitorCategories.map((item, index) => (
          <motion.div key={index} variants={scaleIn} className={`pitch-card ${item.bgColor} border-l-4 ${item.color}`}>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {item.category} <span className="font-normal text-slate-500">({item.examples})</span>
            </h3>
            <p className="text-slate-700 italic text-sm">"{item.differentiator}"</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Right - Matrix (cols 7-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-6">
        <div className="pitch-card h-full">
          <h3 className="text-base font-semibold text-slate-900 mb-4 text-center">Market Positioning</h3>
          <div className="relative aspect-square max-w-xs mx-auto">
            {/* Axes */}
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300"></div>

              {/* Labels INSIDE the container */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Advanced
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Basic
              </span>
              <span
                className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 uppercase tracking-wide writing-mode-vertical"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateX(50%)" }}
              >
                Affordable
              </span>
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-500 uppercase tracking-wide"
                style={{ writingMode: "vertical-rl" }}
              >
                Expensive
              </span>

              {/* Highlight Elixa's quadrant */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50/60 rounded-tl-xl"></div>
            </div>

            {/* Competitor bubbles */}
            {quadrantData.map((comp, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  comp.isUs
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-white border border-slate-200 text-slate-700 shadow-md"
                } rounded-full flex items-center justify-center font-semibold ${
                  comp.size === "lg"
                    ? "w-12 h-12 text-[10px]"
                    : comp.size === "md"
                      ? "w-10 h-10 text-[9px]"
                      : "w-8 h-8 text-[8px]"
                }`}
                style={{ left: `${comp.x}%`, top: `${100 - comp.y}%` }}
              >
                {comp.isUs && <Star className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" />}
                {comp.name}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary line (cols 1-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-slate-50 text-center">
          <p className="text-lg text-slate-700 font-medium">
            <span className="text-primary font-semibold">Elixa:</span> Specialist AI employees with context, affordable
            for SMEs.
          </p>
        </div>
      </motion.div>
    </SlideShell>
  );
};
