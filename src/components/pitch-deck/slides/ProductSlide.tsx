import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { MessageSquare, Mail, Calendar, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ProductSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-product">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-5xl w-full">
          
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-semibold">
              The Proof
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              See Elixa in <span className="text-primary">Action</span>
            </h2>
          </motion.div>

          {/* Workspace Snapshot - Simplified static mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-8"
          >
            <div className="flex h-[320px] md:h-[380px]">
              {/* Simple sidebar */}
              <div className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                {[MessageSquare, Mail, Calendar, FileText].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
              
              {/* Main content - simplified */}
              <div className="flex-1 flex flex-col">
                <div className="h-12 border-b border-slate-200 flex items-center px-6">
                  <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">Ask Elixa anything...</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Your AI team is ready</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8"
          >
            A unified workspace where AI employees collaborate, share context, 
            and connect to 90+ tools—all working together for your business.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center"
          >
            <Link to="/chat">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl">
                Try the Demo →
              </Button>
            </Link>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};
