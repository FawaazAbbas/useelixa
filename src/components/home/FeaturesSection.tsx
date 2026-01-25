import { motion } from "framer-motion";
import { Layout, Shield, Zap, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Layout,
    title: "All-in-One Workspace",
    description: "Tasks, calendar, notes, and AI chat in one unified interface.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "OAuth 2.0 authentication with encrypted credential storage.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "AI That Acts",
    description: "Not just answers — Elixa can create tasks, send emails, and schedule events.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Link,
    title: "30+ Integrations",
    description: "Gmail, Shopify, Stripe, Notion, Calendly, Microsoft, and more.",
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
            Built for the way you actually work
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
