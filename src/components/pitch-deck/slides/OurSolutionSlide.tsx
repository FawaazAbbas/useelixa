import { motion } from "framer-motion";
import { fadeInUp, slideInLeft, slideInRight, defaultViewport } from "../slideAnimations";
import { ElixaMascot } from "@/components/ElixaMascot";
import { Users, Layers, Puzzle } from "lucide-react";

export const OurSolutionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-our-solution">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,8%)] via-[hsl(240,30%,10%)] to-[hsl(260,30%,8%)]" />
      
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block">Our Solution</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              AI Employee{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Talent Pool
              </span>
              {" "}+ Workspace
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground">
              Think <span className="text-white font-semibold">"Slack + App Store"</span>
            </p>
          </motion.div>

          {/* Two columns */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Talent Pool */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Talent Pool</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Browse and hire AI employees built by developers. Each one specialized for 
                specific tasks—marketing, customer support, data analysis, and more.
              </p>
            </motion.div>

            {/* Unified Workspace */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unified Workspace</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                All your AI employees work together in one workspace. They collaborate, 
                share context, and connect to 90+ tools seamlessly.
              </p>
            </motion.div>
          </div>

          {/* Mascot */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="absolute bottom-8 right-8 hidden lg:block"
          >
            <ElixaMascot pose="pointing-left" size="lg" animation="float" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
