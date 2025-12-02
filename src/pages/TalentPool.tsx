import { useState, useEffect, useCallback } from "react";
import { Search, ChevronRight } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AgentCard } from "@/components/AgentCard";
import { FeaturedAgentCard } from "@/components/FeaturedAgentCard";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockAgents, getFeaturedAgents } from "@/data/mockAgents";
import { mockCategories } from "@/data/mockCategories";
import { mockCollections } from "@/data/mockCollections";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Agent {
  id: string;
  name: string;
  description: string;
  rating: number;
  total_reviews: number;
  total_installs?: number;
  category: string;
  image_url: string;
}

const TalentPool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [useMockData] = useState(true); // Use mock data for demo

  useEffect(() => {
    const fetchData = async () => {
      if (useMockData) {
        // Use mock data for demo
        setAgents(mockAgents as any);
        setCategories(mockCategories.map(c => c.name));
        setLoading(false);
        return;
      }

      // Real Supabase data (keep for production)
      const [agentsRes, categoriesRes] = await Promise.all([
        supabase
          .from("agents")
          .select(`
            id,
            name,
            description,
            rating,
            total_reviews,
            total_installs,
            image_url,
            agent_categories(name)
          `)
          .eq("status", "active")
          .eq("is_system", false),
        supabase.from("agent_categories").select("name")
      ]);

      if (agentsRes.data) {
        setAgents(
          agentsRes.data.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            description: agent.description || "",
            rating: agent.rating || 0,
            total_reviews: agent.total_reviews || 0,
            total_installs: agent.total_installs || 0,
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
  }, [useMockData]);

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

  const featuredAgents = useMockData ? getFeaturedAgents() : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Premium navbar with gradient accent */}
      <nav className="border-b border-border/20 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img 
              src="/elixa-logo.png" 
              alt="ELIXA" 
              className="h-8 w-auto object-contain cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => navigate("/")}
            />
            <div className="hidden md:flex gap-6">
              <button className="text-sm font-semibold text-foreground hover:text-primary transition-colors relative group">
                Discover
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
              <button 
                onClick={() => navigate("/talent-pool/charts")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                Charts
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/workspace")} variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-primary/10">
              Workspace
            </Button>
            <Button onClick={() => navigate("/auth")} size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero section - Premium gradient style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Talent Pool
            </h1>
            <p className="text-xl text-muted-foreground/90">
              Discover AI agents for every task
            </p>
          </div>
          
          {/* Enhanced search bar */}
          <div className="mt-10 max-w-2xl">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input 
                  placeholder="Search agents..." 
                  className="pl-12 pr-4 h-14 text-base bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searchQuery && !selectedCategory ? (
          <div className="space-y-12">
            {/* Featured Section */}
            {featuredAgents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Featured</h2>
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-6 pb-4">
                    {featuredAgents.map((agent) => (
                      <div key={agent.id} className="w-[400px] flex-shrink-0">
                        <FeaturedAgentCard agent={agent as any} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {/* Categories Section - Enhanced */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Categories</h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                  See All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {mockCategories.slice(0, 10).map((category, index) => (
                  <Card
                    key={category.name}
                    className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="relative p-6 text-center space-y-3">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform">{category.icon}</div>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Agents - Enhanced */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Popular Agents</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {agents.slice(0, 10).map((agent, index) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="mb-4"
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back
              </Button>
              <h2 className="text-3xl font-bold mb-2">
                {searchQuery ? `"${searchQuery}"` : selectedCategory}
              </h2>
              <p className="text-muted-foreground">
                {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-20 px-4">
                <h3 className="text-2xl font-bold mb-2">No Results</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? `No agents match "${searchQuery}"` : "No agents in this category"}
                </p>
                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                  Browse All Agents
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
                  </div>
                }
                endMessage={
                  <p className="text-center py-8 text-muted-foreground">
                    {filteredAgents.length} agents
                  </p>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {displayedAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        )}
      </div>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
