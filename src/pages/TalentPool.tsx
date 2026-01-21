import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plug, TrendingUp, Clock, Filter, X, Star, ExternalLink } from "lucide-react";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logo_url: string;
  status: string | null;
  auth_type: string | null;
}

const TalentPool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching integrations:", error);
      } else {
        setIntegrations(data || []);
      }
      setLoading(false);
    };

    fetchIntegrations();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    integrations.forEach((i) => cats.add(i.category));
    return Array.from(cats).sort();
  }, [integrations]);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const matchesSearch =
        !searchQuery ||
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || integration.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const isFiltering = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Plug className="h-3 w-3 mr-1" />
            Tool Library
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Connect Your Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse and connect integrations to power your AI workflows via MCP.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
          {isFiltering && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? "s" : ""} available
        </p>

        {/* Integrations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="h-5 w-2/3 bg-muted rounded mt-3" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="text-center py-16">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No integrations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
                onClick={() => navigate(`/connections`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <img
                      src={integration.logo_url}
                      alt={integration.name}
                      className="h-12 w-12 rounded-lg object-contain bg-muted p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/elixa-logo.png";
                      }}
                    />
                    <Badge variant="outline" className="text-xs">
                      {integration.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                    {integration.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {integration.description || `Connect your ${integration.name} account`}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      {integration.auth_type || "OAuth"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPool;
