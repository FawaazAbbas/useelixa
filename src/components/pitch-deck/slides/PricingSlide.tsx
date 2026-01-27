import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Check, Sparkles, Database, Zap, Users } from "lucide-react";

const plans = [
  {
    name: "Trial",
    price: "£0",
    period: "14 days",
    agents: 1,
    features: ["100 credits", "2 connectors", "Basic AI models", "Community support"],
    highlight: false,
  },
  {
    name: "Starter",
    price: "£4.99",
    period: "/month",
    agents: 2,
    features: ["1,000 credits/month", "Unlimited connectors", "Standard AI models", "Email support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "£14.99",
    period: "/month",
    agents: 6,
    features: ["5,000 credits/month", "GPT & Gemini Pro", "Priority support", "Advanced workflows"],
    highlight: true,
  },
  {
    name: "Unlimited",
    price: "£29.99",
    period: "/month",
    agents: 12,
    features: ["Unlimited credits", "Premium models", "Dedicated support", "Custom integrations"],
    highlight: false,
  },
];

const additionalCosts = [
  {
    icon: Database,
    title: "Storage",
    price: "TBC",
    description: "Additional storage pricing coming soon",
  },
  {
    icon: Zap,
    title: "Credits",
    price: "6p per credit",
    description: "Top up anytime for extra AI interactions",
  },
  {
    icon: Users,
    title: "Extra Agents",
    price: "£10/month",
    description: "Add more AI employees to your workspace",
  },
];

export const PricingSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-pricing">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16 py-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="text-green-600 text-sm uppercase tracking-widest mb-4 block font-medium">Pricing</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
              Simple & Transparent
            </h2>
          </motion.div>

          {/* Pricing cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`rounded-2xl p-6 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-primary/10 to-purple-100 border-2 border-primary relative shadow-lg'
                    : 'bg-white border border-slate-200 shadow-lg shadow-slate-200/50'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                  {/* Agent count badge */}
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    plan.highlight ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Users className="w-4 h-4" />
                    {plan.agents} {plan.agents === 1 ? 'Agent' : 'Agents'}
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                      <Check className={`w-4 h-4 ${plan.highlight ? 'text-primary' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Costs */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <h3 className="text-center text-lg font-semibold text-slate-700 mb-4">Additional Costs</h3>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {additionalCosts.map((cost, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <cost.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{cost.title}</h4>
                    <p className="text-lg font-bold text-primary">{cost.price}</p>
                    <p className="text-sm text-slate-500">{cost.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
