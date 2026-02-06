import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { AnimatedCounter } from "../AnimatedCounter";
import { ShoppingBag } from "lucide-react";

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
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-12 pitch-body"
      >
        Millions of digital-native SMBs are already investing in tools that make them faster and more competitive.
      </motion.p>

      {/* TAM/SAM/SOM visualization - Full width elegant design */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="col-span-12 grid grid-cols-3 gap-6"
      >
        {/* TAM */}
        <motion.div variants={scaleIn} className="relative group">
          <div className="pitch-card h-full border-t-4 border-teal-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-sm font-semibold text-teal-600 uppercase tracking-wide">TAM</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                £<AnimatedCounter end={129.6} suffix="B" decimals={1} delay={600} />
                <span className="text-lg text-slate-400 font-normal">/yr</span>
              </div>
              <p className="text-slate-500 text-sm mt-auto">
                ~216M digitally-native SMBs globally @ £50/mo
              </p>
            </div>
          </div>
          {/* Connector arrow */}
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>

        {/* SAM */}
        <motion.div variants={scaleIn} className="relative group">
          <div className="pitch-card h-full border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">SAM</span>
                <span className="text-xs text-slate-400">(2026)</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                £<AnimatedCounter end={7.79} suffix="B" decimals={2} delay={800} />
                <span className="text-lg text-slate-400 font-normal">/yr</span>
              </div>
              <p className="text-slate-500 text-sm mt-auto">
                ~12.99M online SMBs (global live stores)
              </p>
            </div>
          </div>
          {/* Connector arrow */}
          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>

        {/* SOM */}
        <motion.div variants={scaleIn} className="group">
          <div className="pitch-card h-full border-t-4 border-primary bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">SOM</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Target</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                £<AnimatedCounter end={77.9} suffix="M" decimals={1} delay={1000} />
                <span className="text-lg text-slate-400 font-normal">/yr</span>
              </div>
              <p className="text-slate-500 text-sm mt-auto">
                ~129.9K online SMBs — <span className="text-primary font-medium">1% penetration</span>
              </p>
            </div>
          </div>
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
