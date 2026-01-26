import { motion } from "framer-motion";
import { fadeInUp, scaleIn, defaultViewport } from "../slideAnimations";
import { MessageSquare, Users, Puzzle, Layers, Mail, Calendar, FileText, Bell, Settings, Search } from "lucide-react";
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
  { name: "Slack", logo: "/logos/SlackLogo.svg" },
  { name: "Shopify", logo: "/logos/ShopifyLogo.svg" },
  { name: "Gmail", logo: "/logos/GoogleDriveLogo.png" },
  { name: "Notion", logo: "/logos/NotionLogo.svg" },
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
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm uppercase tracking-widest mb-4 block font-medium">Product</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              The Complete AI Workspace
            </h2>
          </motion.div>

          {/* Visual workspace mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-300/50 overflow-hidden"
          >
            <div className="flex h-[400px] md:h-[450px]">
              {/* Sidebar */}
              <div className="w-16 md:w-20 bg-slate-900 flex flex-col items-center py-6 gap-4">
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
                <div className="h-14 border-b border-slate-200 flex items-center px-6 gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">Ask Elixa anything...</span>
                  </div>
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>

                {/* Chat area */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="space-y-4">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                        <p className="text-sm">Analyze last week's sales and create a report</p>
                      </div>
                    </div>
                    {/* AI response */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm">
                        <p className="text-sm text-slate-700">I'll analyze your Shopify sales data from last week. Give me a moment to pull the data...</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">📊 Shopify</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">📈 Analytics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel - Connected tools */}
              <div className="w-48 md:w-56 border-l border-slate-200 bg-slate-50 p-4 hidden lg:block">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Connected Tools</h4>
                <div className="space-y-3">
                  {connectedTools.map((tool, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-200">
                      <img src={tool.logo} alt={tool.name} className="w-5 h-5 object-contain" />
                      <span className="text-sm text-slate-700">{tool.name}</span>
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">+86 more integrations</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature badges */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {[
              { icon: MessageSquare, label: "AI Team Chats" },
              { icon: Users, label: "Cross Collaboration" },
              { icon: Puzzle, label: "90+ Integrations" },
              { icon: Layers, label: "One Workspace" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-slate-700">{feature.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            className="text-center mt-8"
          >
            <Link to="/chat">
              <Button size="lg" className="text-lg px-8 py-6 rounded-xl">
                See it in action →
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
