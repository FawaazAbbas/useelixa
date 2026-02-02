import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { Users, Mail, MessageCircle, Target, FileText, Handshake, Gift, Smartphone, Lightbulb } from "lucide-react";

const strategies = [
  {
    icon: Users,
    title: "Social Media Engagement",
    description: "Growing and converting followers on LinkedIn, Twitter into early adopters.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Mail,
    title: "Waitlist Mobilization",
    description: "Converting waitlist into active users via targeted outreach and referral incentives.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: MessageCircle,
    title: "Community Engagement",
    description: "Leverage Reddit, Indie Hackers, and Product Hunt.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Target,
    title: "Paid Acquisition",
    description: "Scale with a 17p cost-per-lead.",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    icon: FileText,
    title: "Content Marketing",
    description: "SEO-driven guides and valuable SME content.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    icon: Handshake,
    title: "Strategic Partnerships",
    description: "Referrals through SME service providers.",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    icon: Gift,
    title: "Promotions & Influencers",
    description: "Giveaways, influencer campaigns, and events.",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    icon: Smartphone,
    title: "Native Apps",
    description: "Apps for Shopify, WooCommerce, WordPress, plus mobile and desktop.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

export const GTMSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-gtm">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-6"
          >
            <span className="text-purple-600 text-sm uppercase tracking-widest mb-4 block font-semibold">Go-to-Market</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              How We'll Reach Them
            </h2>
          </motion.div>

          {/* Narrative */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto mb-8"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              We're building multiple acquisition channels that compound over time—starting with our own audience 
              and expanding through community, content, and strategic partnerships.
            </p>
          </motion.div>

          {/* 4x2 Strategy grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg shadow-slate-200/50"
              >
                <div className={`w-10 h-10 rounded-xl ${strategy.bgColor} flex items-center justify-center mb-3`}>
                  <strategy.icon className={`w-5 h-5 ${strategy.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{strategy.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{strategy.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Insight callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4 flex gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Multi-channel approach:</span> Each channel reinforces the others—
                social builds awareness, content captures intent, partnerships add credibility, and native apps lock in retention.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
