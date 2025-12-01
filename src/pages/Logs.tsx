import { useState, useCallback } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import PullToRefresh from "react-pull-to-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { DemoBanner } from "@/components/DemoBanner";
import { mockActivityLogs } from "@/data/mockLogs";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  status: string;
  created_at: string;
  metadata: {
    tool_name: string;
    execution_time_ms: number;
    description: string;
    error_message?: string;
  };
  agent?: {
    name: string;
    image_url: string;
  };
}

const Logs = () => {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs as any);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    if (!matchesStatus) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(query) ||
        log.metadata?.description?.toLowerCase().includes(query) ||
        log.agent?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <>
      <DemoBanner />
      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
        <div className="p-4 md:p-6 max-w-6xl mx-auto pb-20 md:pb-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Activity Logs</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Monitor agent activities
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No activity logs yet</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No logs match your search"
                    : "Agent activities will appear here once they start working"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-240px)] md:h-[calc(100vh-280px)]">
              <div className="space-y-2 md:space-y-3">
                {filteredLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-2 md:gap-3">
                        {getStatusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm md:text-base line-clamp-2">
                                {log.metadata?.description || log.action}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                                {log.agent && (
                                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                                    {log.agent.name}
                                  </p>
                                )}
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(log.created_at), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant={
                                  log.status === "success"
                                    ? "default"
                                    : log.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {log.status}
                              </Badge>
                              {log.metadata?.execution_time_ms && (
                                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                  {log.metadata.execution_time_ms}ms
                                </Badge>
                              )}
                            </div>
                          </div>
                          {log.metadata?.error_message && (
                            <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                              <p className="text-xs text-destructive line-clamp-3">
                                {log.metadata.error_message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PullToRefresh>
    </>
  );
};

export default Logs;
