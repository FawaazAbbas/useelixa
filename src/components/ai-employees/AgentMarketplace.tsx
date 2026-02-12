import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Check, Globe, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { AIEmployee } from "@/pages/AIEmployees";
import { AgentAvatar } from "./AgentAvatar";

interface AgentMarketplaceProps {
  agents: AIEmployee[];
  installedAgentIds: Set<string>;
  installingId: string | null;
  onInstall: (agentId: string) => void;
  onUninstall: (agentId: string) => void;
  loading: boolean;
}

export function AgentMarketplace({
  agents,
  installedAgentIds,
  installingId,
  onInstall,
  onUninstall,
  loading,
}: AgentMarketplaceProps) {
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.role || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No agents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => {
            const isInstalled = installedAgentIds.has(agent.id);
            const isInstalling = installingId === agent.id;

            return (
              <Card key={agent.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <AgentAvatar
                      name={agent.name}
                      avatarColor={(agent as any).avatarColor}
                      iconUrl={agent.avatar_url}
                      className="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          {agent.role.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-2">
                    {agent.description || "No description provided"}
                  </CardDescription>

                  {agent.developer_name && (
                    <p className="text-xs text-muted-foreground">
                      by {agent.developer_name}
                    </p>
                  )}

                  {agent.allowed_tools && agent.allowed_tools.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.allowed_tools.slice(0, 3).map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {agent.allowed_tools.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.allowed_tools.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    {isInstalled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1"
                        onClick={() => onUninstall(agent.id)}
                        disabled={isInstalling}
                      >
                        {isInstalling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        Installed
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full gap-1"
                        onClick={() => onInstall(agent.id)}
                        disabled={isInstalling}
                      >
                        {isInstalling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Install
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
