import { useState, useEffect } from "react";
import { Star, TrendingUp, Download, ArrowLeft, Sparkles, Megaphone, Headphones, Target, DollarSign, Package, Users, Code, Palette, BarChart3, Scale, Smartphone, ClipboardList, ShoppingCart, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { supabase } from "@/integrations/supabase/client";

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

// Category visual config matching AgentCard
const categoryConfig: Record<string, { 
  iconBg: string;
  iconText: string;
  icon: React.ReactNode;
}> = {
  "Marketing & Growth": { iconBg: "bg-gradient-to-br from-rose-500 to-pink-600", iconText: "text-white", icon: <Megaphone className="h-5 w-5" /> },
  "Customer Support": { iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600", iconText: "text-white", icon: <Headphones className="h-5 w-5" /> },
  "Sales": { iconBg: "bg-gradient-to-br from-orange-500 to-amber-600", iconText: "text-white", icon: <Target className="h-5 w-5" /> },
  "Finance": { iconBg: "bg-gradient-to-br from-green-500 to-emerald-600", iconText: "text-white", icon: <DollarSign className="h-5 w-5" /> },
  "Operations": { iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600", iconText: "text-white", icon: <Package className="h-5 w-5" /> },
  "HR & People": { iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600", iconText: "text-white", icon: <Users className="h-5 w-5" /> },
  "Development": { iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", iconText: "text-white", icon: <Code className="h-5 w-5" /> },
  "Design & Creative": { iconBg: "bg-gradient-to-br from-pink-500 to-rose-600", iconText: "text-white", icon: <Palette className="h-5 w-5" /> },
  "Analytics & Data": { iconBg: "bg-gradient-to-br from-purple-500 to-violet-600", iconText: "text-white", icon: <BarChart3 className="h-5 w-5" /> },
  "Legal & Compliance": { iconBg: "bg-gradient-to-br from-slate-500 to-gray-600", iconText: "text-white", icon: <Scale className="h-5 w-5" /> },
  "Product": { iconBg: "bg-gradient-to-br from-violet-500 to-purple-600", iconText: "text-white", icon: <Smartphone className="h-5 w-5" /> },
  "Project Management": { iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600", iconText: "text-white", icon: <ClipboardList className="h-5 w-5" /> },
  "Ecommerce": { iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600", iconText: "text-white", icon: <ShoppingCart className="h-5 w-5" /> },
};

const defaultConfig = { 
  iconBg: "bg-gradient-to-br from-primary to-primary/80",
  iconText: "text-primary-foreground",
  icon: <Bot className="h-5 w-5" /> 
};

const TalentPoolCharts = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("trending");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select(`
          id, name, description, short_description, rating, total_reviews,
          total_installs, image_url, capabilities, category_id,
          agent_categories(name)
        `)
        .eq("status", "active")
        .or("is_system.is.null,is_system.eq.false")
        .order("total_installs", { ascending: false });

      if (data) {
        setAgents(data.map((agent: any) => ({
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
        })));
      }
      setLoading(false);
    };

    fetchAgents();
  }, []);

  // Keyboard shortcut to navigate back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        navigate('/talent-pool');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Get agents sorted by different criteria
  const trendingAgents = [...agents].sort((a, b) => (b.total_installs || 0) - (a.total_installs || 0)).slice(0, 20);
  const topRatedAgents = [...agents].sort((a, b) => b.rating - a.rating);
  const newAgents = [...agents].slice(-10).reverse();

  const getAgentList = () => {
    switch (selectedTab) {
      case "trending": return trendingAgents;
      case "rated": return topRatedAgents;
      case "new": return newAgents;
      default: return trendingAgents;
    }
  };

  const agentList = getAgentList();

  const formatInstalls = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const AgentRow = ({ agent, rank }: { agent: Agent; rank: number }) => {
    const config = categoryConfig[agent.category] || defaultConfig;
    
    return (
      <div 
        className="group flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
        style={{ animationDelay: `${rank * 0.03}s` }}
        onClick={() => navigate(`/agent/${agent.id}`)}
      >
        {/* Rank Badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${
          rank <= 3 
            ? rank === 1 
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900'
              : rank === 2
              ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
              : 'bg-gradient-to-br from-amber-600 to-orange-700 text-amber-100'
            : 'bg-muted text-muted-foreground'
        }`}>
          #{rank}
        </div>
        
        {/* Category Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <span className={config.iconText}>{config.icon}</span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
              {agent.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {agent.short_description || agent.description}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary" className="text-xs bg-muted/50 border border-border/50">
              {agent.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{agent.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({agent.total_reviews})</span>
            </div>
          </div>
        </div>
        
        {/* Stats & Action */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">{formatInstalls(agent.total_installs)}</span>
          </div>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 shadow-lg group-hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agent/${agent.id}`);
            }}
          >
            View
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-20 md:pb-0">
      <TalentPoolNavbar />

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[400px] bg-gradient-to-t from-cyan-500/5 via-blue-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/talent-pool")}
          className="mb-6 -ml-2 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Talent Pool
        </Button>
        
        {/* Hero */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-purple-500/25">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Top Charts
              </h1>
              <p className="text-muted-foreground">Discover the most popular AI agents</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 backdrop-blur-sm border border-border/50 p-1.5 mb-6">
            <TabsTrigger value="trending" className="data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="rated" className="data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Highest Rated</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-3 mt-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading agents...</p>
              </div>
            ) : agentList.length > 0 ? (
              agentList.map((agent, idx) => (
                <AgentRow key={agent.id} agent={agent} rank={idx + 1} />
              ))
            ) : (
              <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
                <p className="text-muted-foreground">No agents found in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TalentPoolFooter />
    </div>
  );
};

export default TalentPoolCharts;