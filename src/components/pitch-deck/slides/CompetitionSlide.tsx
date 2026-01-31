import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { Check, X, Star, Lightbulb } from "lucide-react";

const competitors = [
  { name: "ChatGPT", hasWorkspace: false, hasIntegrations: false, hasTalentPool: false, hasAffordable: true },
  { name: "N8N", hasWorkspace: false, hasIntegrations: true, hasTalentPool: false, hasAffordable: true },
  { name: "Motion", hasWorkspace: true, hasIntegrations: false, hasTalentPool: false, hasAffordable: true },
  { name: "Sintra AI", hasWorkspace: false, hasIntegrations: false, hasTalentPool: true, hasAffordable: false },
  { name: "Lindy AI", hasWorkspace: true, hasIntegrations: true, hasTalentPool: true, hasAffordable: false },
  { name: "Salesforce Einstein", hasWorkspace: true, hasIntegrations: true, hasTalentPool: false, hasAffordable: false },
  { name: "Elixa", hasWorkspace: true, hasIntegrations: true, hasTalentPool: true, hasAffordable: true, isUs: true },
];

const Feature = ({ has, isUs }: { has: boolean; isUs?: boolean }) => {
  if (has) {
    return <Check className={`w-5 h-5 ${isUs ? 'text-primary' : 'text-green-500'}`} />;
  }
  return <X className="w-5 h-5 text-slate-300" />;
};

const positioningData = [
  { name: "ChatGPT", x: 25, y: 85, size: "lg" },
  { name: "N8N", x: 20, y: 40, size: "md" },
  { name: "Motion", x: 35, y: 35, size: "md" },
  { name: "Lindy", x: 75, y: 80, size: "md" },
  { name: "Einstein", x: 90, y: 65, size: "sm" },
  { name: "Elixa", x: 22, y: 82, size: "lg", isUs: true },
];

export const CompetitionSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-competition">
      {/* Clean gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-orange-600 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Competition
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Why We Win
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The market is fragmented between expensive enterprise tools and basic free options. 
              Elixa sits in the <span className="font-semibold text-slate-900">sweet spot</span>.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* 2x2 Matrix */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-5 text-center">Market Positioning</h3>
              <div className="relative aspect-square max-w-xs mx-auto">
                {/* Axes */}
                <div className="absolute inset-0">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200"></div>
                  
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Smart</span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic</span>
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 uppercase tracking-wide">Cheap</span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-red-500 uppercase tracking-wide">Expensive</span>
                  
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50/60 rounded-tl-xl"></div>
                </div>
                
                {/* Bubbles */}
                {positioningData.map((comp, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                      comp.isUs 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                        : 'bg-white border border-slate-200 text-slate-700 shadow-md'
                    } rounded-full flex items-center justify-center font-semibold ${
                      comp.size === 'lg' ? 'w-16 h-16 text-xs' : comp.size === 'md' ? 'w-14 h-14 text-xs' : 'w-12 h-12 text-[10px]'
                    }`}
                    style={{ left: `${comp.x}%`, top: `${100 - comp.y}%` }}
                  >
                    {comp.isUs && <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" />}
                    {comp.name}
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 
                  Elixa sits in the <span className="font-semibold text-green-600">sweet spot</span>
                </span>
              </p>
            </motion.div>

            {/* Comparison table */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left p-4 text-slate-500 font-medium">Company</th>
                    <th className="text-center p-3 text-slate-500 font-medium">Workspace</th>
                    <th className="text-center p-3 text-slate-500 font-medium">90+ Integrations</th>
                    <th className="text-center p-3 text-slate-500 font-medium">AI Talent Pool</th>
                    <th className="text-center p-3 text-slate-500 font-medium">Affordable</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => (
                    <motion.tr
                      key={index}
                      variants={scaleIn}
                      className={`border-b border-slate-100 ${competitor.isUs ? 'bg-primary/5' : ''}`}
                    >
                      <td className={`p-3 font-medium ${competitor.isUs ? 'text-primary' : 'text-slate-900'}`}>
                        {competitor.name}
                        {competitor.isUs && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Us</span>}
                      </td>
                      <td className="p-3 text-center"><div className="flex justify-center"><Feature has={competitor.hasWorkspace} isUs={competitor.isUs} /></div></td>
                      <td className="p-3 text-center"><div className="flex justify-center"><Feature has={competitor.hasIntegrations} isUs={competitor.isUs} /></div></td>
                      <td className="p-3 text-center"><div className="flex justify-center"><Feature has={competitor.hasTalentPool} isUs={competitor.isUs} /></div></td>
                      <td className="p-3 text-center"><div className="flex justify-center"><Feature has={competitor.hasAffordable} isUs={competitor.isUs} /></div></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>

          {/* Insight */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-2xl p-5 flex gap-4">
              <Lightbulb className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-semibold text-slate-900">The key insight:</span> Only Elixa combines a unified workspace, 
                  90+ integrations, an AI talent pool, <em>and</em> pricing SMEs can afford. Others force you to choose between capability and cost.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
