import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Users, Layers, Code, AlertCircle } from "lucide-react";

const roles = ["Bookkeeper", "Google PPC Marketer", "SEO Analyst", "Customer Support Agent", "Tax & Audit Supervisor"];

export const OurSolutionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-our-solution">
      {/* Light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20" />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-12">
        <div className="max-w-7xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-semibold">
              Our Solution
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              AI Employee Talent Pool + Workspace
            </h2>
            <p className="text-2xl md:text-3xl text-slate-500">
              Think <span className="text-slate-900 font-semibold">"Slack + App Store"</span> — we call it{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 font-bold">Elixa</span>
            </p>
          </motion.div>

          {/* Context Problem Callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5 flex gap-4">
              <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-semibold text-slate-900">The context problem:</span> Current AI like ChatGPT has limited context—
                  requiring business owners to repeatedly explain their entire business just for minor questions. 
                  Elixa solves this with a <span className="font-semibold">shared knowledge base</span>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Three columns - improved design */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Made by Private Developers */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-5">
                <Code className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Made by Private Developers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Expert developers specializing in niches like marketing, law, and accounting create these AI employees. 
                They view Elixa as a marketing channel for their specialized agents.
              </p>
            </motion.div>

            {/* Talent Pool */}
            <motion.div
              variants={scaleIn}
              className="bg-white border-2 border-primary/20 rounded-3xl p-6 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Role-Specific AI Employees</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Not generic "a marketer" or "a law guy"—highly specific roles. Just like real employees with specializations:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.slice(0, 4).map((role, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {role}
                    </span>
                  ))}
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-medium">
                    +more
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Unified Workspace */}
            <motion.div
              variants={scaleIn}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-5">
                <Layers className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unified Workspace</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                SMEs often have fragmented workspaces—Google Sheets here, notes there. 
                Elixa provides a unified workspace with <span className="font-semibold">90+ integrations</span> to tools like 
                Google Analytics, Slack, QuickBooks, and even HMRC.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
