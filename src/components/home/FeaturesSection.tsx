import { motion } from "framer-motion";
import { Cpu, Shield, Link, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Cpu,
    title: "MCP Native",
    description: "Built for the Model Context Protocol standard. Works with Claude Desktop, Cursor, and any MCP client.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Shield,
    title: "Secure OAuth",
    description: "Enterprise-grade OAuth 2.0 with encrypted credential storage. Your tokens are never exposed.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Link,
    title: "One Connection, Many AIs",
    description: "Connect once and use across all your AI tools. No re-authentication needed.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MessageSquare,
    title: "Built-in AI Chat",
    description: "Don't have an MCP client? Use our built-in AI assistant to interact with your tools directly.",
    color: "from-orange-500 to-rose-600",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Elixa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built from the ground up for the AI-native workflow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
