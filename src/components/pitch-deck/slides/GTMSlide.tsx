import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn, defaultViewport, getExportSafeVariants, getExportSafeViewport } from "../slideAnimations";
import { Store, Users, Globe, Megaphone } from "lucide-react";
import { usePDFExportContext } from "../PDFExportContext";

const strategies = [
  {
    icon: Store,
    title: "Shopify First",
    description: "5.5M merchants spending £120/month on apps. Direct integration with their ecosystem.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Users,
    title: "Community-Led",
    description: "Developer marketplace where builders create and monetize AI employees.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Megaphone,
    title: "Content Marketing",
    description: "SEO-optimized guides, templates, and use cases driving organic traffic.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Globe,
    title: "Partnerships",
    description: "Strategic integrations with tools SMEs already use and trust.",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
];

export const GTMSlide = () => {
  const { isExporting } = usePDFExportContext();

  return (
    <section className="pitch-slide pitch-slide-gtm">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-slate-50" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="text-center mb-12"
          >
            <span className="text-purple-600 text-sm uppercase tracking-widest mb-4 block font-medium">Go-to-Market</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              How We'll Win
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Focused wedge strategy targeting high-intent SME segments
            </p>
          </motion.div>

          {/* Strategy grid */}
          <motion.div
            variants={getExportSafeVariants(staggerContainer, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="grid md:grid-cols-2 gap-6"
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                variants={getExportSafeVariants(scaleIn, isExporting)}
                className="bg-white border border-slate-200 rounded-2xl p-8 flex gap-6 shadow-lg shadow-slate-200/50"
              >
                <div className={`w-14 h-14 rounded-2xl ${strategy.bgColor} flex items-center justify-center shrink-0`}>
                  <strategy.icon className={`w-7 h-7 ${strategy.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{strategy.title}</h3>
                  <p className="text-slate-600">{strategy.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Shopify highlight */}
          <motion.div
            variants={getExportSafeVariants(fadeInUp, isExporting)}
            initial={isExporting ? "visible" : "hidden"}
            animate={isExporting ? "visible" : undefined}
            whileInView={isExporting ? undefined : "visible"}
            viewport={isExporting ? undefined : defaultViewport}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <img src="/logos/ShopifyLogo.svg" alt="Shopify" className="h-6 w-auto" />
              <span className="text-green-700 font-medium">64% are small businesses like our target customers</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
