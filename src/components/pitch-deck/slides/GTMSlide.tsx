import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Users, Mail, MessageCircle, Target, FileText, Handshake, Gift, Smartphone, Lightbulb } from "lucide-react";

const strategies = [
  {
    icon: Users,
    title: "Social Media",
    description: "LinkedIn, Twitter early adopters",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Mail,
    title: "Waitlist",
    description: "Targeted outreach & referrals",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description: "Reddit, Indie Hackers, PH",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  { icon: Target, title: "Paid Ads", description: "17p cost-per-lead", color: "text-red-600", bgColor: "bg-red-100" },
  {
    icon: FileText,
    title: "Content",
    description: "SEO-driven guides",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    description: "SME service providers",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    icon: Gift,
    title: "Promotions",
    description: "Giveaways & influencers",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    icon: Smartphone,
    title: "Native Apps",
    description: "Shopify, WooCommerce, mobile",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

export const GTMSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-purple-600">Go-to-Market</span>
      </motion.div>

      {/* H1 (cols 1-8) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-8 pitch-h1">
        How We'll Reach Them
      </motion.h2>

      {/* Subcopy (cols 1-10) */}
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-10 pitch-body"
      >
        Multiple acquisition channels that compound over time—starting with our own audience.
      </motion.p>

      {/* 2x4 grid of 8 cards (each 3 cols) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {strategies.map((strategy, index) => (
          <motion.div key={index} variants={scaleIn} className="pitch-card p-4">
            <div className={`w-9 h-9 rounded-xl ${strategy.bgColor} flex items-center justify-center mb-2`}>
              <strategy.icon className={`w-4 h-4 ${strategy.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{strategy.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{strategy.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom callout strip (cols 1-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-purple-50 border-l-4 border-purple-500 flex gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Multi-channel approach:</span> Each channel reinforces the
            others— social builds awareness, content captures intent, partnerships add credibility, and native apps lock
            in retention.
          </p>
        </div>
      </motion.div>
    </SlideShell>
  );
};
