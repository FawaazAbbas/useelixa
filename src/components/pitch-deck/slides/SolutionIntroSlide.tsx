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
    story: "Typically charge around £500 per developer to create an AI agent—very costly for SMEs.",
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
    story: "A DIY solution where you build the AI yourself. Affordable, but unsuitable because most founders lack the necessary technical skills.",
  },
  {
    name: "Motion",
    price: "£35/month",
    caption: "TOO GENERIC",
    captionColor: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    logo: "/logos/MotionLogo.png",
    icon: null,
    iconColor: null,
    story: "The AI agents are merely generic 'marketer' types—not specific enough for detailed tasks like Google Ads or Meta campaigns.",
  },
];

export const SolutionIntroSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-solution-intro">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/30 to-slate-50" />

      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="max-w-6xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-teal-600 text-sm uppercase tracking-widest mb-4 block font-medium">The Promise</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              The solution?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                AI employees
              </span>
            </h2>
          </motion.div>

          {/* Story Text */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              But the availability and realistic options need consideration. Let's look at what's out there...
            </p>
          </motion.div>

          {/* Competitor comparison boxes */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {competitors.map((comp, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`${comp.bgColor} border-2 ${comp.borderColor} rounded-2xl p-6 text-center shadow-lg flex flex-col`}
              >
                {/* Logo or Icon */}
                <div className="h-14 flex items-center justify-center mb-3">
                  {comp.logo ? (
                    <img src={comp.logo} alt={`${comp.name} logo`} className="h-10 w-auto object-contain" />
                  ) : comp.icon ? (
                    <div
                      className={`w-12 h-12 rounded-xl ${comp.bgColor} border ${comp.borderColor} flex items-center justify-center`}
                    >
                      <comp.icon className={`w-6 h-6 ${comp.iconColor}`} />
                    </div>
                  ) : null}
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2">{comp.name}</h3>
                <div className={`text-2xl font-bold ${comp.captionColor} mb-3`}>{comp.price}</div>

                {/* Caption badge */}
                <div className={`${comp.bgColor} border ${comp.borderColor} rounded-lg py-1.5 px-3 inline-block mb-4`}>
                  <p className={`text-sm font-bold uppercase tracking-wide ${comp.captionColor}`}>"{comp.caption}"</p>
                </div>

                {/* Story text */}
                <p className="text-sm text-slate-600 leading-relaxed mt-auto">
                  {comp.story}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
