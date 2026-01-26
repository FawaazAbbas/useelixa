import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Brain, Server, Shield, Zap } from "lucide-react";

const architecturePoints = [
  { icon: Brain, title: "Multi-Model AI", description: "Best model for each task - GPT-5, Gemini, Claude" },
  { icon: Server, title: "Edge Functions", description: "Serverless backend for lightning-fast responses" },
  { icon: Shield, title: "Enterprise Security", description: "SOC2 compliant infrastructure, encrypted at rest" },
  { icon: Zap, title: "Real-time Sync", description: "Instant updates across all connected tools" },
];

export const ArchitectureSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-architecture">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,30%,8%)] via-[hsl(240,30%,10%)] to-[hsl(220,35%,8%)]" />
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="currentColor" className="text-primary" />
              <line x1="50" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <line x1="50" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-16"
          >
            <span className="text-purple-400 text-sm uppercase tracking-widest mb-4 block">Architecture</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Built for Scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade infrastructure designed to handle millions of AI interactions daily
            </p>
          </motion.div>

          {/* Architecture grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-2 gap-6"
          >
            {architecturePoints.map((point, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <point.icon className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
