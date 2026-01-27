import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Code } from "lucide-react";

const competitors = [
  {
    name: "Private Developers",
    price: "£500+",
    caption: "EXPENSIVE",
    captionColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    logo: null,
    icon: Code,
    iconColor: "text-red-500",
  },
  {
    name: "N8N",
    price: "£24/month",
    caption: "DIY SOLUTION",
    captionColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    logo: "/logos/n8nLogo.png",
    icon: null,
    iconColor: null,
  },
  {
    name: "Motion",
    price: "£35/month",
    caption: "NOT VERY SMART",
    captionColor: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    logo: "https://assets.usemotion.com/website-assets-v2/logo/motion-logo.svg",
    icon: null,
    iconColor: null,
  },
];

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="max-w-6xl w-full text-center">
          {/* Question */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-8"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">The Promise</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              The solution?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                AI employees
              </span>
            </h2>
          </motion.div>

          {/* But... */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="mb-12"
          >
            <p className="text-2xl md:text-3xl text-slate-500">But where are they? What are the options?</p>
          </motion.div>

          {/* Competitor comparison boxes */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {competitors.map((comp, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`${comp.bgColor} border-2 ${comp.borderColor} rounded-2xl p-6 text-center shadow-lg`}
              >
                {/* Logo or Icon */}
                <div className="h-16 flex items-center justify-center mb-4">
                  {comp.logo ? (
                    <img 
                      src={comp.logo} 
                      alt={`${comp.name} logo`} 
                      className="h-12 w-auto object-contain"
                    />
                  ) : comp.icon ? (
                    <div className={`w-14 h-14 rounded-xl ${comp.bgColor} border ${comp.borderColor} flex items-center justify-center`}>
                      <comp.icon className={`w-7 h-7 ${comp.iconColor}`} />
                    </div>
                  ) : null}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-3">{comp.name}</h3>
                <div className={`text-3xl font-bold ${comp.captionColor} mb-4`}>{comp.price}</div>
                
                {/* Prominent caption */}
                <div className={`${comp.bgColor} border ${comp.borderColor} rounded-lg py-2 px-4 inline-block`}>
                  <p className={`text-lg font-bold uppercase tracking-wide ${comp.captionColor}`}>
                    "{comp.caption}"
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
