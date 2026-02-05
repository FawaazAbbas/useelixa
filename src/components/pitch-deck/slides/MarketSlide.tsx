import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { ShoppingBag } from "lucide-react";

const AnimatedCounter = ({
  end,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [hasAnimated, end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const MarketSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute" />

      {/* Section label (cols 1-4) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-4">
        <span className="pitch-label text-teal-600">Market Opportunity</span>
      </motion.div>

      {/* H1 (cols 1-8) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-12 pitch-h1">
        A Market That's Already Moving
      </motion.h2>

      {/* Subcopy (cols 1-9) */}
      <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-9 pitch-body">
        Millions of digital-native SMBs are already investing in tools that make them faster and more competitive.
      </motion.p>

      {/* TAM/SAM/SOM graphic (cols 1-6) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 flex items-center justify-center"
      >
        <div className="relative">
          {/* TAM */}
          <motion.div
            variants={scaleIn}
            className="w-52 h-52 md:w-64 md:h-64 rounded-full border-2 border-teal-300 flex items-center justify-center bg-teal-50/50"
          >
            {/* SAM */}
            <motion.div
              variants={scaleIn}
              className="w-40 h-40 md:w-48 md:h-48 rounded-full border-2 border-blue-300 flex items-center justify-center bg-blue-50/50"
            >
              {/* SOM */}
              <motion.div
                variants={scaleIn}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10"
              >
                <div className="text-center">
                  <div className="text-sm md:text-base font-bold text-slate-900">
                    £<AnimatedCounter end={77.9} suffix="M" />
                  </div>
                  <div className="text-primary font-semibold text-xs">SOM</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right cards - TAM, SAM, SOM (cols 7-12) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 space-y-3"
      >
        <motion.div variants={scaleIn} className="pitch-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            <span className="font-bold text-slate-900">TAM: £129.6B/yr</span>
          </div>
          <p className="text-slate-600 text-sm">~216M digitally-native SMBs (54% of 400M global SMEs) @ £50/mo</p>
        </motion.div>

        <motion.div variants={scaleIn} className="pitch-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="font-bold text-slate-900">SAM: £7.79B/yr</span>
            <span className="text-xs text-slate-400">(2026)</span>
          </div>
          <p className="text-slate-600 text-sm">~12.99M online SMBs (global live stores) @ £50/mo</p>
        </motion.div>

        <motion.div variants={scaleIn} className="pitch-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="font-bold text-slate-900">SOM: £77.9M/yr</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">1% of SAM</span>
          </div>
          <p className="text-slate-600 text-sm">~129.9K online SMBs — achievable with 1% market penetration</p>
        </motion.div>
      </motion.div>

      {/* Benchmark strip (cols 1-12) with 4 KPI mini-tiles */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12">
        <div className="pitch-card bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Our Benchmark: Shopify Merchants</h3>
              <p className="text-slate-600 text-sm">
                <span className="font-semibold text-slate-800">5.5 million customers</span> spending{" "}
                <span className="font-semibold text-slate-800">$120/month on apps</span>
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">5.5M</div>
              <div className="text-xs text-slate-500">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">$120</div>
              <div className="text-xs text-slate-500">Monthly Spend</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">64%</div>
              <div className="text-xs text-slate-500">Small Business</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">$7.9B</div>
              <div className="text-xs text-slate-500">Annual Revenue</div>
            </div>
          </div>
        </div>
      </motion.div>
    </SlideShell>
  );
};
