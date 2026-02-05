import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Check, Sparkles, Database, Zap, Users, Lightbulb } from "lucide-react";

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
  { icon: Database, title: "Storage", price: "TBC" },
  { icon: Zap, title: "Credits", price: "6p per credit" },
  { icon: Users, title: "Extra Agents", price: "£10/month" },
];

export const PricingSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-green-600">Pricing</span>
      </motion.div>

      {/* H1 (cols 1-8) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-8 pitch-h1">
        Accessible for Every Business
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-9 pitch-body">
        Designed for SMEs who need us most. No hidden fees, no enterprise-only features.
      </motion.p>

      {/* 4 pricing cards (cols 1-3, 4-6, 7-9, 10-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            className={`pitch-card p-4 md:p-6 ${
              plan.highlight ? "bg-gradient-to-br from-primary/10 to-purple-100 border-2 border-primary relative" : ""
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Popular
              </div>
            )}
            <div className="text-center mb-3">
              <h3 className="text-base font-semibold text-slate-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 text-xs">{plan.period}</span>
              </div>
              <div
                className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  plan.highlight ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Users className="w-3 h-3" />
                {plan.agents} {plan.agents === 1 ? "Agent" : "Agents"}
              </div>
            </div>
            <ul className="space-y-1.5">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-600 text-xs">
                  <Check className={`w-3 h-3 ${plan.highlight ? "text-primary" : "text-green-500"}`} />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* 3 add-on cards (cols 1-4, 5-8, 9-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-3 gap-3"
      >
        {additionalCosts.map((cost, index) => (
          <motion.div key={index} variants={scaleIn} className="pitch-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <cost.icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{cost.title}</h4>
              <p className="text-sm font-bold text-primary">{cost.price}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Insight callout */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-green-50 border-l-4 border-green-500 flex gap-4">
          <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Why these prices?</span> The average SME employee costs
            £39,039/year. Our Pro plan gives you 6 AI employees for £180/year—that's{" "}
            <span className="font-bold text-green-700">217x cheaper</span> than one human hire.
          </p>
        </div>
      </motion.div>
    </SlideShell>
  );
};
