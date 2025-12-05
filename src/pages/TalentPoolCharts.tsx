import { useState } from "react";
import { Star, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { mockAgents } from "@/data/mockAgents";
import { FreeBadge } from "@/components/FreeBadge";
import { TalentPoolNavbar, TalentPoolBackButton } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";

const TalentPoolCharts = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("trending");

  // Get agents sorted by different criteria
  const trendingAgents = mockAgents
    .filter(a => a.trendingRank)
    .sort((a, b) => (a.trendingRank || 999) - (b.trendingRank || 999));
  
  const popularAgents = [...mockAgents]
    .sort((a, b) => (b.total_installs || 0) - (a.total_installs || 0));
  
  const topRatedAgents = [...mockAgents]
    .sort((a, b) => b.rating - a.rating);
  
  const newAgents = [...mockAgents]
    .filter(a => a.badge === 'New');

  const getAgentList = () => {
    switch (selectedTab) {
      case "trending": return trendingAgents;
      case "popular": return popularAgents;
      case "rated": return topRatedAgents;
      case "new": return newAgents;
      default: return trendingAgents;
    }
  };

  const agentList = getAgentList();

  const AgentRow = ({ agent, rank }: { agent: any; rank: number }) => {
    const initial = agent.name.charAt(0).toUpperCase();
    
    return (
      <div 
        className="group flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/20 animate-fade-in"
        style={{ animationDelay: `${rank * 0.05}s` }}
        onClick={() => navigate(`/agent/${agent.id}`)}
      >
        {/* Rank Badge */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
          rank <= 3 
            ? rank === 1 
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
              : rank === 2
              ? 'bg-gradient-to-br from-gray-300 to-gray-500'
              : 'bg-gradient-to-br from-amber-600 to-amber-800'
            : 'bg-gradient-to-br from-primary to-accent'
        }`}>
          #{rank}
        </div>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${agent.gradient || 'from-primary to-accent'} flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform shadow-md`}>
          {initial}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
              {agent.name}
            </h3>
            {agent.badge && (
              <Badge className="text-xs">{agent.badge}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {agent.description}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{agent.category}</Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{agent.rating}</span>
              <span className="text-muted-foreground">({agent.total_reviews})</span>
            </div>
            {agent.total_installs && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{agent.total_installs.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Free Badge & Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <FreeBadge />
          <Button 
            size="sm"
            className="group-hover:scale-105 transition-transform"
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-0">
      <TalentPoolNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <TalentPoolBackButton label="Back to Talent Pool" />
        
        {/* Hero */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Top Charts</h1>
              <p className="text-muted-foreground">Discover the most popular AI agents</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="popular">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Most Installed</span>
            </TabsTrigger>
            <TabsTrigger value="rated">
              <Star className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Highest Rated</span>
            </TabsTrigger>
            <TabsTrigger value="new">
              New
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-3">
            {agentList.length > 0 ? (
              agentList.map((agent, idx) => (
                <AgentRow key={agent.id} agent={agent} rank={idx + 1} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No agents found in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <TalentPoolFooter />
    </div>
  );
};

export default TalentPoolCharts;
