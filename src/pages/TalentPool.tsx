import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Sparkles, TrendingUp, Clock, Filter, X } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AgentCard } from "@/components/AgentCard";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Agent {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  rating: number;
  total_reviews: number;
  total_installs?: number;
  category: string;
  image_url: string;
  capabilities?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentCount?: number;
}

const TalentPool = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: agentsData, error: agentsError } = await supabase
        .from("agents")
        .select(`
          id, name, description, short_description, rating, total_reviews,
          total_installs, image_url, capabilities, category_id,
          agent_categories(id, name, description, icon)
        `)
        .eq("status", "active")
        .or("is_system.is.null,is_system.eq.false")
        .order("total_installs", { ascending: false });

      if (agentsError) console.error("Error fetching agents:", agentsError);

      if (agentsData) {
        setAgents(
          agentsData.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            description: agent.description || agent.short_description || "",
            short_description: agent.short_description,
            rating: agent.rating || 0,
            total_reviews: agent.total_reviews || 0,
            total_installs: agent.total_installs || 0,
            category: agent.agent_categories?.name || "Uncategorized",
            image_url: agent.image_url || "/elixa-logo.png",
            capabilities: agent.capabilities || [],
          }))
        );
      }

      const { data: categoriesData } = await supabase
        .from("agent_categories")
        .select("id, name, description, icon")
        .order("name");

      if (categoriesData && agentsData) {
        const categoryCounts = agentsData.reduce((acc: Record<string, number>, agent: any) => {
          const catName = agent.agent_categories?.name;
          if (catName) acc[catName] = (acc[catName] || 0) + 1;
          return acc;
        }, {});

        setCategories(
          categoriesData.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || "",
            icon: cat.icon || "🤖",
            agentCount: categoryCounts[cat.name] || 0,
          }))
        );
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = searchQuery === "" || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.capabilities?.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category);
      return matchesSearch && matchesCategory;
    });
  }, [agents, searchQuery, selectedCategories]);

  const displayedAgents = filteredAgents.slice(0, displayedCount);

  // Personalized "For You" recommendations (mock logic - in real app would use user history)
  const forYouAgents = useMemo(() => {
    // Simulate personalization by mixing top-rated and trending
    const topRated = [...agents].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const trending = [...agents].sort((a, b) => (b.total_installs || 0) - (a.total_installs || 0)).slice(4, 8);
    return [...topRated, ...trending].slice(0, 8);
  }, [agents]);

  // New arrivals (mock - would be sorted by created_at in real app)
  const newAgents = useMemo(() => {
    return agents.slice(-6).reverse();
  }, [agents]);

  const loadMore = useCallback(() => {
    if (displayedCount >= filteredAgents.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => setDisplayedCount(prev => prev + 12), 500);
  }, [displayedCount, filteredAgents.length]);

  useEffect(() => {
    setDisplayedCount(12);
    setHasMore(filteredAgents.length > 12);
  }, [searchQuery, selectedCategories, filteredAgents.length]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const isFiltering = searchQuery || selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <TalentPoolNavbar />

      {/* Hero - Minimal discovery-first */}
      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Find Your Perfect AI Agent
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {agents.length} agents ready to transform your workflow
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-lg opacity-60" />
            <div className="relative flex items-center gap-3 bg-background/80 backdrop-blur-xl rounded-xl border border-border/50 p-2 shadow-2xl shadow-black/5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search agents, capabilities..." 
                  className="pl-12 h-12 text-base bg-transparent border-0 focus-visible:ring-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 w-10 ${showFilters ? 'bg-primary/10 text-primary' : ''}`}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {/* Filter chips */}
            {showFilters && (
              <div className="mt-4 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-border/50 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.name)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        selectedCategories.includes(category.name)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 border-border/50 hover:border-primary/50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />
              <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Loading agents...</p>
          </div>
        ) : isFiltering ? (
          /* Filtered Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Filtered Results'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredAgents.length} agents found
                </p>
              </div>
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>

            {filteredAgents.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">No agents match your criteria</p>
                <Button onClick={clearFilters}>Browse all agents</Button>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={displayedAgents.length}
                next={loadMore}
                hasMore={hasMore}
                loader={<div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" /></div>}
                endMessage={<p className="text-center py-6 text-sm text-muted-foreground">All {filteredAgents.length} agents loaded</p>}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayedAgents.map((agent, i) => (
                    <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                      <AgentCard agent={agent} />
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        ) : (
          /* Discovery Home */
          <div className="space-y-14">
            {/* For You Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Recommended for You</h2>
                  <p className="text-sm text-muted-foreground">Based on popular choices and top ratings</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {forYouAgents.map((agent, i) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Trending Now</h2>
                  <p className="text-sm text-muted-foreground">Most installed this week</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {agents.slice(0, 4).map((agent, i) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </section>

            {/* New Arrivals */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <Clock className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">New Arrivals</h2>
                  <p className="text-sm text-muted-foreground">Recently added agents</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {newAgents.map((agent, i) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </section>

            {/* Browse All */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">All Agents</h2>
                <span className="text-sm text-muted-foreground">{agents.length} total</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {agents.slice(0, 16).map((agent, i) => (
                  <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
              {agents.length > 16 && (
                <div className="text-center mt-10">
                  <Button variant="outline" size="lg" onClick={() => setSearchQuery(" ")}>
                    View All {agents.length} Agents
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
