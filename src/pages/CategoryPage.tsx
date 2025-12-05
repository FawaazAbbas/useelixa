import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { mockAgents } from "@/data/mockAgents";
import { mockCategories } from "@/data/mockCategories";
import { AgentCard } from "@/components/AgentCard";

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"popular" | "rated" | "newest">("popular");

  // Find category
  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || "";
  
  const category = mockCategories.find(c => c.name === categoryName);
  
  // Filter agents by category
  const categoryAgents = mockAgents.filter(a => a.category === categoryName);

  // Sort agents
  const sortedAgents = [...categoryAgents].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.total_installs || 0) - (a.total_installs || 0);
      case "rated":
        return b.rating - a.rating;
      case "newest":
        return a.badge === "New" ? -1 : 1;
      default:
        return 0;
    }
  });

  const topRated = [...categoryAgents].sort((a, b) => b.rating - a.rating).slice(0, 3);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category not found</h2>
          <Button onClick={() => navigate("/talent-pool")}>
            Back to AI Talent Pool
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <Button 
            variant="ghost" 
            className="gap-2 text-sm"
            onClick={() => navigate("/talent-pool")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI Talent Pool
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Category Hero */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 md:p-12 mb-12">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl md:text-5xl">
                {category.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{category.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {category.count} AI agents available
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Discover specialized AI agents for {category.name.toLowerCase()}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Top Rated in Category */}
        {topRated.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <h2 className="text-2xl font-bold">Top Rated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRated.map((agent) => (
                <AgentCard key={agent.id} agent={agent as any} />
              ))}
            </div>
          </section>
        )}

        {/* All Agents */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All {category.name} Agents</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortBy === "popular" ? "default" : "outline"}
                  onClick={() => setSortBy("popular")}
                >
                  Most Installed
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "rated" ? "default" : "outline"}
                  onClick={() => setSortBy("rated")}
                >
                  Highest Rated
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "newest" ? "default" : "outline"}
                  onClick={() => setSortBy("newest")}
                >
                  Newest
                </Button>
              </div>
            </div>
          </div>

          {sortedAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No agents found in this category</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
