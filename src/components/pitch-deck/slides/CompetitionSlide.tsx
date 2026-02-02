import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
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

// Positioning data for the 2x2 matrix (X: Affordable→Expensive, Y: Basic→Advanced)
const quadrantData = [
  { name: "n8n", x: 20, y: 35, size: "md" },
  { name: "Motion", x: 75, y: 40, size: "md" },
  { name: "Sintra", x: 80, y: 75, size: "md" },
  { name: "Lindy", x: 70, y: 70, size: "sm" },
  { name: "Elixa", x: 25, y: 80, size: "lg", isUs: true },
];

export const CompetitionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-competition">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest mb-4 block font-semibold">Competition</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
              Why We Win
            </h2>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Narrative categories */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="space-y-5"
            >
              {competitorCategories.map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className={`${item.bgColor} border-l-4 ${item.color} rounded-r-xl p-5`}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {item.category} <span className="font-normal text-slate-500">({item.examples})</span>
                  </h3>
                  <p className="text-slate-700 italic">"{item.differentiator}"</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: 2x2 Quadrant */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-col"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Market Positioning</h3>
                <div className="relative aspect-square max-w-xs mx-auto">
                  {/* Axes */}
                  <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300"></div>
                    
                    {/* Labels */}
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Advanced</span>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic</span>
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 uppercase tracking-wide">Affordable</span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-500 uppercase tracking-wide">Expensive</span>
                    
                    {/* Highlight Elixa's quadrant */}
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50/60 rounded-tl-xl"></div>
                  </div>
                  
                  {/* Competitor bubbles */}
                  {quadrantData.map((comp, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={defaultViewport}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                        comp.isUs 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                          : 'bg-white border border-slate-200 text-slate-700 shadow-md'
                      } rounded-full flex items-center justify-center font-semibold ${
                        comp.size === 'lg' ? 'w-14 h-14 text-xs' : comp.size === 'md' ? 'w-12 h-12 text-[10px]' : 'w-10 h-10 text-[9px]'
                      }`}
                      style={{ left: `${comp.x}%`, top: `${100 - comp.y}%` }}
                    >
                      {comp.isUs && <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" />}
                      {comp.name}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Summary line */}
              <motion.p
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                className="text-center text-slate-700 font-medium mt-4"
              >
                <span className="text-primary font-semibold">Elixa:</span> Specialist AI employees with context, affordable for SMEs.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
