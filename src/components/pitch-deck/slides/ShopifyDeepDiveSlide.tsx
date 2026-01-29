import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport, getExportSafeVariants, getExportSafeViewport } from "../slideAnimations";
import { Store, DollarSign, Users, TrendingUp } from "lucide-react";
import { usePDFExportContext } from "../PDFExportContext";

const AnimatedCounter = ({ end, prefix = "", suffix = "", decimals = 0 }: { end: number; prefix?: string; suffix?: string; decimals?: number }) => {
  const { isExporting } = usePDFExportContext();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    // If exporting, immediately show final value
    if (isExporting) {
      setCount(end);
      return;
    }
    
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
  }, [isInView, end, isExporting]);

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
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: DollarSign,
    value: 120,
    prefix: "$",
    suffix: "/mo",
    label: "Avg App Spend",
    description: "Per merchant on third-party apps",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Users,
    value: 64,
    suffix: "%",
    label: "Small Businesses",
    description: "Exactly our target customer",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: TrendingUp,
    value: 7.9,
    prefix: "$",
    suffix: "B",
    label: "TAM in Shopify",
    description: "Addressable market within Shopify alone",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
];

export const ShopifyDeepDiveSlide = () => {
  const { isExporting } = usePDFExportContext();

  return (
    <section className="pitch-slide pitch-slide-shopify">
      {/* Light background with green accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/40 to-slate-50" />
      
      {/* Shopify green accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-100/50 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-8 w-auto" />
              <span className="text-green-600 text-sm uppercase tracking-widest font-medium">Deep Dive</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Let's Zoom In: Shopify Merchants
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Our beachhead market with massive untapped potential
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            variants={getExportSafeVariants(staggerContainer, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={getExportSafeVariants(scaleIn, isExporting)}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix}
                    decimals={stat.value < 10 ? 1 : 0}
                  />
                </div>
                <div className={`font-semibold ${stat.color} mb-1`}>{stat.label}</div>
                <div className="text-slate-500 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom insight */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="mt-12"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <p className="text-xl text-slate-700 mb-2">
                <span className="font-bold text-green-700">3.5M+ small business merchants</span> on Shopify alone
              </p>
              <p className="text-slate-500">
                Each spending money on fragmented tools. Elixa consolidates their tech stack into one AI-powered workspace.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
