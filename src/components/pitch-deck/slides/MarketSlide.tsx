import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { TrendingUp, Building2, PieChart, DollarSign } from "lucide-react";

const AnimatedCounter = ({ end, prefix = "", suffix = "", duration = 2 }: { end: number; prefix?: string; suffix?: string; duration?: number }) => {
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

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const supportingStats = [
  { icon: TrendingUp, value: "35%", label: "CAGR", description: "Annual growth rate through 2030" },
  { icon: Building2, value: "50M+", label: "SMEs", description: "Globally needing AI tools" },
  { icon: PieChart, value: "64%", label: "UK SMEs", description: "Of UK businesses are SMEs" },
  { icon: DollarSign, value: "$3.5k", label: "Wasted", description: "Average SaaS waste per SME" },
];

export const MarketSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-market">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">Market Opportunity</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
              Massive & Growing
            </h2>
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
                  className="w-64 h-64 md:w-72 md:h-72 rounded-full border-2 border-teal-300 flex items-center justify-center bg-teal-50/50"
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
                        <div className="text-xl md:text-2xl font-bold text-slate-900">
                          $<AnimatedCounter end={500} suffix="M" />
                        </div>
                        <div className="text-primary font-semibold text-sm">SOM</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                {/* TAM Label */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                  TAM: $<AnimatedCounter end={150} suffix="B" />
                </div>
                
                {/* SAM Label */}
                <div className="absolute top-16 -right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  SAM: $<AnimatedCounter end={25} suffix="B" />
                </div>
              </div>
            </motion.div>

            {/* Breakdown - Right Side */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="space-y-4"
            >
              <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="font-bold text-slate-900">TAM: $150B</span>
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Top-Down</span>
                </div>
                <p className="text-slate-600 text-sm">Global AI Productivity & Automation Tools market. Sourced from Gartner, McKinsey, and CB Insights reports.</p>
              </motion.div>

              <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-900">SAM: $25B</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Focused</span>
                </div>
                <p className="text-slate-600 text-sm">SME AI Tools & Automation segment. Businesses with &lt;500 employees seeking affordable AI solutions.</p>
              </motion.div>

              <motion.div variants={scaleIn} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-bold text-slate-900">SOM: $500M</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Year 5 Target</span>
                </div>
                <p className="text-slate-600 text-sm">Realistic capture rate based on 2% market penetration of UK & US SME segment.</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Supporting Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            {supportingStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm"
              >
                <stat.icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-semibold text-teal-600">{stat.label}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
