import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "../slideAnimations";
import { ElixaMascot } from "@/components/ElixaMascot";
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
  { icon: TrendingUp, label: "Growth & Marketing", percent: 30 },
  { icon: Users, label: "Operations", percent: 20 },
];

export const TeamAskSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-team-ask">
      {/* Light background with gradient to primary */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-primary/10" />
      
      {/* Accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Team */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-medium">The Team</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
                Meet the Founder
              </h2>
              
              {team.map((member, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>
                      <p className="text-primary mb-3">{member.role}</p>
                      <p className="text-slate-600 mb-4">{member.bio}</p>
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

            {/* Right: The Ask */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <span className="text-purple-600 text-sm uppercase tracking-widest mb-4 block font-medium">The Ask</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
                Pre-Seed Round
              </h2>
              
              <div className="bg-gradient-to-br from-primary/10 to-purple-100 border border-primary/30 rounded-2xl p-8 mb-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-slate-900 mb-2">£250k</div>
                  <p className="text-slate-600">Target Raise</p>
                </div>
                
                <h4 className="text-slate-900 font-semibold mb-4">Use of Funds</h4>
                <div className="space-y-4">
                  {useOfFunds.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <item.icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-900">{item.label}</span>
                          <span className="text-slate-600">{item.percent}%</span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="flex-1">
                  <Button size="lg" className="w-full text-lg">
                    <Mail className="w-5 h-5 mr-2" />
                    Get in Touch
                  </Button>
                </Link>
                <Link to="/chat" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full text-lg border-slate-300 hover:bg-slate-100">
                    Try Elixa
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
