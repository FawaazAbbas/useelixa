import { useState, useMemo } from "react";
import { Bot, Search, Star, Users, Plus, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockAgents, MockAgent } from "@/data/mockAgents";
import { getAgentColor } from "@/utils/agentColors";
import { WaitlistDialog } from "./WaitlistDialog";

interface AddAgentToWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "All",
  "Marketing",
  "Marketing & Growth",
  "Ecommerce",
  "Customer Support",
  "Sales",
  "Finance",
  "HR",
  "Productivity",
  "Development",
];

export const AddAgentToWorkspaceDialog = ({
  open,
  onOpenChange,
}: AddAgentToWorkspaceDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showWaitlist, setShowWaitlist] = useState(false);

  const filteredAgents = useMemo(() => {
    return mockAgents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddAgent = (agent: MockAgent) => {
    setShowWaitlist(true);
    setTimeout(() => onOpenChange(false), 50);
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(mockAgents.map((a) => a.category));
    return ["All", ...Array.from(cats)];
  }, []);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 bg-slate-900 border-slate-700">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Add AI Agent to Workspace
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="px-6 py-4 space-y-3 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {uniqueCategories.slice(0, 6).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Agent List */}
        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="p-4 space-y-3">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No agents found matching your search</p>
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const agentColors = getAgentColor(agent.category);
                return (
                  <div
                    key={agent.id}
                    className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Agent Icon */}
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 ${agentColors.bg}`}
                      >
                        <Bot
                          className={`h-6 w-6 ${agentColors.icon}`}
                        />
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-100 truncate">
                            {agent.name}
                          </h3>
                          {agent.badge && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/20 text-primary text-xs"
                            >
                              {agent.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {agent.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {agent.total_installs.toLocaleString()}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-slate-600 text-slate-400 text-xs"
                          >
                            {agent.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="sm"
                        onClick={() => handleAddAgent(agent)}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
          <p className="text-xs text-slate-500 text-center">
            Browse our full catalog in the{" "}
            <a href="/talent-pool" className="text-primary hover:underline">
              AI Talent Pool
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
    
    <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
    </>
  );
};
