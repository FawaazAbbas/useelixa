import { useState, useEffect } from "react";
import { Star, Search } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  total_reviews: number;
  category: string;
  image_url: string;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [agentsRes, categoriesRes] = await Promise.all([
        supabase
          .from("agents")
          .select(`
            id,
            name,
            description,
            price,
            rating,
            total_reviews,
            image_url,
            agent_categories(name)
          `)
          .eq("status", "active"),
        supabase.from("agent_categories").select("name")
      ]);

      if (agentsRes.data) {
        setAgents(
          agentsRes.data.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            description: agent.description || "",
            price: agent.price || 0,
            rating: agent.rating || 0,
            total_reviews: agent.total_reviews || 0,
            category: agent.agent_categories?.name || "Uncategorized",
            image_url: agent.image_url || ""
          }))
        );
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data.map((c: any) => c.name));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter agents based on search and category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchQuery === "" || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredAgents = filteredAgents.slice(0, 4);
  const topAgents = filteredAgents.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              ELIXA
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
          <div className="flex gap-4">
            {user ? (
              <>
                <Button onClick={() => navigate("/workspace")} variant="outline">
                  My Agents
                </Button>
                <Button onClick={() => navigate("/publish")} variant="default">
                  Publish Agent
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for agents..." 
                className="pl-12 py-6 text-lg border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 overflow-x-auto">
          <div className="flex gap-3 pb-4">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button 
                key={category} 
                variant={selectedCategory === category ? "default" : "outline"} 
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? `No agents match "${searchQuery}"` : "No agents available in this category"}
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                Featured Agents
              </h2>
              {featuredAgents.length === 0 ? (
                <p className="text-muted-foreground">No featured agents available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Top Charts</h2>
              {topAgents.length === 0 ? (
                <p className="text-muted-foreground">No top agents available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {topAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
