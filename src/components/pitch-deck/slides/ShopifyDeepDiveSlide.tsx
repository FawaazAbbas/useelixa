import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Store, DollarSign, Users, TrendingUp, Lightbulb } from "lucide-react";

const AnimatedCounter = ({ end, prefix = "", suffix = "", decimals = 0 }: { end: number; prefix?: string; suffix?: string; decimals?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
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
  }, [isInView, end]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
};

const stats = [
  {
    icon: Store,
    value: 5.5,
    suffix: "M",
    label: "Merchants Globally",
    description: "Active Shopify stores worldwide",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: DollarSign,
    value: 120,
    prefix: "$",
    suffix: "/mo",
    label: "Avg App Spend",
    description: "Per merchant on third-party apps",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    value: 64,
    suffix: "%",
    label: "Small Businesses",
    description: "Exactly our target customer",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: TrendingUp,
    value: 7.9,
    prefix: "$",
    suffix: "B",
    label: "TAM in Shopify",
    description: "Addressable market within Shopify alone",
    gradient: "from-teal-500 to-cyan-600",
  },
];

export const ShopifyDeepDiveSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-shopify">
      {/* Clean gradient with green accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/40 to-slate-50" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-100/30 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header with logo */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-8 w-auto" />
              <span className="text-green-600 text-xs uppercase tracking-[0.2em] font-semibold">Deep Dive</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Why Shopify Merchants First?
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our immediate benchmark customer segment is Shopify merchants. There are 5.5 million customers 
              on Shopify who spend an average of $120 monthly on apps. Notably, <span className="font-semibold text-slate-900">64% of these are small businesses</span>—
              exactly our target market.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix}
                    decimals={stat.value < 10 ? 1 : 0}
                  />
                </div>
                <div className="font-semibold text-slate-700 mb-1 text-sm">{stat.label}</div>
                <div className="text-slate-500 text-xs">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Why Shopify Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-6 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Why start here?</span> These merchants already pay for apps, 
                    already use fragmented tools, and are actively seeking ways to automate their business. They're spending 
                    <span className="font-semibold text-green-700"> $120/month on productivity tools</span>, they're small business 
                    owners doing everything themselves, they're familiar with app-store style purchases, and most importantly—
                    <span className="font-semibold text-slate-900"> they understand that time saved equals money earned</span>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom highlight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <div className="bg-white border border-green-200 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm">
              <p className="text-xl text-slate-700">
                <span className="font-bold text-green-700">3.5M+ small business merchants</span> are waiting for a tool like Elixa
              </p>
              <p className="text-slate-500 mt-2">
                They're already contributing <span className="font-semibold">$7.9B annually</span> to productivity apps—we just need to earn our share
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
