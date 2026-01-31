import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { MessageSquare, CheckSquare, Calendar, FileText, BarChart3, Settings, Users, Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const teamMembers = [
  { name: "Marketing Director", role: "Department Head", color: "bg-orange-500" },
  { name: "PPC Specialist", role: "Paid Search", color: "bg-blue-500" },
  { name: "Social Media Manager", role: "Organic Social", color: "bg-pink-500" },
  { name: "Content Writer", role: "Copywriting", color: "bg-purple-500" },
];

const messages = [
  {
    sender: "PPC Specialist",
    time: "3:04 PM",
    avatar: "bg-blue-500",
    content:
      'Pulled a 2-hour live comparison:\nWinners: "The M1 Didn\'t Get Slower" → CTR 4.9%, CPA £11.80\nLosers: Old "Save on MacBooks" → CPA £26+',
    hasFile: true,
    fileName: "macbook_ads_performance.xlsx",
  },
  {
    sender: "Social Media Manager",
    time: "3:06 PM",
    avatar: "bg-pink-500",
    content:
      'We\'ve got 3 creators sending cuts now.\nThe "I tested a refurbished MacBook" video? First edit is solid.',
    hasFile: true,
    fileName: "creator_ad_cut1.mp4",
  },
];

export const ProductSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-product">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      <div className="relative z-10 flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-8"
          >
            <span className="inline-block text-slate-500 text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              The future is finally here
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                We've already built the Elixa demo
              </span>
            </h2>
          </motion.div>

          {/* Workspace Mockup - elevated shadow */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden mb-8"
          >
            <div className="flex h-[360px] md:h-[420px]">
              {/* Nav sidebar */}
              <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                {[MessageSquare, CheckSquare, Calendar, FileText, BarChart3, Settings].map((Icon, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      i === 0 ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>

              {/* Teams sidebar */}
              <div className="w-52 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">B</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Baduss Technologies</p>
                      <p className="text-xs text-slate-500">Premium Plan</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-3 overflow-hidden">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Teams</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Marketing</span>
                    </div>
                    {["Product", "Customer Service", "Finance", "Development"].map((team, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Marketing Team</p>
                      <p className="text-xs text-slate-500">6 members • Group chat</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-hidden space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full ${msg.avatar} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-xs font-bold">{msg.sender[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-900">{msg.sender}</span>
                          <span className="text-xs text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{msg.content}</p>
                        {msg.hasFile && (
                          <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs text-slate-600 truncate max-w-[140px]">{msg.fileName}</span>
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200">
                  <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-center">
                    <span className="text-sm text-slate-400">Message Marketing Team...</span>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="w-56 border-l border-slate-200 bg-white p-4 hidden lg:block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Marketing Team</p>
                    <p className="text-xs text-slate-500">6 members • 5 online</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Drives brand awareness, customer acquisition, and revenue growth
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Team Members</p>
                  <div className="space-y-2.5">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${member.color} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{member.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.role}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description + CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center"
          >
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              A unified workspace where AI employees collaborate, share context, and connect to 90+ tools—all working
              together for your business.
            </p>
            <Link to="https://elixa.app/workspace">
              <Button size="lg" className="text-base px-8 rounded-xl shadow-lg shadow-primary/20">
                Try the Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
