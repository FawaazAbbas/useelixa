import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Store, Users, Globe, Megaphone, Lightbulb, ArrowRight } from "lucide-react";

const strategies = [
  {
    icon: Store,
    title: "Shopify First",
    description: "5.5M merchants already paying for apps. Direct integration with their ecosystem. They're our perfect first customers.",
    gradient: "from-green-500 to-emerald-600",
    tag: "Beachhead",
  },
  {
    icon: Users,
    title: "Community-Led",
    description: "Developer marketplace where builders create and monetize AI employees. They bring their own audiences.",
    gradient: "from-purple-500 to-violet-600",
    tag: "Viral loop",
  },
  {
    icon: Megaphone,
    title: "Content Marketing",
    description: "SEO-optimized guides, templates, and use cases. Target SME pain points with actionable content.",
    gradient: "from-blue-500 to-blue-600",
    tag: "Organic",
  },
  {
    icon: Globe,
    title: "Strategic Partnerships",
    description: "Integrations with tools SMEs already use—accountants, agencies, and service providers who recommend us.",
    gradient: "from-teal-500 to-cyan-600",
    tag: "Distribution",
  },
];

export const GTMSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-gtm">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-purple-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Go-to-Market
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              How We'll Reach Them
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're not spraying ads everywhere. Our strategy is surgical: start with Shopify merchants 
              who already pay for similar tools, then expand through community and content.
            </p>
          </motion.div>

          {/* Strategy grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-2 gap-5 mb-10"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex gap-5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${strategy.gradient} flex items-center justify-center shrink-0`}>
                  <strategy.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{strategy.title}</h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {strategy.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{strategy.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Shopify-First Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-2xl p-6 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Why Shopify first?</span> They already spend $120/month on apps, 
                    they're used to app-store purchases, and 64% are small businesses—exactly our target. We're not creating demand; 
                    we're redirecting existing spending to a better solution.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shopify highlight badge */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center"
          >
            <div className="inline-flex items-center gap-4 bg-green-50 border border-green-200 rounded-full px-6 py-3 shadow-sm">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-6 w-auto" />
              <span className="text-green-700 font-medium text-sm">5.5M merchants • $7.9B app ecosystem • Our beachhead market</span>
              <ArrowRight className="w-4 h-4 text-green-600" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
