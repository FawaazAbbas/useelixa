import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { Check, X } from "lucide-react";

const competitors = [
  { name: "ChatGPT", hasWorkspace: false, hasIntegrations: false, hasTalentPool: false },
  { name: "N8N", hasWorkspace: false, hasIntegrations: true, hasTalentPool: false },
  { name: "Motion", hasWorkspace: true, hasIntegrations: false, hasTalentPool: false },
  { name: "Sintra AI", hasWorkspace: false, hasIntegrations: false, hasTalentPool: true },
  { name: "Salesforce Einstein", hasWorkspace: true, hasIntegrations: true, hasTalentPool: false },
  { name: "Elixa", hasWorkspace: true, hasIntegrations: true, hasTalentPool: true, isUs: true },
];

const Feature = ({ has, isUs }: { has: boolean; isUs?: boolean }) => {
  if (has) {
    return <Check className={`w-5 h-5 ${isUs ? 'text-primary' : 'text-green-500'}`} />;
  }
  return <X className="w-5 h-5 text-slate-300" />;
};

export const CompetitionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-competition">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-12"
          >
            <span className="text-orange-500 text-sm uppercase tracking-widest mb-4 block font-medium">Competition</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
              The Landscape
            </h2>
          </motion.div>

          {/* Comparison table */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 text-slate-500 font-medium">Company</th>
                  <th className="text-center p-4 text-slate-500 font-medium">Workspace</th>
                  <th className="text-center p-4 text-slate-500 font-medium">90+ Integrations</th>
                  <th className="text-center p-4 text-slate-500 font-medium">AI Talent Pool</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <motion.tr
                    key={index}
                    variants={scaleIn}
                    className={`border-b border-slate-100 ${competitor.isUs ? 'bg-primary/5' : ''}`}
                  >
                    <td className={`p-4 font-medium ${competitor.isUs ? 'text-primary' : 'text-slate-900'}`}>
                      {competitor.name}
                      {competitor.isUs && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">Us</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <Feature has={competitor.hasWorkspace} isUs={competitor.isUs} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <Feature has={competitor.hasIntegrations} isUs={competitor.isUs} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <Feature has={competitor.hasTalentPool} isUs={competitor.isUs} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Highlight */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center text-xl text-slate-500 mt-8"
          >
            Only <span className="text-primary font-semibold">Elixa</span> combines all three
          </motion.p>
        </div>
      </div>
    </section>
  );
};
