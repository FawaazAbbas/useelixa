import { useState, useEffect, useCallback } from "react";
import { Star, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AgentCard } from "@/components/AgentCard";
import { FeaturedAgentCard } from "@/components/FeaturedAgentCard";
import { StaffPickCard } from "@/components/StaffPickCard";
import { TrendingAgentRow } from "@/components/TrendingAgentRow";
import { CategoryShowcaseCard } from "@/components/CategoryShowcaseCard";
import { CollectionCard } from "@/components/CollectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mockAgents, getFeaturedAgents } from "@/data/mockAgents";
import { mockCategories } from "@/data/mockCategories";
import { mockCollections } from "@/data/mockCollections";

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
  const staffPicks = useMockData ? mockAgents.filter(a => a.staffPick) : [];
  const trending = useMockData ? mockAgents.filter(a => a.trendingRank).sort((a, b) => (a.trendingRank || 999) - (b.trendingRank || 999)).slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphic navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-8">
            <img 
              src="/elixa-logo.png" 
              alt="ELIXA" 
              className="h-7 sm:h-8 md:h-10 w-auto object-contain transition-all duration-300 hover:scale-110 hover:rotate-6 drop-shadow-lg hover:drop-shadow-2xl cursor-pointer animate-fade-in touch-manipulation" 
              onClick={() => navigate("/")}
            />
            <div className="hidden lg:flex gap-4 xl:gap-6">
              <button className="text-sm font-medium hover:text-primary transition-all relative group touch-manipulation">
                Discover
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </button>
              <button 
                onClick={() => navigate("/talent-pool/charts")}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-all relative group touch-manipulation"
              >
                Top Charts
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <Button onClick={() => navigate("/workspace")} variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 hidden sm:inline-flex hover:scale-105 transition-transform touch-manipulation">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Workspace</span>
            </Button>
            <Button onClick={() => navigate("/auth")} variant="default" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 hover:scale-105 transition-transform shadow-lg shadow-primary/20 touch-manipulation">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero section with enhanced gradients */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-fade-in text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              500+ AI Agents • All Free
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift bg-300% animate-fade-in px-4">
              Your AI Talent Pool
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in px-4" style={{ animationDelay: '0.1s' }}>
              Hire brilliant AI agents to join your workspace. All completely free, forever. No subscriptions, no hidden costs.
            </p>
            
            {/* Enhanced search bar with glassmorphism */}
            <div className="relative max-w-2xl mx-auto group animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-lg sm:rounded-xl border-2 border-border/50 group-hover:border-primary/50 transition-all duration-300 shadow-xl">
                <Search className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input 
                  placeholder="Search for AI agents..." 
                  className="pl-10 sm:pl-14 pr-3 sm:pr-4 py-5 sm:py-7 text-base sm:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 sm:h-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>500+ Agents</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 Avg Rating</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Picks Section */}
      {staffPicks.length > 0 && !searchQuery && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Staff Picks</h2>
              <p className="text-sm text-muted-foreground">Hand-selected by our team</p>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {staffPicks.map((agent, idx) => (
              <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <StaffPickCard agent={agent as any} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending This Week */}
      {trending.length > 0 && !searchQuery && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Trending This Week</h2>
              <p className="text-sm text-muted-foreground">Most popular agents right now</p>
            </div>
          </div>
          <div className="space-y-3">
            {trending.map((agent, idx) => (
              <TrendingAgentRow key={agent.id} agent={agent as any} rank={idx + 1} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => navigate("/talent-pool/charts")}>
              View All Charts
            </Button>
          </div>
        </section>
      )}

      {/* Popular Collections */}
      {!searchQuery && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Popular Collections</h2>
              <p className="text-sm text-muted-foreground">Curated bundles for specific needs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mockCollections.map((collection, idx) => (
              <div key={collection.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <CollectionCard collection={collection} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories with enhanced design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-24 sm:pb-20 md:pb-12">
        {!searchQuery && !selectedCategory && (
          <div className="mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Browse by Category</h2>
                <p className="text-sm text-muted-foreground">Find the perfect agent for your needs</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {mockCategories.map((category, idx) => (
                <div key={category.name} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <CategoryShowcaseCard 
                    name={category.name}
                    icon={category.icon}
                    count={category.count}
                    description={`Explore ${category.count} specialized agents`}
                    topAgents={mockAgents.filter(a => a.category === category.name).slice(0, 3)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter chips */}
        {(searchQuery || selectedCategory) && (
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Filter by Category</h3>
            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-4 sm:px-0 snap-x snap-mandatory">
                <Button 
                  variant={selectedCategory === null ? "default" : "outline"} 
                  className="whitespace-nowrap hover:scale-105 transition-transform shadow-sm touch-manipulation snap-start h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Agents
                </Button>
                {useMockData ? mockCategories.map((category) => (
                  <Button 
                    key={category.name} 
                    variant={selectedCategory === category.name ? "default" : "outline"} 
                    className="whitespace-nowrap hover:scale-105 transition-transform shadow-sm touch-manipulation snap-start h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <span className="mr-1.5 sm:mr-2">{category.icon}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                    <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-xs">{category.count}</Badge>
                  </Button>
                )) : categories.map((category) => (
                  <Button 
                    key={category} 
                    variant={selectedCategory === category ? "default" : "outline"} 
                    className="whitespace-nowrap hover:scale-105 transition-transform shadow-sm touch-manipulation snap-start h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="hidden sm:block absolute right-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* All Agents Grid */}
        {(searchQuery || selectedCategory) && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold mb-6">
              {searchQuery ? `Search results for "${searchQuery}"` : `All ${selectedCategory || 'Agents'}`}
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading agents...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12 sm:py-20 px-4">
                <div className="text-5xl sm:text-6xl mb-4">🤖</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">No agents found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  {searchQuery ? `No agents match "${searchQuery}"` : "No agents available in this category"}
                </p>
                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }} className="touch-manipulation h-10">
                  Clear filters
                </Button>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={displayedAgents.length}
                next={loadMore}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Loading more agents...</p>
                  </div>
                }
                endMessage={
                  <p className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
                    You've seen all {filteredAgents.length} agents
                  </p>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {displayedAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TalentPool;
