import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { MessageSquare, Users, Puzzle, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MessageSquare, title: "AI Team Chats", description: "Natural conversations with your AI workforce" },
  { icon: Users, title: "Cross Collaboration", description: "AI employees work together on complex tasks" },
  { icon: Puzzle, title: "90+ Integrations", description: "Connect all your existing tools" },
  { icon: Layers, title: "One Workspace", description: "Everything unified in a single interface" },
];

export const ProductSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-product">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(220,35%,8%)] to-[hsl(240,30%,8%)]" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
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
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block">Product</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              The Complete AI Workspace
            </h2>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center"
          >
            <Link to="/chat">
              <Button size="lg" className="text-lg px-8 py-6 rounded-xl">
                See it in action →
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
