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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Glassmorphic navbar */}
      <nav className="border-b border-white/10 bg-background/40 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
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
            <Button onClick={() => navigate("/workspace")} variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-white/10 backdrop-blur-sm">
              Workspace
            </Button>
            <Button onClick={() => navigate("/auth")} size="sm" className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all backdrop-blur-sm">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero section - Search-first with glassmorphic design */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              AI Talent Pool
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and connect with AI agents tailored to your needs
            </p>
          </div>
          
          {/* Glassmorphic search card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-background/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] p-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground/60" />
                <Input 
                  placeholder="Search for AI agents..." 
                  className="pl-16 pr-6 h-16 text-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 rounded-xl shadow-inner focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Quick filter chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/80 dark:hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searchQuery && !selectedCategory ? (
          <div className="space-y-16">
            {/* Featured Section - Large hero cards */}
            {featuredAgents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured Agents</h2>
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-8 pb-4">
                    {featuredAgents.map((agent) => (
                      <div key={agent.id} className="w-[500px] flex-shrink-0">
                        <FeaturedAgentCard agent={agent as any} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {/* Browse by Category */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Browse by Category</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {mockCategories.slice(0, 12).map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/5 backdrop-blur-xl border border-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 group-hover:from-primary/20 group-hover:to-accent/20 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative space-y-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform">{category.icon}</div>
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Agents - Compact grid */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">All Agents</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-white/10">
                    Most Popular
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-white/10">
                    Highest Rated
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {agents.slice(0, 24).map((agent, index) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header - Glassmorphic */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mb-4 hover:bg-white/50 dark:hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Browse
                </Button>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {searchQuery ? `Search: "${searchQuery}"` : selectedCategory}
                </h2>
                <p className="text-muted-foreground">
                  {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} found
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-md opacity-50 animate-pulse" />
                  <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-primary"></div>
                </div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="relative max-w-md mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-30" />
                  <div className="relative bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
                    <h3 className="text-2xl font-bold mb-2">No Results</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? `No agents match "${searchQuery}"` : "No agents in this category"}
                    </p>
                    <Button 
                      onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                      className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
                    >
                      Browse All Agents
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={displayedAgents.length}
                next={loadMore}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-8">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-md opacity-50 animate-pulse" />
                      <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-primary"></div>
                    </div>
                  </div>
                }
                endMessage={
                  <p className="text-center py-8 text-muted-foreground">
                    Showing all {filteredAgents.length} agents
                  </p>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
