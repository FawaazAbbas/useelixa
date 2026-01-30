import { motion } from "framer-motion";
import { fadeInUp, scaleIn, staggerContainer, defaultViewport } from "../slideAnimations";
import { MessageSquare, Mail, Calendar, FileText, Settings, Search, Bell, Lightbulb, Users, Puzzle, Layers, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: MessageSquare, label: "Chat" },
  { icon: Mail, label: "Email" },
  { icon: Calendar, label: "Calendar" },
  { icon: FileText, label: "Notes" },
  { icon: Settings, label: "Settings" },
];

const connectedTools = [
  { name: "Shopify", logo: "/logos/ShopifyLogo.svg" },
  { name: "Analytics", logo: "/logos/GoogleDriveLogo.png" },
  { name: "Slack", logo: "/logos/SlackLogo.svg" },
  { name: "QuickBooks", logo: "/logos/QuickBooksLogo.png" },
];

const conversationSteps = [
  {
    role: "user",
    content: "My sales dropped 23% last week. What happened?",
  },
  {
    role: "ai",
    name: "Sales Analyst",
    avatar: "SA",
    avatarGradient: "from-teal-400 to-blue-500",
    content: "I checked your Shopify and Google Analytics. Here's what I found:",
    findings: [
      "Traffic was normal (12,400 visitors)",
      "Conversion dropped from 3.2% to 2.1%",
      "Your bestseller went out of stock on Tuesday",
    ],
    integrations: ["Shopify", "Analytics"],
    followUp: "I've flagged this to your Inventory Manager.",
  },
  {
    role: "ai",
    name: "Inventory Manager",
    avatar: "IM",
    avatarGradient: "from-purple-400 to-pink-500",
    content: "I saw the alert. I've already drafted a restock order and notified your supplier. Want me to send it?",
    integrations: ["Supplier API"],
  },
];

export const ProductSlide = () => {
  return (
    <section className="pitch-slide pitch-slide-product">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-16">
        <div className="max-w-7xl w-full">
          {/* Narrative Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-4"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-semibold">The Proof</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              Watch Elixa Solve a <span className="text-primary">Real Problem</span>
            </h2>
          </motion.div>

          {/* Story Setup */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mb-6"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed text-center">
              One question. Two AI employees. Three integrations. Seconds to an answer.
            </p>
          </motion.div>

          {/* Visual workspace mockup with story conversation */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-300/50 overflow-hidden"
          >
            <div className="flex h-[380px] md:h-[420px]">
              {/* Sidebar */}
              <div className="w-14 md:w-20 bg-slate-900 flex flex-col items-center py-6 gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                {sidebarItems.map((item, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                      index === 0 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="h-12 border-b border-slate-200 flex items-center px-4 md:px-6 gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">Ask Elixa anything...</span>
                  </div>
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>

                {/* Conversation area */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    className="space-y-4"
                  >
                    {/* User message */}
                    <motion.div variants={fadeInUp} className="flex justify-end">
                      <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                        <p className="text-sm">{conversationSteps[0].content}</p>
                      </div>
                    </motion.div>

                    {/* Sales Analyst response */}
                    <motion.div variants={fadeInUp} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${conversationSteps[1].avatarGradient} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-xs font-bold">{conversationSteps[1].avatar}</span>
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm">
                        <p className="text-xs font-semibold text-teal-600 mb-1">{conversationSteps[1].name}</p>
                        <p className="text-sm text-slate-700 mb-2">{conversationSteps[1].content}</p>
                        <ul className="space-y-1 mb-2">
                          {conversationSteps[1].findings?.map((finding, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {conversationSteps[1].integrations?.map((integration, i) => (
                            <span key={i} className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                              {integration}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 italic">{conversationSteps[1].followUp}</p>
                      </div>
                    </motion.div>

                    {/* Inventory Manager response */}
                    <motion.div variants={fadeInUp} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${conversationSteps[2].avatarGradient} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-xs font-bold">{conversationSteps[2].avatar}</span>
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm">
                        <p className="text-xs font-semibold text-purple-600 mb-1">{conversationSteps[2].name}</p>
                        <p className="text-sm text-slate-700">{conversationSteps[2].content}</p>
                        <div className="flex gap-1.5 mt-2">
                          {conversationSteps[2].integrations?.map((integration, i) => (
                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {integration}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Right panel - Connected tools */}
              <div className="w-44 md:w-52 border-l border-slate-200 bg-slate-50 p-4 hidden lg:block">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Connected</h4>
                <div className="space-y-2">
                  {connectedTools.map((tool, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
                      <img src={tool.logo} alt={tool.name} className="w-4 h-4 object-contain" />
                      <span className="text-xs text-slate-700">{tool.name}</span>
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">+86 more</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The Aha Moment Callout */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="max-w-3xl mx-auto mt-6"
          >
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-5 flex gap-4">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base text-slate-700">
                  <span className="font-bold text-slate-900">Notice what happened:</span> You asked ONE question. 
                  TWO AI employees collaborated. They pulled from THREE integrations. 
                  And gave you an <span className="font-semibold">actionable answer in seconds</span>.
                </p>
                <p className="text-sm text-slate-600 mt-2 italic">
                  This is what having a team feels like.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature badges + CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="flex flex-col items-center gap-4 mt-6"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: MessageSquare, label: "AI Team Chats" },
                { icon: Users, label: "Cross Collaboration" },
                { icon: Puzzle, label: "90+ Integrations" },
                { icon: Layers, label: "One Workspace" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-slate-700">{feature.label}</span>
                </div>
              ))}
            </div>

            <Link to="/chat">
              <Button size="lg" className="text-base px-6 py-5 rounded-xl">
                Try it yourself →
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
