import { useState, useEffect, useCallback } from "react";
import { Star, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AgentCard } from "@/components/AgentCard";
import { FeaturedAgentCard } from "@/components/FeaturedAgentCard";
import { StaffPickCard } from "@/components/StaffPickCard";
import { TrendingAgentRow } from "@/components/TrendingAgentRow";
import { CategoryShowcaseCard } from "@/components/CategoryShowcaseCard";
import { CollectionCard } from "@/components/CollectionCard";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Hero section with clearer layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 mr-1.5" />
              500+ Free AI Agents
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              Your AI Talent Pool
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover and hire AI agents for any task. All completely free, forever.
            </p>
            
            {/* Prominent search bar */}
            <div className="relative max-w-2xl mx-auto pt-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search agents (e.g., 'customer support', 'marketing')..." 
                  className="pl-12 pr-4 py-6 text-base border-2 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick category filters below search */}
            {!searchQuery && !selectedCategory && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-1">Popular:</span>
                {mockCategories.slice(0, 5).map((category) => (
                  <Button
                    key={category.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="text-xs"
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">500+ Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.8 Avg Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="font-medium">All Free Forever</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-20 md:pb-12">
        {!searchQuery && !selectedCategory ? (
          <div className="space-y-12">
            {/* Browse by Category - More prominent */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">Browse by Category</h2>
                  <p className="text-sm text-muted-foreground">Find the perfect agent for your needs</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/talent-pool/charts")}>
                  View Top Charts →
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {mockCategories.map((category, idx) => (
                  <Card
                    key={category.name}
                    className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-4 sm:p-5 text-center space-y-2">
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-md`}>
                        {category.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.count} agents
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Collections */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Popular Collections</h2>
                <p className="text-sm text-muted-foreground">Curated bundles for specific needs</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockCollections.map((collection, idx) => (
                  <div key={collection.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <CollectionCard collection={collection} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header with Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {searchQuery ? `Results for "${searchQuery}"` : selectedCategory}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'} found
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  ← Back to Browse
                </Button>
              </div>

              {/* Category filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button 
                  variant={selectedCategory === null ? "default" : "outline"} 
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {mockCategories.map((category) => (
                  <Button 
                    key={category.name} 
                    variant={selectedCategory === category.name ? "default" : "outline"} 
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.icon} {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>

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
                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                  ← Back to Browse
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
          </div>
        )}
      </div>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
