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

      {/* TAM/SAM/SOM graphic (cols 1-6) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 flex items-center justify-center py-4"
      >
      <div className="relative flex items-center justify-center">
          {/* TAM - Outer ring */}
          <motion.div
            variants={scaleIn}
            className="w-72 h-72 md:w-80 md:h-80 rounded-full border-[3px] border-teal-400 flex items-center justify-center"
          >
            {/* SAM - Middle ring */}
            <motion.div
              variants={scaleIn}
              className="w-52 h-52 md:w-56 md:h-56 rounded-full border-[3px] border-blue-400 flex items-center justify-center"
            >
              {/* SOM - Center */}
              <motion.div
                variants={scaleIn}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-[3px] border-primary flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-slate-900">
                    £<AnimatedCounter end={77.9} suffix="M" decimals={1} delay={1000} />
                  </div>
                  <div className="text-primary font-bold text-xs uppercase tracking-wide">SOM</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* TAM Label - positioned at top of outer ring */}
          <motion.div 
            variants={fadeInUp}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white rounded-xl shadow-md border border-teal-200 px-4 py-2 text-center">
              <div className="text-lg md:text-xl font-bold text-slate-900">
                £<AnimatedCounter end={129.6} suffix="B" decimals={1} delay={600} />
              </div>
              <div className="text-teal-600 font-bold text-xs uppercase tracking-wide">TAM</div>
            </div>
          </motion.div>

          {/* SAM Label - positioned at right of middle ring */}
          <motion.div 
            variants={fadeInUp}
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white rounded-xl shadow-md border border-blue-200 px-4 py-2 text-center">
              <div className="text-lg md:text-xl font-bold text-slate-900">
                £<AnimatedCounter end={7.79} suffix="B" decimals={2} delay={800} />
              </div>
              <div className="text-blue-600 font-bold text-xs uppercase tracking-wide">SAM</div>
            </div>
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
        <motion.div variants={scaleIn} className="pitch-card border-l-4 border-teal-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-slate-900">TAM: £129.6B/yr</span>
          </div>
          <p className="text-slate-600 text-sm">~216M digitally-native SMBs (54% of 400M global SMEs) @ £50/mo</p>
        </motion.div>

        <motion.div variants={scaleIn} className="pitch-card border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-slate-900">SAM: £7.79B/yr</span>
            <span className="text-xs text-slate-400">(2026)</span>
          </div>
          <p className="text-slate-600 text-sm">~12.99M online SMBs (global live stores) @ £50/mo</p>
        </motion.div>

        <motion.div variants={scaleIn} className="pitch-card border-l-4 border-primary bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-slate-900">SOM: £77.9M/yr</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">1% of SAM</span>
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
