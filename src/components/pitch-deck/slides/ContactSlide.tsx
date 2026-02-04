import { motion } from "framer-motion";
import { fadeInUp } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Mail, Globe, ExternalLink } from "lucide-react";

export const ContactSlide = () => {
  return (
    <SlideShell background="gradient">
      {/* H1 - centered */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 flex flex-col items-center justify-center pt-16"
      >
        <h2 className="pitch-h1 text-center mb-4">
          Let's Talk
        </h2>
        <p className="pitch-body text-center max-w-xl">
          Ready to transform your business with AI employees?
        </p>
      </motion.div>

      {/* Contact card - centered */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-start-4 md:col-span-6 flex justify-center"
      >
        <div className="pitch-card w-full max-w-md text-center">
          {/* Email */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-500">Email</p>
              <a 
                href="mailto:hello@useelixa.com" 
                className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors"
              >
                hello@useelixa.com
              </a>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-500">Website</p>
              <a 
                href="https://useelixa.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors flex items-center gap-1"
              >
                useelixa.com
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500 mb-3">Scan to join the waitlist</p>
            <div className="w-28 h-28 mx-auto bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
              <span className="text-xs text-slate-400">QR Code</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer strip */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 flex items-end justify-center pb-4"
      >
        <div className="flex items-center gap-4 text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-sm">Thank you for your time</span>
        </div>
      </motion.div>
    </SlideShell>
  );
};
