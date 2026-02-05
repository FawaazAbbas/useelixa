import { motion } from "framer-motion";
import { fadeInUp } from "../slideAnimations";
import { SlideShell } from "../SlideShell";
import { Linkedin, Twitter, Mail, Code, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const team = [
  {
    name: "Fawaaz Abbas",
    role: "Founder & CEO",
    bio: "Marketing + Programming background. Ex-founder of Linvelles (fashion). Expert in distribution & MVP builds.",
    linkedin: "#",
    twitter: "#",
  },
];

const useOfFunds = [
  { icon: Code, label: "Product Development", percent: 50 },
  { icon: TrendingUp, label: "Growth & Marketing", percent: 20 },
  { icon: Users, label: "Savings", percent: 20 },
  { icon: Users, label: "Operations", percent: 10 },
];

export const TeamAskSlide = () => {
  return (
    <SlideShell background="custom">
      {/* Custom background */}
      <div className="absolute " />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      {/* H1 (cols 1-9) */}
      <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-12 pitch-h1">
        Let's Build the Future Together
      </motion.h2>

      {/* Mission subcopy (cols 1-9) */}
      <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="col-span-12 md:col-span-9 pitch-body">
        We're not just building another AI tool—we're creating the operating system for small businesses.
      </motion.p>

      {/* Left column - Founder story + profile (cols 1-6) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 space-y-4"
      >
        {/* Founder Story Callout */}
        <div className="pitch-card border-l-4 border-primary bg-primary/5">
          <p className="text-sm text-slate-700 leading-relaxed">
            "I've been on both sides—running a small fashion business and building tech. I know the pain of doing
            everything yourself, of paying for tools that don't talk to each other, of wishing you could clone yourself.{" "}
            <span className="font-semibold">Elixa is that clone.</span>"
          </p>
        </div>

        {/* Founder profile */}
        {team.map((member, index) => (
          <div key={index} className="pitch-card">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-slate-600 text-sm mb-3">{member.bio}</p>
                <div className="flex gap-3">
                  <a href={member.linkedin} className="text-slate-400 hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={member.twitter} className="text-slate-400 hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Right column - Raise + Use of funds (cols 7-12) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 md:col-span-6 space-y-4"
      >
        {/* Raise card */}
        <div className="pitch-card bg-gradient-to-br from-primary/10 to-purple-100 border-primary/30">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-slate-900 mb-1">£500k</div>
            <p className="text-slate-600 text-sm">Target Raise</p>
          </div>

          <h4 className="text-slate-900 font-semibold mb-3 text-sm">Use of Funds</h4>
          <div className="space-y-3">
            {useOfFunds.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-900">{item.label}</span>
                    <span className="text-slate-600">{item.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use-of-funds vision card */}
        <div className="pitch-card bg-slate-50 border-l-4 border-slate-400">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Our vision:</span> Become the default operating system for
            small businesses—where every entrepreneur has access to AI employees.
          </p>
        </div>
      </motion.div>

      {/* Optional bottom vision strip / CTAs */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="col-span-12 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/contact">
          <Button size="lg" className="text-base px-8">
            <Mail className="w-5 h-5 mr-2" />
            Get in Touch
          </Button>
        </Link>
        <Link to="/chat">
          <Button size="lg" variant="outline" className="text-base px-8 border-slate-300 hover:bg-slate-100">
            Try Elixa
          </Button>
        </Link>
      </motion.div>
    </SlideShell>
  );
};
