import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingUp, Building2, ShoppingBag } from "lucide-react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
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
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const MarketSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-market">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-12">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">
              Market Opportunity
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Significant Growth Opportunity
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The AI software and SMB tools market represents a massive, fast-growing opportunity with hundreds of
              millions of potential customers.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* TAM SAM SOM - Left Side */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {/* TAM */}
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={defaultViewport}
                  className="w-60 h-60 md:w-72 md:h-72 rounded-full border-2 border-teal-300 flex items-center justify-center bg-teal-50/50"
                >
                  {/* SAM */}
                  <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    className="w-44 h-44 md:w-52 md:h-52 rounded-full border-2 border-blue-300 flex items-center justify-center bg-blue-50/50"
                  >
                    {/* SOM */}
                    <motion.div
                      variants={scaleIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={defaultViewport}
                      className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10"
                    >
                      <div className="text-center">
                        <div className="text-base md:text-lg font-bold text-slate-900">
                          £<AnimatedCounter end={7.79} suffix="M" />
                        </div>
                        <div className="text-primary font-semibold text-xs">SOM</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* TAM Label */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                  TAM: £<AnimatedCounter end={129.6} suffix="B" />
                </div>

                {/* SAM Label */}
                <div className="absolute top-16 -right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  SAM: £<AnimatedCounter end={7.79} suffix="B" />
                </div>
              </div>
            </motion.div>

            {/* Breakdown - Right Side */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="space-y-3"
            >
              <motion.div
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="font-bold text-slate-900">TAM: £129.6B/yr</span>
                  <span className="text-xs text-slate-400">(2026)</span>
                </div>
                <p className="text-slate-600 text-sm">
                  ~216M digitally-native SMBs — businesses with an online presence
                </p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-900">SAM: £7.79B/yr</span>
                  <span className="text-xs text-slate-400">(2026)</span>
                </div>
                <p className="text-slate-600 text-sm">
                  ~12.98M e-commerce SMBs — businesses based around selling online goods
                </p>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-bold text-slate-900">SOM: £77.9MM/yr</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">1% of SAM</span>
                </div>
                <p className="text-slate-600 text-sm">~129.9K customers — achievable within 5 years</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Shopify Insight Section */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Our Benchmark: Shopify Merchants</h3>
                  <p className="text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">5.5 million customers</span> spending
                    <span className="font-semibold text-slate-800"> $120/month on apps</span>, with
                    <span className="font-semibold text-slate-800"> 64% being small businesses</span>— contributing{" "}
                    <span className="font-semibold text-green-600">$7.9B annually</span> to Shopify's ecosystem. This is
                    our primary target segment.
                  </p>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">5.5M</div>
                  <div className="text-xs text-slate-500">Shopify Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">$120</div>
                  <div className="text-xs text-slate-500">Monthly App Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$7.9B</div>
                  <div className="text-xs text-slate-500">Annual Revenue</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
