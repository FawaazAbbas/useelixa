import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { MessageSquare, CheckSquare, Calendar, FileText, BarChart3, Settings, Users, Download } from "lucide-react";
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
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-6"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-3 block font-semibold">
              The future is finally here
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              <span className="text-primary">We've already built the Elixa demo</span>
            </h2>
          </motion.div>

          {/* Workspace Snapshot - Realistic mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden mb-6"
          >
            <div className="flex h-[340px] md:h-[400px]">
              {/* Nav sidebar */}
              <div className="w-12 md:w-14 bg-slate-900 flex flex-col items-center py-4 gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                {[MessageSquare, CheckSquare, Calendar, FileText, BarChart3, Settings].map((Icon, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>

              {/* Teams sidebar */}
              <div className="w-44 md:w-52 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">Baduss Technologies</p>
                      <p className="text-[10px] text-slate-500">Premium Plan</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-2 overflow-hidden">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">Teams</p>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Marketing</span>
                    </div>
                    {["Product", "Customer Service", "Finance", "Development"].map((team, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs">{team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Marketing Team</p>
                      <p className="text-[10px] text-slate-500">6 members • Group chat</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 overflow-hidden space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <div className={`w-7 h-7 rounded-full ${msg.avatar} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-[10px] font-bold">{msg.sender[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-slate-900">{msg.sender}</span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                          {msg.content}
                        </p>
                        {msg.hasFile && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-slate-100 rounded-lg px-2 py-1">
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{msg.fileName}</span>
                            <Download className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-200">
                  <div className="bg-slate-100 rounded-lg px-3 py-2 flex items-center">
                    <span className="text-xs text-slate-400">Message Marketing Team...</span>
                  </div>
                </div>
              </div>

              {/* Right panel - Team info */}
              <div className="w-48 md:w-56 border-l border-slate-200 bg-white p-3 hidden lg:block">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Marketing Team</p>
                    <p className="text-[10px] text-slate-500">6 members • 5 online</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-[11px] text-slate-600">
                    Drives brand awareness, customer acquisition, and revenue growth
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Team Members</p>
                  <div className="space-y-2">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center`}>
                          <span className="text-white text-[8px] font-bold">{member.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-slate-900 truncate">{member.name}</p>
                          <p className="text-[9px] text-slate-500">{member.role}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      </div>
                    ))}
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
            className="text-center text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6"
          >
            A unified workspace where AI employees collaborate, share context, and connect to 90+ tools—all working
            together for your business.
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
