import { motion } from "framer-motion";
import { MessageSquare, CheckSquare, Calendar, FileText, BookOpen, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Ask questions, give commands, get insights — all in natural language",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    description: "Kanban boards, priorities, due dates — with AI that can complete tasks for you",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Manage events and sync with Google Calendar automatically",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Notes",
    description: "Quick notes with rich text, AI can create and search them",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Upload documents for AI to search and reference",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Newspaper,
    title: "Daily Digest",
    description: "Get AI-generated summaries of your emails, tasks, and metrics every morning",
    color: "from-cyan-500 to-blue-600",
  },
];

export const WorkspaceFeaturesSection = () => {
  return (
    <section id="workspace-features" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete workspace powered by AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
