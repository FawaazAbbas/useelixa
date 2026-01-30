import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Store, Users, Globe, Megaphone, Lightbulb } from "lucide-react";

const strategies = [
  {
    icon: Store,
    title: "Shopify First",
    description: "5.5M merchants already paying for apps. Direct integration with their ecosystem. They're our perfect first customers.",
    color: "text-green-600",
    bgColor: "bg-green-100",
    story: "Start where the money already flows"
  },
  {
    icon: Users,
    title: "Community-Led",
    description: "Developer marketplace where builders create and monetize AI employees. They bring their own audiences.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    story: "Let others build the product with us"
  },
  {
    icon: Megaphone,
    title: "Content Marketing",
    description: "SEO-optimized guides, templates, and use cases. Target SME pain points with actionable content.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    story: "Attract through value, not ads"
  },
  {
    icon: Globe,
    title: "Strategic Partnerships",
    description: "Integrations with tools SMEs already use—accountants, agencies, and service providers who recommend us.",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    story: "Leverage trusted relationships"
  },
];

export const GTMSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-gtm">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-purple-600 text-sm uppercase tracking-widest mb-4 block font-semibold">Go-to-Market</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              How We'll Reach Them
            </h2>
          </motion.div>

          {/* Story Text */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-10"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
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
            className="grid md:grid-cols-2 gap-5"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-5 shadow-lg shadow-slate-200/50"
              >
                <div className={`w-14 h-14 rounded-2xl ${strategy.bgColor} flex items-center justify-center shrink-0`}>
                  <strategy.icon className={`w-7 h-7 ${strategy.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{strategy.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${strategy.bgColor} ${strategy.color}`}>
                      {strategy.story}
                    </span>
                  </div>
                  <p className="text-slate-600">{strategy.description}</p>
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
            className="mt-10 max-w-4xl mx-auto"
          >
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-5 flex gap-4">
              <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-semibold text-slate-900">Why Shopify first?</span> They already spend $120/month on apps, 
                  they're used to app-store purchases, and 64% are small businesses—exactly our target. We're not creating demand; 
                  we're redirecting existing spending to a better solution.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Shopify highlight badge */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-6 w-auto" />
              <span className="text-green-700 font-medium">5.5M merchants • $7.9B app ecosystem • Our beachhead market</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
