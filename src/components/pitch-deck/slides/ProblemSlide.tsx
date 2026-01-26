import { motion } from "framer-motion";
import { fadeInUp, slideInLeft, slideInRight, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingDown, Clock, DollarSign } from "lucide-react";

const stats = [
  { icon: DollarSign, value: "£39,039", label: "Avg UK salary" },
  { icon: TrendingDown, value: "+£5,106", label: "Employer tax cost" },
  { icon: Clock, value: "120hrs", label: "Lost to admin yearly" },
];

export const ProblemSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-problem">
      {/* Background with red accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(0,30%,8%)] to-[hsl(240,30%,8%)]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 lg:px-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 max-w-7xl w-full">
          {/* Left: Story */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="flex flex-col justify-center"
          >
            <span className="text-red-400 text-sm uppercase tracking-widest mb-4">The Problem</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Solopreneurs struggle with{" "}
              <span className="text-red-400">overhead</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Hiring even one employee means salaries, taxes, benefits, and HR headaches. 
              Most solopreneurs and small teams simply can't afford the overhead—leaving 
              them to do everything themselves.
            </p>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="flex flex-col gap-6 justify-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={slideInRight}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
