import { motion } from "framer-motion";
import { Mail, CheckSquare, Calendar, ShoppingCart, FileSearch, Newspaper } from "lucide-react";

const useCases = [
  {
    icon: Mail,
    title: "Email Intelligence",
    description: "Summarize your inbox, draft responses, find attachments",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: CheckSquare,
    title: "Task Automation",
    description: "Create tasks from conversations, assign work to AI, track progress",
    gradient: "from-purple-500/10 to-violet-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Calendar,
    title: "Calendar Management",
    description: "Schedule meetings, check availability, get agenda summaries",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: ShoppingCart,
    title: "Business Insights",
    description: "Get order updates from Shopify, revenue from Stripe, all via chat",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: FileSearch,
    title: "Document Search",
    description: "Upload files and ask questions about your knowledge base",
    gradient: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Newspaper,
    title: "Daily Briefings",
    description: "Start each day with an AI-curated summary of what needs attention",
    gradient: "from-cyan-500/10 to-blue-500/10",
    iconColor: "text-cyan-500",
  },
];

export const UseCasesSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Elixa Can Do For You</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real examples of how teams use Elixa every day
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl bg-gradient-to-br ${useCase.gradient} border border-border/50 p-6 hover:border-primary/30 transition-colors`}
            >
              <useCase.icon className={`w-10 h-10 ${useCase.iconColor} mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
