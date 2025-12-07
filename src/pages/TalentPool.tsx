import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Sparkles, TrendingUp, Clock, Filter, X, SlidersHorizontal, Star, ChevronDown, ChevronUp } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AgentCard } from "@/components/AgentCard";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  plugins?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentCount?: number;
}

type SortOption = "popular" | "rating" | "reviews" | "newest" | "name";

const TalentPool = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [displayedCount, setDisplayedCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Collapsible states
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [ratingsOpen, setRatingsOpen] = useState(true);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);

  // Popular searches - trending categories and top capabilities
  const popularSearches = useMemo(() => {
    const searches: { type: 'category' | 'capability' | 'trending'; value: string; count: number }[] = [];
    
    // Top 4 categories by agent count
    const topCategories = [...categories]
      .filter(c => c.agentCount && c.agentCount > 0)
      .sort((a, b) => (b.agentCount || 0) - (a.agentCount || 0))
      .slice(0, 4);
    
    topCategories.forEach(cat => {
      searches.push({ type: 'category', value: cat.name, count: cat.agentCount || 0 });
    });
    
    // Top 4 capabilities by usage
    const capCounts: Record<string, number> = {};
    agents.forEach(agent => {
      agent.capabilities?.forEach(cap => {
        capCounts[cap] = (capCounts[cap] || 0) + 1;
      });
    });
    
    const topCaps = Object.entries(capCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
    
    topCaps.forEach(([cap, count]) => {
      searches.push({ type: 'capability', value: cap, count });
    });
    
    return searches;
  }, [categories, agents]);

  // Search suggestions based on query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions: { type: 'category' | 'capability' | 'plugin'; value: string; count: number }[] = [];
    
    // Category suggestions
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query) && cat.agentCount) {
        suggestions.push({ type: 'category', value: cat.name, count: cat.agentCount });
      }
    });
    
    // Capability suggestions
    const capCounts: Record<string, number> = {};
    agents.forEach(agent => {
      agent.capabilities?.forEach(cap => {
        if (cap.toLowerCase().includes(query)) {
          capCounts[cap] = (capCounts[cap] || 0) + 1;
        }
      });
    });
    Object.entries(capCounts).forEach(([cap, count]) => {
      suggestions.push({ type: 'capability', value: cap, count });
    });
    
    // Plugin suggestions
    const pluginCounts: Record<string, number> = {};
    agents.forEach(agent => {
      agent.plugins?.forEach(plugin => {
        if (plugin.toLowerCase().includes(query)) {
          pluginCounts[plugin] = (pluginCounts[plugin] || 0) + 1;
        }
      });
    });
    Object.entries(pluginCounts).forEach(([plugin, count]) => {
      suggestions.push({ type: 'plugin', value: plugin, count });
    });
    
    // Sort by count and limit
    return suggestions.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [searchQuery, categories, agents]);

  // Combined suggestions for dropdown (either search results or popular when empty)
  const dropdownSuggestions = useMemo(() => {
    return searchSuggestions.length > 0 ? searchSuggestions : popularSearches;
  }, [searchSuggestions, popularSearches]);

  // Keyboard navigation handler
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || dropdownSuggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < dropdownSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : dropdownSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchQuery(dropdownSuggestions[selectedSuggestionIndex].value);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [showSuggestions, dropdownSuggestions, selectedSuggestionIndex]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: agentsData, error: agentsError } = await supabase
        .from("agents")
        .select(`
          id, name, description, short_description, rating, total_reviews,
          total_installs, image_url, capabilities, category_id, required_credentials,
          agent_categories(id, name, description, icon)
        `)
        .eq("status", "active")
        .or("is_system.is.null,is_system.eq.false")
        .order("total_installs", { ascending: false });

      if (agentsError) console.error("Error fetching agents:", agentsError);

      if (agentsData) {
        setAgents(
          agentsData.map((agent: any) => {
            // Extract plugin names from required_credentials
            const plugins = agent.required_credentials 
              ? Object.keys(agent.required_credentials).map((key: string) => 
                  key.replace(/_/g, ' ').replace(/credentials?$/i, '').trim()
                )
              : [];
            
            return {
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
              plugins,
            };
          })
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

  // Extract all unique capabilities from agents
  const allCapabilities = useMemo(() => {
    const caps = new Set<string>();
    agents.forEach(agent => {
      agent.capabilities?.forEach(cap => caps.add(cap));
    });
    return Array.from(caps).sort();
  }, [agents]);

  // Calculate relevance score for an agent
  const calculateRelevance = (agent: Agent, searchTerms: string[]): number => {
    if (searchTerms.length === 0) return 0;
    
    let score = 0;
    const nameLower = agent.name.toLowerCase();
    const descLower = agent.description.toLowerCase();
    const categoryLower = agent.category.toLowerCase();
    
    searchTerms.forEach(term => {
      // Name matches are highest priority (exact > starts with > contains)
      if (nameLower === term) score += 100;
      else if (nameLower.startsWith(term)) score += 50;
      else if (nameLower.includes(term)) score += 25;
      
      // Category exact match is high priority
      if (categoryLower === term) score += 80;
      else if (categoryLower.includes(term)) score += 40;
      
      // Capability exact match
      if (agent.capabilities?.some(cap => cap.toLowerCase() === term)) score += 60;
      else if (agent.capabilities?.some(cap => cap.toLowerCase().includes(term))) score += 30;
      
      // Plugin match
      if (agent.plugins?.some(p => p.toLowerCase().includes(term))) score += 35;
      
      // Description match (lower priority)
      if (descLower.includes(term)) score += 10;
    });
    
    // Boost popular agents slightly
    score += Math.min((agent.total_installs || 0) / 100, 20);
    score += agent.rating * 2;
    
    return score;
  };

  // Filter and sort agents with relevance scoring
  const filteredAgents = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    let result = agents.filter(agent => {
      // Build searchable content from all agent fields
      const searchableContent = [
        agent.name,
        agent.description,
        agent.short_description || '',
        agent.category,
        ...(agent.capabilities || []),
        ...(agent.plugins || []),
      ].join(' ').toLowerCase();
      
      // Match if ANY search term is found in the searchable content
      const matchesSearch = searchTerms.length === 0 || 
        searchTerms.some(term => searchableContent.includes(term));
      
      // Also match if search query matches category exactly (for category quick filters)
      const matchesCategorySearch = searchQuery && 
        agent.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category);
      const matchesRating = agent.rating >= minRating;
      const matchesCapabilities = selectedCapabilities.length === 0 || 
        selectedCapabilities.some(cap => agent.capabilities?.includes(cap));
      
      return (matchesSearch || matchesCategorySearch) && matchesCategory && matchesRating && matchesCapabilities;
    });

    // If searching, sort by relevance first
    if (searchTerms.length > 0 && sortBy === "popular") {
      result.sort((a, b) => calculateRelevance(b, searchTerms) - calculateRelevance(a, searchTerms));
    } else {
      // Sort by selected option
      switch (sortBy) {
        case "popular":
          result.sort((a, b) => (b.total_installs || 0) - (a.total_installs || 0));
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
        case "reviews":
          result.sort((a, b) => b.total_reviews - a.total_reviews);
          break;
        case "newest":
          result.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }, [agents, searchQuery, selectedCategories, minRating, selectedCapabilities, sortBy]);

  const displayedAgents = filteredAgents.slice(0, displayedCount);

  // Personalized recommendations
  const forYouAgents = useMemo(() => {
    const topRated = [...agents].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const trending = [...agents].sort((a, b) => (b.total_installs || 0) - (a.total_installs || 0)).slice(4, 8);
    return [...topRated, ...trending].slice(0, 8);
  }, [agents]);

  const newAgents = useMemo(() => agents.slice(-6).reverse(), [agents]);

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
  }, [searchQuery, selectedCategories, minRating, selectedCapabilities, sortBy, filteredAgents.length]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability) 
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinRating(0);
    setSelectedCapabilities([]);
    setSortBy("popular");
  };

  const activeFilterCount = selectedCategories.length + (minRating > 0 ? 1 : 0) + selectedCapabilities.length;
  const isFiltering = searchQuery || activeFilterCount > 0;

  // Filter Panel Component
  const FilterPanel = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-6 ${className}`}>
      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Sort By</Label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border">
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-semibold">Categories</span>
          {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <ScrollArea className="h-[200px] pr-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2 py-1.5">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => toggleCategory(category.name)}
                />
                <Label 
                  htmlFor={`cat-${category.id}`} 
                  className="text-sm cursor-pointer flex-1 flex justify-between"
                >
                  <span>{category.name}</span>
                  <span className="text-muted-foreground text-xs">{category.agentCount}</span>
                </Label>
              </div>
            ))}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible open={ratingsOpen} onOpenChange={setRatingsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-semibold">Minimum Rating</span>
          {ratingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{minRating.toFixed(1)}+</span>
          </div>
          <Slider
            value={[minRating]}
            onValueChange={([v]) => setMinRating(v)}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span>5.0</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Capabilities */}
      <Collapsible open={capabilitiesOpen} onOpenChange={setCapabilitiesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-semibold">Capabilities</span>
          {capabilitiesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <ScrollArea className="h-[180px] pr-3">
            {allCapabilities.slice(0, 20).map((capability) => (
              <div key={capability} className="flex items-center space-x-2 py-1.5">
                <Checkbox
                  id={`cap-${capability}`}
                  checked={selectedCapabilities.includes(capability)}
                  onCheckedChange={() => toggleCapability(capability)}
                />
                <Label htmlFor={`cap-${capability}`} className="text-sm cursor-pointer truncate">
                  {capability}
                </Label>
              </div>
            ))}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-x-hidden">
      <TalentPoolNavbar />

      {/* Search Bar - slides up when filtering */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFiltering ? 'py-6' : 'py-0 max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            {/* Gradient glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl blur-lg opacity-60" />
            
            <div className="relative flex items-center gap-2 bg-background/95 backdrop-blur-xl rounded-2xl border-2 border-white/10 p-2 shadow-2xl shadow-black/10">
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFilters} 
                className="h-12 w-12 rounded-xl hover:bg-white/10 shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 relative">
                <Input 
                  placeholder="Search for AI agents..." 
                  className="px-4 h-12 text-base bg-transparent border-0 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleSearchKeyDown}
                />
                
                {/* Suggestions dropdown */}
                {showSuggestions && dropdownSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[100]">
                    {!searchQuery && (
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-white/5 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Searches
                      </div>
                    )}
                    {dropdownSuggestions.map((suggestion, index) => (
                      <button
                        key={`sticky-${suggestion.type}-${suggestion.value}`}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left ${
                          index === selectedSuggestionIndex ? 'bg-white/15' : 'hover:bg-white/10'
                        }`}
                        onMouseDown={() => {
                          setSearchQuery(suggestion.value);
                          setShowSuggestions(false);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            suggestion.type === 'category' ? 'bg-purple-500/20 text-purple-400' :
                            suggestion.type === 'capability' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {suggestion.type}
                          </span>
                          <span className="font-medium">{suggestion.value}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{suggestion.count} agents</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {activeFilterCount > 0 && (
                <Badge className="gap-1 hidden sm:flex bg-gradient-to-r from-rose-500/20 to-purple-500/20 border-white/10">
                  {activeFilterCount} filters
                </Badge>
              )}
              
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-12 w-12 rounded-xl relative border-white/10 bg-white/5">
                    <SlidersHorizontal className="h-5 w-5" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 text-[10px] text-white flex items-center justify-center font-medium">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-background">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button className="h-12 px-5 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hidden sm:flex">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero - Bold & Vibrant - Collapses when searching */}
      <section className={`relative transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFiltering ? 'max-h-0 opacity-0 overflow-hidden py-0' : 'max-h-[800px] opacity-100'}`}>
        {/* Animated gradient background - extends beyond section */}
        <div className="absolute inset-0 -bottom-32 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[300px] bg-gradient-to-t from-purple-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl" />
          {/* Grid pattern overlay - fades out at bottom */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20 lg:py-24">
          {/* Main headline */}
          <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-10">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                The Team That
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Never Sleeps
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Hire AI employees that actually get work done. Your team, reimagined.
            </p>
          </div>
          
          {/* Search bar - Bold style */}
          <div className="relative max-w-2xl mx-auto mb-6 md:mb-8 z-30 px-2 sm:px-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-cyan-500/40 rounded-xl md:rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 bg-background/95 backdrop-blur-xl rounded-xl md:rounded-2xl border-2 border-white/10 p-1.5 md:p-2 shadow-2xl shadow-black/10">
              <div className="flex-1 relative">
                <Input 
                  placeholder="Search for AI agents..." 
                  className="px-3 md:px-5 h-11 md:h-14 text-sm md:text-lg bg-transparent border-0 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleSearchKeyDown}
                />
                
                {/* Suggestions dropdown */}
                {showSuggestions && dropdownSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[100]">
                    {!searchQuery && (
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-white/5 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Searches
                      </div>
                    )}
                    {dropdownSuggestions.map((suggestion, index) => (
                      <button
                        key={`hero-${suggestion.type}-${suggestion.value}`}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left ${
                          index === selectedSuggestionIndex ? 'bg-white/15' : 'hover:bg-white/10'
                        }`}
                        onMouseDown={() => {
                          setSearchQuery(suggestion.value);
                          setShowSuggestions(false);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            suggestion.type === 'category' ? 'bg-purple-500/20 text-purple-400' :
                            suggestion.type === 'capability' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {suggestion.type}
                          </span>
                          <span className="font-medium">{suggestion.value}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{suggestion.count} agents</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-medium rounded-lg md:rounded-xl shadow-lg shadow-purple-500/25 text-sm md:text-base">
                Search
              </Button>
              
              {/* Mobile filter button */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl relative border-white/10">
                    <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 text-[10px] md:text-[11px] text-white flex items-center justify-center font-medium">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-background">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="relative z-10 flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6 px-2 sm:px-0">
            {categories.slice(0, 6).map((category, i) => {
              const colors = [
                "from-rose-500/20 to-rose-500/5 border-rose-500/30 hover:border-rose-500/50",
                "from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50",
                "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/50",
                "from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/50",
                "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50",
                "from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50",
              ];
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.name)}
                  className={`px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full bg-gradient-to-r border backdrop-blur-sm transition-all hover:scale-105 ${colors[i % colors.length]} ${selectedCategories.includes(category.name) ? 'ring-2 ring-white/20' : ''}`}
                >
                  {category.name}
                </button>
              );
            })}
            {categories.length > 6 && (
              <button
                onClick={() => setSearchQuery(" ")}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-all"
              >
                +{categories.length - 6} more
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-700 ${isFiltering ? 'pt-36' : ''}`}>
        <div className={`flex gap-8 ${isFiltering ? '' : ''}`}>
          {/* Desktop Filter Sidebar - Only shown when filtering */}
          {isFiltering && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Filter className="h-4 w-4" />
                  <span className="font-semibold">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
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
                    <h2 className="text-xl font-semibold">
                      {searchQuery ? `Results for "${searchQuery}"` : 'Filtered Results'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredAgents.length} agents found
                    </p>
                  </div>
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="text-center py-16 bg-card/30 rounded-xl border border-border/50">
                    <p className="text-lg text-muted-foreground mb-4">No agents match your criteria</p>
                    <Button onClick={clearFilters}>Clear filters</Button>
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={displayedAgents.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={<div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" /></div>}
                    endMessage={<p className="text-center py-6 text-sm text-muted-foreground">All {filteredAgents.length} agents loaded</p>}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
              <div className="space-y-12">
                {/* For You */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Recommended for You</h2>
                      <p className="text-sm text-muted-foreground">Based on popular choices</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {forYouAgents.map((agent, i) => (
                      <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <AgentCard agent={agent} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Trending */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Trending Now</h2>
                      <p className="text-sm text-muted-foreground">Most installed this week</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {agents.slice(0, 4).map((agent, i) => (
                      <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <AgentCard agent={agent} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* New */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <Clock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">New Arrivals</h2>
                      <p className="text-sm text-muted-foreground">Recently added</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {newAgents.map((agent, i) => (
                      <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <AgentCard agent={agent} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* All */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">All Agents</h2>
                    <span className="text-sm text-muted-foreground">{agents.length} total</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {agents.slice(0, 12).map((agent, i) => (
                      <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                        <AgentCard agent={agent} />
                      </div>
                    ))}
                  </div>
                  {agents.length > 12 && (
                    <div className="text-center mt-8">
                      <Button variant="outline" size="lg" onClick={() => setSearchQuery(" ")}>
                        View All {agents.length} Agents
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
