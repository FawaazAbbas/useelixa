import { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Search, Filter, Bot, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { MainNavSidebar } from "@/components/MainNavSidebar";

interface ToolCall {
  id: string;
  org_id: string;
  actor_user_id: string | null;
  actor_token_id: string | null;
  integration_slug: string;
  tool_name: string;
  status: string;
  latency_ms: number | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  created_at: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<ToolCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [integrationFilter, setIntegrationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ToolCall | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tool_calls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      setLogs((data || []) as ToolCall[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
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
    const matchesIntegration = integrationFilter === "all" || log.integration_slug === integrationFilter;
    
    if (!matchesStatus || !matchesIntegration) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.tool_name.toLowerCase().includes(query) ||
        log.integration_slug.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    failed: logs.filter(l => l.status === "failed").length,
    pending: logs.filter(l => l.status === "pending").length,
  };

  const integrations = Array.from(new Set(logs.map(l => l.integration_slug).filter(Boolean)));

  const statusButtons = [
    { key: "all", label: "All", count: stats.total, icon: Activity },
    { key: "success", label: "Success", count: stats.success, icon: CheckCircle, color: "text-green-500" },
    { key: "failed", label: "Failed", count: stats.failed, icon: XCircle, color: "text-destructive" },
    { key: "pending", label: "Pending", count: stats.pending, icon: AlertCircle, color: "text-yellow-500" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-0">
        {/* Top Navigation Bar */}
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-2xl hidden sm:inline">Tool Call Logs</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Badge variant="outline" className="text-xs">
                {stats.total} total
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm shrink-0">
            <ScrollArea className="flex-1 w-full">
              <div className="py-3 pl-3 pr-4 w-full max-w-full overflow-hidden">
                {/* Status Filters */}
                <div className="mb-4">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <Filter className="h-3 w-3 shrink-0" />
                    By Status
                  </h3>
                  <div className="space-y-0.5 w-full">
                    {statusButtons.map((btn) => (
                      <button
                        key={btn.key}
                        className={cn(
                          "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                          statusFilter === btn.key 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setStatusFilter(btn.key)}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <btn.icon className={cn("h-3 w-3 shrink-0", statusFilter !== btn.key && btn.color)} />
                          <span className="truncate">{btn.label}</span>
                        </span>
                        <span className={cn(
                          "text-[10px] tabular-nums shrink-0 ml-2",
                          statusFilter === btn.key ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {btn.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Integration Filters */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <Bot className="h-3 w-3 shrink-0" />
                    By Integration
                  </h3>
                  <div className="space-y-0.5 w-full">
                    <button
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        integrationFilter === "all" 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setIntegrationFilter("all")}
                    >
                      <span className="truncate flex-1 text-left">All Integrations</span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        integrationFilter === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {stats.total}
                      </span>
                    </button>
                    {integrations.map((integration) => (
                      <button
                        key={integration}
                        className={cn(
                          "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                          integrationFilter === integration 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setIntegrationFilter(integrationFilter === integration ? "all" : integration)}
                      >
                        <span className="truncate flex-1 text-left min-w-0">{integration}</span>
                        <span className={cn(
                          "text-[10px] tabular-nums shrink-0 ml-2",
                          integrationFilter === integration ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {logs.filter(l => l.integration_slug === integration).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b bg-card/30">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tool calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>

            {/* Content Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {loading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <RefreshCw className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading logs...</p>
                    </CardContent>
                  </Card>
                ) : filteredLogs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No tool calls yet</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No logs match your search" : "Tool calls will appear here when executed via MCP"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredLogs.map((log, idx) => (
                      <Card 
                        key={log.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4",
                          log.status === "success" ? "border-l-green-500" :
                          log.status === "failed" ? "border-l-destructive" :
                          "border-l-yellow-500"
                        )}
                        onClick={() => setSelectedLog(log)}
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(log.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2 mb-1">
                                {log.tool_name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="text-[10px] px-1.5">
                                  {log.integration_slug}
                                </Badge>
                                {log.latency_ms && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {log.latency_ms}ms
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </main>
        </div>

        {/* Log Detail Sheet */}
        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedLog && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    {selectedLog.tool_name}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Integration</span>
                        <span>{selectedLog.integration_slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={selectedLog.status === "success" ? "default" : "destructive"}>
                          {selectedLog.status}
                        </Badge>
                      </div>
                      {selectedLog.latency_ms && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latency</span>
                          <span>{selectedLog.latency_ms}ms</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Executed</span>
                        <span>{format(new Date(selectedLog.created_at), "PPpp")}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {selectedLog.input && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Input</h4>
                      <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.input, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.output && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Output</h4>
                      <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Logs;
