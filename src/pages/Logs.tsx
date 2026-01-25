import { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Search, Filter, Bot, RefreshCw, Download, CalendarIcon, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { UsageStatsCards } from "@/components/analytics/UsageStatsCards";
import { ToolUsageChart } from "@/components/analytics/ToolUsageChart";
import { ExecutionTimeline } from "@/components/analytics/ExecutionTimeline";
import { ErrorRateCard } from "@/components/analytics/ErrorRateCard";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { ElixaMascot } from "@/components/ElixaMascot";

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

interface UsageStats {
  ai_calls: number;
  tool_executions: number;
  documents_uploaded: number;
  storage_bytes_used: number;
  month: string;
}

interface ToolExecution {
  id: string;
  tool_name: string;
  success: boolean;
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

const Logs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  
  // Logs state
  const [logs, setLogs] = useState<ToolCall[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [integrationFilter, setIntegrationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ToolCall | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [toolBreakdown, setToolBreakdown] = useState<{ name: string; count: number; color: string }[]>([]);
  const [errorRate, setErrorRate] = useState(0);
  const [avgExecutionTime, setAvgExecutionTime] = useState(0);

  const fetchLogs = async () => {
    setLogsLoading(true);
    
    let query = supabase
      .from("tool_calls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (dateRange?.from) {
      query = query.gte("created_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      const endDate = new Date(dateRange.to);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt("created_at", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      setLogs((data || []) as ToolCall[]);
    }
    setLogsLoading(false);
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;
    setAnalyticsLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      
      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (membership?.org_id) {
        const { data: stats } = await supabase
          .from("usage_stats")
          .select("*")
          .eq("org_id", membership.org_id)
          .eq("month", currentMonth)
          .single();

        if (stats) {
          setUsageStats(stats as UsageStats);
        }
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: executions } = await supabase
        .from("tool_execution_log")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (executions) {
        setToolExecutions(executions as ToolExecution[]);

        const toolCounts: Record<string, number> = {};
        let errorCount = 0;
        let totalTime = 0;

        executions.forEach((exec: ToolExecution) => {
          const toolName = exec.tool_name.split("_").slice(0, 2).join(" ");
          toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
          if (!exec.success) errorCount++;
          if (exec.execution_time_ms) totalTime += exec.execution_time_ms;
        });

        const colors = [
          "hsl(var(--primary))",
          "hsl(142, 76%, 36%)",
          "hsl(38, 92%, 50%)",
          "hsl(0, 84%, 60%)",
          "hsl(262, 83%, 58%)",
          "hsl(330, 81%, 60%)",
        ];

        const breakdown = Object.entries(toolCounts)
          .map(([name, count], index) => ({
            name,
            count,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setToolBreakdown(breakdown);
        setErrorRate(executions.length > 0 ? (errorCount / executions.length) * 100 : 0);
        setAvgExecutionTime(executions.length > 0 ? totalTime / executions.length : 0);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

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

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "Tool Name", "Integration", "Status", "Latency (ms)", "User ID"];
    const rows = filteredLogs.map(log => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.tool_name,
      log.integration_slug,
      log.status,
      log.latency_ms?.toString() || "",
      log.actor_user_id || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `tool-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredLogs.length} logs to CSV`);
  };

  if (!user) {
    return (
      <PageLayout title="Logs & Analytics" icon={Activity}>
        <div className="flex flex-col items-center justify-center py-16">
          <ElixaMascot pose="search" size="lg" animation="float" className="mb-4" />
          <h3 className="text-lg font-medium mb-1">Sign in required</h3>
          <p className="text-muted-foreground text-sm">Please sign in to view logs and analytics.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Logs & Analytics" icon={Activity}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Activity className="h-4 w-4" />
              Tool Calls
            </TabsTrigger>
          </TabsList>

          {activeTab === "logs" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="p-3 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                    >
                      Last 30 days
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={logsLoading}>
                <RefreshCw className={cn("h-4 w-4", logsLoading && "animate-spin")} />
              </Button>
            </div>
          )}
        </div>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-0">
          {analyticsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <UsageStatsCards
                aiCalls={usageStats?.ai_calls || 0}
                toolExecutions={usageStats?.tool_executions || toolExecutions.length}
                documentsUploaded={usageStats?.documents_uploaded || 0}
                storageBytesUsed={usageStats?.storage_bytes_used || 0}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <ToolUsageChart data={toolBreakdown} />

                <div className="space-y-6">
                  <ErrorRateCard errorRate={errorRate} totalExecutions={toolExecutions.length} />
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Avg Execution Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {avgExecutionTime.toFixed(0)}
                        <span className="text-lg font-normal text-muted-foreground ml-1">ms</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Across {toolExecutions.length} tool executions
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <ExecutionTimeline executions={toolExecutions.slice(0, 20)} />
            </>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-0">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className="hidden md:flex flex-col w-56 shrink-0">
              <Card className="sticky top-4">
                <CardContent className="p-4 space-y-4">
                  {/* Status Filters */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Filter className="h-3 w-3" />
                      By Status
                    </h3>
                    <div className="space-y-1">
                      {statusButtons.map((btn) => (
                        <button
                          key={btn.key}
                          className={cn(
                            "w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors",
                            statusFilter === btn.key 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setStatusFilter(btn.key)}
                        >
                          <span className="flex items-center gap-1.5">
                            <btn.icon className={cn("h-3 w-3", statusFilter !== btn.key && btn.color)} />
                            {btn.label}
                          </span>
                          <span className={cn(
                            "text-[10px] tabular-nums",
                            statusFilter === btn.key ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {btn.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Integration Filters */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Bot className="h-3 w-3" />
                      By Integration
                    </h3>
                    <div className="space-y-1">
                      <button
                        className={cn(
                          "w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors",
                          integrationFilter === "all" 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setIntegrationFilter("all")}
                      >
                        <span>All</span>
                        <span className={cn(
                          "text-[10px] tabular-nums",
                          integrationFilter === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {stats.total}
                        </span>
                      </button>
                      {integrations.map((integration) => (
                        <button
                          key={integration}
                          className={cn(
                            "w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors",
                            integrationFilter === integration 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setIntegrationFilter(integrationFilter === integration ? "all" : integration)}
                        >
                          <span className="truncate">{integration}</span>
                          <span className={cn(
                            "text-[10px] tabular-nums",
                            integrationFilter === integration ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {logs.filter(l => l.integration_slug === integration).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tool calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              {/* Logs Grid */}
              {logsLoading ? (
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
                        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] border-l-4",
                        log.status === "success" ? "border-l-green-500" :
                        log.status === "failed" ? "border-l-destructive" :
                        "border-l-yellow-500"
                      )}
                      onClick={() => setSelectedLog(log)}
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
          </div>
        </TabsContent>
      </Tabs>

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
    </PageLayout>
  );
};

export default Logs;
