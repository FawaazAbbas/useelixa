import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { ElixaMascot } from "@/components/ElixaMascot";
import { ElixaLogo } from "@/components/ElixaLogo";
import { Users, Layers, Code } from "lucide-react";

const roles = ["Bookkeeper", "Google PPC Marketer", "SEO Analyst", "Customer Support Agent", "Tax & Audit Supervisor"];

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
            className="text-center mb-12"
          >
            {/* Logo and Mascot Row - larger and better spaced */}
            <div className="flex items-center justify-center gap-12 mb-8">
              <div className="flex flex-col items-center">
                <ElixaLogo size={100} />
              </div>
              <div className="h-20 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
              <ElixaMascot pose="celebrating" size="2xl" animation="float" />
            </div>

            <span className="text-primary text-sm uppercase tracking-widest mb-3 block font-semibold">
              Our Solution
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 leading-tight">
              AI Employee Talent Pool + Workspace, We call it
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500"> Elixa</span>.
            </h2>
            <p className="text-2xl md:text-3xl text-slate-500">
              Think <span className="text-slate-900 font-semibold">"Slack + App Store"</span>
            </p>
          </motion.div>

          {/* Three columns - improved design */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Made by Private Developers */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6">
                <Code className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Made by Private Developers</h3>
              <p className="text-slate-600 leading-relaxed">
                Expert developers build specialized AI employees. Same quality as custom development, at a fraction of
                the cost.
              </p>
            </motion.div>

            {/* Talent Pool */}
            <motion.div
              variants={scaleIn}
              className="bg-white border-2 border-primary/20 rounded-3xl p-8 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Specific AI Employees</h3>
                <p className="text-slate-600 leading-relaxed mb-4">Built for specific roles:</p>
                <div className="flex flex-wrap gap-2">
                  {roles.slice(0, 4).map((role, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {role}
                    </span>
                  ))}
                  <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-medium">
                    +more
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Unified Workspace */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-6">
                <Layers className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Unified Workspace</h3>
              <p className="text-slate-600 leading-relaxed">
                All your AI employees work together in one workspace. They collaborate, share context, and connect to
                90+ tools seamlessly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
