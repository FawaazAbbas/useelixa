import { motion } from "framer-motion";

const integrations = [
  { name: "Gmail", logo: "/logos/GoogleDriveLogo.png" },
  { name: "Slack", logo: "/logos/SlackLogo.svg" },
  { name: "Shopify", logo: "/logos/ShopifyLogo.svg" },
  { name: "Notion", logo: "/logos/NotionLogo.svg" },
  { name: "Stripe", logo: "/logos/StripeLogo.png" },
  { name: "HubSpot", logo: "/logos/HubSpotLogo.svg" },
  { name: "Calendly", logo: "/logos/CalendlyLogo.png" },
  { name: "Jira", logo: "/logos/JiraLogo.svg" },
  { name: "GitHub", logo: "/logos/GitHubLogo.png" },
  { name: "Figma", logo: "/logos/FigmaLogo.png" },
  { name: "Salesforce", logo: "/logos/SalesforceLogo.svg" },
  { name: "QuickBooks", logo: "/logos/QuickBooksLogo.png" },
];

const categories = [
  "Communication",
  "Productivity",
  "E-commerce",
  "CRM",
  "Marketing",
  "Payments",
];

export const IntegrationShowcase = () => {

  return (
    <section id="tool-library" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect All Your Tools</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Elixa integrates with the tools you already use. Connect once, and your AI assistant can access them all.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <span
                key={category}
                className="px-4 py-1.5 rounded-full bg-background text-muted-foreground text-sm font-medium border border-border/50"
              >
                {category}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Logo grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="aspect-square rounded-xl bg-card border border-border/50 flex items-center justify-center p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
