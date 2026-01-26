import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { Bot, AlertCircle } from "lucide-react";

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(200,40%,8%)] to-[hsl(240,30%,8%)]" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="max-w-4xl text-center">
          {/* Question */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <span className="text-teal-400 text-sm uppercase tracking-widest mb-4 block">The Promise</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              The solution?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                AI employees
              </span>
            </h2>
          </motion.div>

          {/* Bot icon */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30">
              <Bot className="w-12 h-12 text-teal-400" />
            </div>
          </motion.div>

          {/* But... */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
              But where are they?
            </p>
          </motion.div>

          {/* Price shock card */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <div className="inline-block bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-4 justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-400" />
                <span className="text-orange-400 font-semibold uppercase tracking-wide">Current Reality</span>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                £500<span className="text-orange-400">+</span>
              </div>
              <p className="text-muted-foreground text-lg">For a simple chatbot</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
