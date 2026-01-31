import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "../slideAnimations";
import { ElixaMascot } from "@/components/ElixaMascot";
import { Linkedin, Twitter, Mail, Code, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";
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
  { icon: Code, label: "Product Development", percent: 50, color: "from-primary to-blue-600" },
  { icon: TrendingUp, label: "Growth & Marketing", percent: 30, color: "from-purple-500 to-violet-600" },
  { icon: Users, label: "Operations", percent: 20, color: "from-teal-500 to-cyan-600" },
];

export const TeamAskSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-team-ask">
      {/* Refined gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-primary/10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-10"
          >
            <span className="inline-block text-primary text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              Join Us
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-[1.1]">
              Let's Build the Future Together
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're not just building another AI tool—we're creating the operating system for small businesses.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Founder Story */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> The Founder Story
              </h3>
              
              {/* Quote */}
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-5 mb-6">
                <p className="text-base text-slate-700 leading-relaxed italic">
                  "I've been on both sides—running a small fashion business and building tech. 
                  I know the pain of doing everything yourself, of paying for tools that don't talk to each other, 
                  of wishing you could clone yourself. <span className="font-semibold not-italic">Elixa is that clone.</span>"
                </p>
              </div>
              
              {/* Founder card */}
              {team.map((member, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-primary/20">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                      <p className="text-primary font-medium mb-2">{member.role}</p>
                      <p className="text-slate-600 text-sm mb-4">{member.bio}</p>
                      <div className="flex gap-3">
                        <a href={member.linkedin} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <a href={member.twitter} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors">
                          <Twitter className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Right: The Ask */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-5">Pre-Seed Round</h3>
              
              <div className="bg-gradient-to-br from-primary/10 to-purple-100 border border-primary/20 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-slate-900 mb-1">£250k</div>
                  <p className="text-slate-600">Target Raise</p>
                </div>
                
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Use of Funds</h4>
                <div className="space-y-4">
                  {useOfFunds.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-slate-900 font-medium">{item.label}</span>
                          <span className="text-slate-600 font-semibold">{item.percent}%</span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision */}
              <div className="bg-slate-50 border-l-4 border-slate-400 rounded-r-xl p-4 mb-6">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Our vision:</span> Become the default operating system 
                  for small businesses—where every entrepreneur has access to the AI employees they need.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="flex-1">
                  <Button size="lg" className="w-full text-base rounded-xl shadow-lg shadow-primary/20">
                    <Mail className="w-5 h-5 mr-2" />
                    Get in Touch
                  </Button>
                </Link>
                <Link to="/chat" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full text-base rounded-xl border-slate-300 hover:bg-slate-100">
                    Try Elixa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Mascot */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="absolute bottom-8 left-8 hidden lg:block"
          >
            <ElixaMascot pose="celebrating" size="lg" animation="bounce" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
