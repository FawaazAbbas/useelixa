import { motion } from "framer-motion";
import { fadeInUp, slideInLeft, slideInRight, staggerContainer, defaultViewport, getExportSafeVariants, getExportSafeViewport } from "../slideAnimations";
import { TrendingDown, Clock, DollarSign } from "lucide-react";
import { usePDFExportContext } from "../PDFExportContext";

const stats = [
  { icon: DollarSign, value: "£39,039", label: "Cost of ONE employee/year" },
  { icon: Clock, value: "24 days", label: "Lost to admin per year" },
  { icon: TrendingDown, value: "10-30%", label: "Software budget wasted" },
];

export const ProblemSlide = () => {
  const { isExporting } = usePDFExportContext();

  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Light background with warm accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50/30 to-slate-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-100/40 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 lg:px-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 max-w-7xl w-full">
          {/* Left: Story */}
          <motion.div
            variants={getExportSafeVariants(slideInLeft, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="flex flex-col justify-center"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest mb-4 font-medium">The Problem</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Solopreneurs struggle with{" "}
              <span className="text-orange-500">overhead</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Hiring even one employee means salaries, taxes, benefits, and HR headaches. 
              Most solopreneurs and small teams simply can't afford the overhead—leaving 
              them to do everything themselves.
            </p>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            variants={getExportSafeVariants(staggerContainer, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="flex flex-col gap-6 justify-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={getExportSafeVariants(slideInRight, isExporting)}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-lg shadow-slate-200/50"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-slate-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
