import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
  X,
  SlidersHorizontal,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
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
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { TypingText } from "@/components/TypingText";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { trackSearch, trackCategoryFilter } from "@/utils/analytics";

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
  const navigate = useNavigate();
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
  const [showWaitlist, setShowWaitlist] = useState(false);

  // Collapsible states
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [ratingsOpen, setRatingsOpen] = useState(true);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);

  // Popular searches - trending categories and top capabilities
  const popularSearches = useMemo(() => {
    const searches: { type: "category" | "capability" | "trending"; value: string; count: number }[] = [];

    // Top 4 categories by agent count
    const topCategories = [...categories]
      .filter((c) => c.agentCount && c.agentCount > 0)
      .sort((a, b) => (b.agentCount || 0) - (a.agentCount || 0))
      .slice(0, 4);

    topCategories.forEach((cat) => {
      searches.push({ type: "category", value: cat.name, count: cat.agentCount || 0 });
    });

    // Top 4 capabilities by usage
    const capCounts: Record<string, number> = {};
    agents.forEach((agent) => {
      agent.capabilities?.forEach((cap) => {
        capCounts[cap] = (capCounts[cap] || 0) + 1;
      });
    });

    const topCaps = Object.entries(capCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    topCaps.forEach(([cap, count]) => {
      searches.push({ type: "capability", value: cap, count });
    });

    return searches;
  }, [categories, agents]);

  // Search suggestions based on query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const suggestions: { type: "category" | "capability" | "plugin"; value: string; count: number }[] = [];

    // Category suggestions
    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(query) && cat.agentCount) {
        suggestions.push({ type: "category", value: cat.name, count: cat.agentCount });
      }
    });

    // Capability suggestions
    const capCounts: Record<string, number> = {};
    agents.forEach((agent) => {
      agent.capabilities?.forEach((cap) => {
        if (cap.toLowerCase().includes(query)) {
          capCounts[cap] = (capCounts[cap] || 0) + 1;
        }
      });
    });
    Object.entries(capCounts).forEach(([cap, count]) => {
      suggestions.push({ type: "capability", value: cap, count });
    });

    // Plugin suggestions
    const pluginCounts: Record<string, number> = {};
    agents.forEach((agent) => {
      agent.plugins?.forEach((plugin) => {
        if (plugin.toLowerCase().includes(query)) {
          pluginCounts[plugin] = (pluginCounts[plugin] || 0) + 1;
        }
      });
    });
    Object.entries(pluginCounts).forEach(([plugin, count]) => {
      suggestions.push({ type: "plugin", value: plugin, count });
    });

    // Sort by count and limit
    return suggestions.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [searchQuery, categories, agents]);

  // Combined suggestions for dropdown (either search results or popular when empty)
  const dropdownSuggestions = useMemo(() => {
    return searchSuggestions.length > 0 ? searchSuggestions : popularSearches;
  }, [searchSuggestions, popularSearches]);

  // Keyboard navigation handler
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || dropdownSuggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < dropdownSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : dropdownSuggestions.length - 1));
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        setSearchQuery(dropdownSuggestions[selectedSuggestionIndex].value);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    },
    [showSuggestions, dropdownSuggestions, selectedSuggestionIndex],
  );

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: agentsData, error: agentsError } = await supabase
        .from("agents")
        .select(
          `
          id, name, description, short_description, rating, total_reviews,
          total_installs, image_url, capabilities, category_id, required_credentials,
          agent_categories(id, name, description, icon)
        `,
        )
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
                  key
                    .replace(/_/g, " ")
                    .replace(/credentials?$/i, "")
                    .trim(),
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
          }),
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
          })),
        );
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Extract all unique capabilities from agents
  const allCapabilities = useMemo(() => {
    const caps = new Set<string>();
    agents.forEach((agent) => {
      agent.capabilities?.forEach((cap) => caps.add(cap));
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

    searchTerms.forEach((term) => {
      // Name matches are highest priority (exact > starts with > contains)
      if (nameLower === term) score += 100;
      else if (nameLower.startsWith(term)) score += 50;
      else if (nameLower.includes(term)) score += 25;

      // Category exact match is high priority
      if (categoryLower === term) score += 80;
      else if (categoryLower.includes(term)) score += 40;

      // Capability exact match
      if (agent.capabilities?.some((cap) => cap.toLowerCase() === term)) score += 60;
      else if (agent.capabilities?.some((cap) => cap.toLowerCase().includes(term))) score += 30;

      // Plugin match
      if (agent.plugins?.some((p) => p.toLowerCase().includes(term))) score += 35;

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
    const searchTerms = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    let result = agents.filter((agent) => {
      // Build searchable content from all agent fields
      const searchableContent = [
        agent.name,
        agent.description,
        agent.short_description || "",
        agent.category,
        ...(agent.capabilities || []),
        ...(agent.plugins || []),
      ]
        .join(" ")
        .toLowerCase();

      // Match if ANY search term is found in the searchable content
      const matchesSearch = searchTerms.length === 0 || searchTerms.some((term) => searchableContent.includes(term));

      // Also match if search query matches category exactly (for category quick filters)
      const matchesCategorySearch = searchQuery && agent.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category);
      const matchesRating = agent.rating >= minRating;
      const matchesCapabilities =
        selectedCapabilities.length === 0 || selectedCapabilities.some((cap) => agent.capabilities?.includes(cap));

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
    setTimeout(() => setDisplayedCount((prev) => prev + 12), 500);
  }, [displayedCount, filteredAgents.length]);

  useEffect(() => {
    setDisplayedCount(12);
    setHasMore(filteredAgents.length > 12);
  }, [searchQuery, selectedCategories, minRating, selectedCapabilities, sortBy, filteredAgents.length]);

  // Track search with debounce
  const searchTrackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      if (searchTrackingTimeoutRef.current) {
        clearTimeout(searchTrackingTimeoutRef.current);
      }
      searchTrackingTimeoutRef.current = setTimeout(() => {
        trackSearch(searchQuery.trim(), filteredAgents.length);
      }, 1000);
    }
    return () => {
      if (searchTrackingTimeoutRef.current) {
        clearTimeout(searchTrackingTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredAgents.length]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName];

      // Track category filter
      if (!prev.includes(categoryName)) {
        trackCategoryFilter(categoryName);
      }

      return newCategories;
    });
  };

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability],
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
                <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer flex-1 flex justify-between">
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
          <Slider value={[minRating]} onValueChange={([v]) => setMinRating(v)} max={5} step={0.5} className="w-full" />
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-x-hidden pt-32 sm:pt-16">
      <TalentPoolNavbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearFilters}
        showSearch={true}
      />

      {/* Hero - Bold & Vibrant - Collapses when searching */}
      <section
        className={`relative transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFiltering ? "max-h-0 opacity-0 overflow-hidden py-0" : "max-h-[800px] opacity-100"}`}
      >
        {/* Animated gradient background - extends beyond section */}
        <div className="absolute inset-0 -bottom-32 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[300px] bg-gradient-to-t from-purple-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl" />
          {/* Grid pattern overlay - fades out at bottom */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16 md:py-20 lg:py-24">
          {/* Main headline */}
          <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Your company,
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                <TypingText text="staffed with AI." typingSpeed={70} startDelay={400} />
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Hire AI employees and run your business from one workspace - Meet Elixa.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-4 px-4 mb-8 md:mb-10">
            <Button 
              size="lg" 
              onClick={() => setShowWaitlist(true)} 
              className="text-lg sm:text-xl px-10 sm:px-12 h-14 sm:h-16 font-semibold bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {/* Secondary Text Links */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2">
              <button 
                onClick={() => navigate("/workspace")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore demo workspace →
              </button>
              <button 
                onClick={() => {
                  // Scroll to agents section
                  const agentsSection = document.getElementById('agents-section');
                  if (agentsSection) {
                    agentsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse AI talent pool →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div
        id="agents-section"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-700 ${isFiltering ? "pt-5" : ""}`}
      >
        <div className={`flex gap-8 ${isFiltering ? "" : ""}`}>
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
                      {searchQuery ? `Results for "${searchQuery}"` : "Filtered Results"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{filteredAgents.length} agents found</p>
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
                    loader={
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" />
                      </div>
                    }
                    endMessage={
                      <p className="text-center py-6 text-sm text-muted-foreground">
                        All {filteredAgents.length} agents loaded
                      </p>
                    }
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

      <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
