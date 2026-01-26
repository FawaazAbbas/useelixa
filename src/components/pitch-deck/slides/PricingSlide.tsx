import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    features: ["5 AI employees", "50 messages/day", "Basic integrations", "Community support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "£29",
    period: "/month",
    features: ["Unlimited AI employees", "Unlimited messages", "90+ integrations", "Priority support", "Custom workflows"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "SSO & SAML", "Dedicated success manager", "Custom AI training", "SLA guarantee"],
    highlight: false,
  },
];

export const PricingSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-pricing">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(220,35%,8%)] to-[hsl(260,30%,8%)]" />
      
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
            <span className="text-green-400 text-sm uppercase tracking-widest mb-4 block">Pricing</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Simple & Transparent
            </h2>
          </motion.div>

          {/* Pricing cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50 relative'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <Check className={`w-5 h-5 ${plan.highlight ? 'text-primary' : 'text-green-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
