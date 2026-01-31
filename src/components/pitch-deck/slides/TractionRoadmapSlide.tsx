import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";

const journeySteps = [
  { date: "Dec '24", event: "Waitlist opens", highlight: "3,500+ signups in weeks" },
  { date: "Jan '25", event: "MVP development", highlight: "Core platform built" },
  { date: "Mar '25", event: "Soft launch", highlight: "First paying customers" },
  { date: "May '25", event: "AI marketplace", highlight: "£50k ARR" },
  { date: "Aug '25", event: "Scale milestone", highlight: "10K users • £250k ARR" },
];

export const TractionRoadmapSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-traction-roadmap">
      {/* Minimal background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-20">
        <div className="max-w-4xl w-full">
          {/* Opening narrative */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <span className="text-slate-400 text-sm uppercase tracking-widest mb-4 block">
              The Journey
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 leading-tight mb-6">
              We launched a waitlist in December.
              <br />
              <span className="font-semibold">3,500 businesses signed up.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl">
              Now we're building toward launch—and every milestone brings us closer 
              to a platform that runs alongside thousands of founders.
            </p>
          </motion.div>

          {/* Timeline as narrative flow */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="relative"
          >
            {/* Vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
            
            <div className="space-y-6">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-[3px] ${
                    index < 2 ? 'bg-slate-900' : 'bg-slate-300'
                  }`} />
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                    <span className={`text-sm font-medium min-w-[70px] ${
                      index < 2 ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.date}
                    </span>
                    <span className={`text-lg ${
                      index < 2 ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {step.event}
                    </span>
                    <span className={`text-sm ${
                      index < 2 ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      — {step.highlight}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Closing insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mt-12 pt-8 border-t border-slate-100"
          >
            <p className="text-base text-slate-500 italic">
              "The demand is real. The timeline is aggressive. 
              And we're executing exactly on schedule."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
