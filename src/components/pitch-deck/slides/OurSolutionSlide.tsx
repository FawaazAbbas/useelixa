import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { ElixaMascot } from "@/components/ElixaMascot";
import { ElixaLogo } from "@/components/ElixaLogo";
import { Users, Layers, Code } from "lucide-react";

const roles = [
  "Bookkeeper",
  "Google PPC Marketer",
  "SEO Analyst",
  "Customer Support Agent",
  "Tax & Audit Supervisor",
];

export const OurSolutionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-our-solution">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20" />
      
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Hero section with Logo + Mascot */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            {/* Logo and Mascot Row */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <ElixaLogo size="xl" />
              <ElixaMascot pose="celebrating" size="xl" animation="float" />
            </div>
            
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-medium">Our Solution</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              AI Employee{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Talent Pool
              </span>
              {" "}+ Workspace
            </h2>
            <p className="text-2xl md:text-3xl text-slate-500">
              Think <span className="text-slate-900 font-semibold">"Slack + App Store"</span>
            </p>
          </motion.div>

          {/* Three columns */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Made by Private Developers */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg shadow-slate-200/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                <Code className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Made by Private Developers</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Expert developers build specialized AI employees. Same quality as custom development, 
                at a fraction of the cost.
              </p>
            </motion.div>

            {/* Talent Pool */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg shadow-slate-200/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Role-Specific AI Employees</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                Built for specific roles in your business:
              </p>
              <div className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Unified Workspace */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg shadow-slate-200/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Unified Workspace</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                All your AI employees work together in one workspace. They collaborate, 
                share context, and connect to 90+ tools seamlessly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
