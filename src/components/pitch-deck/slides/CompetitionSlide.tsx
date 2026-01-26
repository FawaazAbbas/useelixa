import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport } from "../slideAnimations";
import { Check, X, Minus } from "lucide-react";

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
    return <Check className={`w-5 h-5 ${isUs ? 'text-primary' : 'text-green-400'}`} />;
  }
  return <X className="w-5 h-5 text-muted-foreground/50" />;
};

export const CompetitionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-competition">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,30%,6%)] via-[hsl(220,30%,8%)] to-[hsl(240,30%,8%)]" />
      
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
            <span className="text-orange-400 text-sm uppercase tracking-widest mb-4 block">Competition</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              The Landscape
            </h2>
          </motion.div>

          {/* Comparison table */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-muted-foreground font-medium">Company</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">Workspace</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">90+ Integrations</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">AI Talent Pool</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <motion.tr
                    key={index}
                    variants={scaleIn}
                    className={`border-b border-white/5 ${competitor.isUs ? 'bg-primary/10' : ''}`}
                  >
                    <td className={`p-4 font-medium ${competitor.isUs ? 'text-primary' : 'text-white'}`}>
                      {competitor.name}
                      {competitor.isUs && <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded-full">Us</span>}
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
            className="text-center text-xl text-muted-foreground mt-8"
          >
            Only <span className="text-primary font-semibold">Elixa</span> combines all three
          </motion.p>
        </div>
      </div>
    </section>
  );
};
