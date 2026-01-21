import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plug, Search, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MainNavSidebar } from "@/components/MainNavSidebar";

interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logo_url: string;
  status: string | null;
}

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("status", "active")
        .order("display_order");

      if (!error && data) {
        setIntegrations(data);
      }
      setLoading(false);
    };
    fetchIntegrations();
  }, []);

  const categories = [...new Set(integrations.map(i => i.category))].sort();
  
  const filtered = integrations.filter(i => {
    const matchesSearch = !searchQuery || 
      i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-card/80 sticky top-0 z-20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl">Connections</span>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(integration => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={integration.logo_url}
                      alt={integration.name}
                      className="h-10 w-10 rounded object-contain bg-muted p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/elixa-logo.png"; }}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 text-xs">
                    {integration.description || `Connect ${integration.name}`}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No integrations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
