import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
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

const marketData = [
  { label: "TAM", value: "£129.6B/yr", description: "~216M digitally-native SMBs @ £50/mo", color: "teal" },
  { label: "SAM", value: "£7.79B/yr", description: "~12.99M online SMBs globally", color: "blue" },
  { label: "SOM", value: "£77.9M/yr", description: "1% market penetration target", color: "primary" },
];

export const MarketSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-market">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-teal-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Market Opportunity
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              A Market That's Already Moving
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The global wave of digital-native SMBs isn't waiting for tomorrow—they're already investing in tools 
              that make them faster, leaner, and more competitive. With millions of these businesses now spending 
              monthly on SaaS solutions, they're actively shaping a market worth tens of billions.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-10">
            {/* TAM SAM SOM Visual */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex justify-center"
            >
              <div className="relative">
                {/* TAM Circle */}
                <motion.div
                  variants={scaleIn}
                  className="w-64 h-64 md:w-72 md:h-72 rounded-full border-2 border-teal-300 flex items-center justify-center bg-teal-50/50"
                >
                  {/* SAM Circle */}
                  <motion.div
                    variants={scaleIn}
                    className="w-48 h-48 md:w-52 md:h-52 rounded-full border-2 border-blue-300 flex items-center justify-center bg-blue-50/50"
                  >
                    {/* SOM Circle */}
                    <motion.div
                      variants={scaleIn}
                      className="w-32 h-32 md:w-36 md:h-36 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10"
                    >
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          £<AnimatedCounter end={77.9} suffix="M" />
                        </div>
                        <div className="text-primary font-semibold text-sm">SOM</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Labels */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    TAM: £<AnimatedCounter end={129.6} suffix="B" />
                  </span>
                </div>
                <div className="absolute top-20 -right-2">
                  <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    SAM: £<AnimatedCounter end={7.79} suffix="B" />
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Breakdown Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="space-y-4"
            >
              {marketData.map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.color === 'teal' ? 'bg-teal-500' : 
                      item.color === 'blue' ? 'bg-blue-500' : 'bg-primary'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-900 text-lg">{item.label}:</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Shopify Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Our Benchmark: Shopify Merchants</h3>
                  <p className="text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">5.5 million customers</span> spending
                    <span className="font-semibold text-slate-800"> $120/month on apps</span>, with
                    <span className="font-semibold text-slate-800"> 64% being small businesses</span>—contributing{" "}
                    <span className="font-semibold text-green-600">$7.9B annually</span> to Shopify's ecosystem.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-green-200">
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
