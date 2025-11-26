import { useState, useEffect, useCallback } from "react";
import { Star, Search } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
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
  const [displayedCount, setDisplayedCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);

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

  const displayedAgents = filteredAgents.slice(0, displayedCount);

  const loadMore = useCallback(() => {
    if (displayedCount >= filteredAgents.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setDisplayedCount(prev => prev + 12);
    }, 500);
  }, [displayedCount, filteredAgents.length]);

  useEffect(() => {
    setDisplayedCount(12);
    setHasMore(filteredAgents.length > 12);
  }, [searchQuery, selectedCategory, filteredAgents.length]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <img src="/elixa-logo.png" alt="ELIXA" className="h-8 md:h-10 w-auto object-contain transition-all duration-300 hover:scale-110 hover:rotate-6 drop-shadow-lg hover:drop-shadow-2xl cursor-pointer" />
            <div className="hidden lg:flex gap-6">
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
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <Button onClick={() => navigate("/workspace")} variant="outline" size="sm" className="text-xs md:text-sm hidden sm:inline-flex">
                  My Agents
                </Button>
                <Button onClick={() => navigate("/publish")} variant="default" size="sm" className="text-xs md:text-sm">
                  Publish
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default" size="sm" className="text-xs md:text-sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover AI Agents
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
              Browse AI agents built by creators. Deploy instantly.
            </p>
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for agents..." 
                className="pl-10 md:pl-12 py-3 md:py-6 text-base md:text-lg border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-20 md:pb-12">
        <div className="mb-8 md:mb-12 overflow-x-auto">
          <div className="flex gap-2 md:gap-3 pb-3 md:pb-4">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              className="whitespace-nowrap text-xs md:text-sm"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button 
                key={category} 
                variant={selectedCategory === category ? "default" : "outline"} 
                className="whitespace-nowrap text-xs md:text-sm"
                size="sm"
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
          <InfiniteScroll
            dataLength={displayedAgents.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading more agents...</p>
              </div>
            }
            endMessage={
              <p className="text-center py-8 text-muted-foreground">
                You've seen all {filteredAgents.length} agents
              </p>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
