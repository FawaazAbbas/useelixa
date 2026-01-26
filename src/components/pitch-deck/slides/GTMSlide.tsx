import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Store, Users, Globe, Megaphone } from "lucide-react";

const strategies = [
  {
    icon: Store,
    title: "Shopify First",
    description: "5.5M merchants spending £120/month on apps. Direct integration with their ecosystem.",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    icon: Users,
    title: "Community-Led",
    description: "Developer marketplace where builders create and monetize AI employees.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    icon: Megaphone,
    title: "Content Marketing",
    description: "SEO-optimized guides, templates, and use cases driving organic traffic.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    icon: Globe,
    title: "Partnerships",
    description: "Strategic integrations with tools SMEs already use and trust.",
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
  },
];

export const GTMSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-gtm">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(280,30%,8%)] to-[hsl(240,30%,8%)]" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-12"
          >
            <span className="text-purple-400 text-sm uppercase tracking-widest mb-4 block">Go-to-Market</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              How We'll Win
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Focused wedge strategy targeting high-intent SME segments
            </p>
          </motion.div>

          {/* Strategy grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-2 gap-6"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl ${strategy.bgColor} flex items-center justify-center shrink-0`}>
                  <strategy.icon className={`w-7 h-7 ${strategy.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{strategy.title}</h3>
                  <p className="text-muted-foreground">{strategy.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Shopify highlight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-6 w-auto brightness-0 invert" />
              <span className="text-green-400 font-medium">64% are small businesses like our target customers</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
