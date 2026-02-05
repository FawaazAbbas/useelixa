import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Store, DollarSign, Users, TrendingUp, Lightbulb } from "lucide-react";

const AnimatedCounter = ({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      let start = 0;
      const increment = end / 120;
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, end]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

const stats = [
  {
    icon: Store,
    value: 5.5,
    suffix: "M",
    label: "Merchants Globally",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: DollarSign,
    value: 120,
    prefix: "$",
    suffix: "/mo",
    label: "Avg App Spend",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Users,
    value: 64,
    suffix: "%",
    label: "Small Businesses",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: TrendingUp,
    value: 7.9,
    prefix: "$",
    suffix: "B",
    label: "TAM in Shopify",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
];

export const ShopifyDeepDiveSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-100/50 to-transparent" />

      {/* Section label (cols 1-4) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-4 flex items-center gap-4"
      >
        <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-6 w-auto" />
        <span className="pitch-label text-green-600">Deep Dive</span>
      </motion.div>

      {/* H1 (cols 1-10) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-12 pitch-h1">
        Why Shopify Merchants First?
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-12 pitch-body"
      >
        5.5 million customers who spend $120 monthly on apps.{" "}
        <span className="font-semibold text-slate-900">64% are small businesses</span>—exactly our target market.
      </motion.p>

      {/* 4 KPI tiles (cols 1-3, 4-6, 7-9, 10-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={scaleIn} className="pitch-card text-center">
            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center mx-auto mb-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              <AnimatedCounter
                end={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.value < 10 ? 1 : 0}
              />
            </div>
            <div className={`font-semibold ${stat.color} text-sm`}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Rationale card (cols 1-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-green-50 border-l-4 border-green-500">
          <div className="flex gap-4">
            <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Why start here?</span> These merchants already pay for
                apps, use fragmented tools, and are actively seeking automation. They spend{" "}
                <span className="font-semibold text-green-700">$120/month on productivity tools</span> and understand
                that <span className="font-semibold text-slate-900">time saved equals money earned</span>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom banner strip (cols 1-12) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-white border-green-200 text-center">
          <p className="text-xl text-slate-700">
            <span className="font-bold text-green-700">3.5M+ small business merchants</span> are waiting for a tool like
            Elixa
          </p>
        </div>
      </motion.div>
    </SlideShell>
  );
};
