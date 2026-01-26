import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";

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

export const MarketSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-market">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(220,40%,8%)] to-[hsl(200,35%,10%)]" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-16"
          >
            <span className="text-teal-400 text-sm uppercase tracking-widest mb-4 block">Market Opportunity</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Massive & Growing
            </h2>
          </motion.div>

          {/* TAM SAM SOM */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* TAM */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="relative"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-teal-500/30 flex items-center justify-center bg-teal-500/5">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    $<AnimatedCounter end={150} suffix="B" />
                  </div>
                  <div className="text-teal-400 font-semibold">TAM</div>
                  <div className="text-muted-foreground text-sm">Global AI Market</div>
                </div>
              </div>
            </motion.div>

            {/* SAM */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="relative -mt-8 md:mt-0 md:-ml-8"
            >
              <div className="w-48 h-48 md:w-60 md:h-60 rounded-full border-2 border-blue-500/40 flex items-center justify-center bg-blue-500/10">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    $<AnimatedCounter end={25} suffix="B" />
                  </div>
                  <div className="text-blue-400 font-semibold">SAM</div>
                  <div className="text-muted-foreground text-sm">SME AI Tools</div>
                </div>
              </div>
            </motion.div>

            {/* SOM */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="relative -mt-8 md:mt-0 md:-ml-8"
            >
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-primary/50 flex items-center justify-center bg-primary/15">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    $<AnimatedCounter end={500} suffix="M" />
                  </div>
                  <div className="text-primary font-semibold">SOM</div>
                  <div className="text-muted-foreground text-xs">Year 5 Target</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom note */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto"
          >
            The AI productivity tools market is projected to grow at 35% CAGR through 2030
          </motion.p>
        </div>
      </div>
    </section>
  );
};
