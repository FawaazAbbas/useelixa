import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/AgentCard";
import { useNavigate } from "react-router-dom";

const featuredAgents = [
  {
    id: "1",
    name: "Customer Support Pro",
    description: "Handle customer inquiries with intelligent responses and ticket routing",
    price: 49,
    rating: 4.8,
    reviews: 1240,
    category: "Customer Service",
    image: "customer-support",
  },
  {
    id: "2",
    name: "Content Creator AI",
    description: "Generate blog posts, social media content, and marketing copy instantly",
    price: 39,
    rating: 4.9,
    reviews: 2100,
    category: "Marketing",
    image: "content-creator",
  },
  {
    id: "3",
    name: "Data Analyst Assistant",
    description: "Analyze datasets, create visualizations, and generate insights automatically",
    price: 79,
    rating: 4.7,
    reviews: 890,
    category: "Analytics",
    image: "data-analyst",
  },
  {
    id: "4",
    name: "Email Automator",
    description: "Smart email management with auto-responses and priority filtering",
    price: 29,
    rating: 4.6,
    reviews: 1560,
    category: "Productivity",
    image: "email-automator",
  },
  {
    id: "5",
    name: "Code Review Bot",
    description: "Automated code reviews with best practices and security checks",
    price: 59,
    rating: 4.8,
    reviews: 720,
    category: "Development",
    image: "code-review",
  },
  {
    id: "6",
    name: "Sales Assistant",
    description: "Qualify leads, schedule meetings, and track sales pipelines",
    price: 69,
    rating: 4.7,
    reviews: 980,
    category: "Sales",
    image: "sales-assistant",
  },
];

const categories = [
  "All",
  "Customer Service",
  "Marketing",
  "Analytics",
  "Productivity",
  "Development",
  "Sales",
];

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AgentStore
            </h1>
            <div className="hidden md:flex gap-6">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Discover
              </button>
              <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Categories
              </button>
              <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Top Charts
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/workspace")}
            >
              My Agents
            </Button>
            <Button onClick={() => navigate("/publish")}>
              Publish Agent
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover AI Agents
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Browse thousands of AI agents built by creators worldwide. 
              Deploy them instantly into your workflow.
            </p>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search agents, categories, creators..."
                className="pl-12 h-14 text-lg border-2 focus-visible:ring-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "ghost"}
                className="whitespace-nowrap"
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">Featured Agents</h3>
          <p className="text-muted-foreground">
            Top-rated agents hand-picked by our team
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* Top Charts Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">Top Charts</h3>
          <p className="text-muted-foreground">
            Most popular agents this week
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAgents.slice(0, 3).map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
