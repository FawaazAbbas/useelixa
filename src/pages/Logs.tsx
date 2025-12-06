import { useState, useCallback } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Zap, ArrowRight, FileText, Bot, Search, Filter, Calendar, Users, UserCircle, FolderKanban } from "lucide-react";
import { getAgentColor } from "@/utils/agentColors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, formatDistanceToNow } from "date-fns";
import { DemoBanner } from "@/components/DemoBanner";
import { combinedActivityLogs, activityStats } from "@/data/mockCombinedActivityLogs";
import { type MockActivityLog } from "@/data/mockLogs";
import { cn } from "@/lib/utils";

type ActivityLog = MockActivityLog;

const Logs = () => {
  const [logs] = useState<ActivityLog[]>(combinedActivityLogs);
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

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
    const matchesAgent = agentFilter === "all" || log.agent?.name === agentFilter;
    const matchesSource = sourceFilter === "all" || 
      (sourceFilter === "teams" && log.trigger_source.includes("Team Chat")) ||
      (sourceFilter === "directors" && log.trigger_source.includes("Direct Chat"));
    const matchesType = typeFilter === "all" || log.entity_type === typeFilter;
    
    if (!matchesStatus || !matchesAgent || !matchesSource || !matchesType) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(query) ||
        log.metadata?.description?.toLowerCase().includes(query) ||
        log.agent?.name?.toLowerCase().includes(query) ||
        log.trigger_source?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    failed: logs.filter(l => l.status === "failed").length,
    pending: logs.filter(l => l.status === "pending").length,
    teams: logs.filter(l => l.trigger_source.includes("Team Chat")).length,
    directors: logs.filter(l => l.trigger_source.includes("Direct Chat")).length,
  };

  // Type stats
  const typeStats = {
    file_upload: logs.filter(l => l.entity_type === "file_upload").length,
    decision: logs.filter(l => l.entity_type === "decision").length,
    milestone: logs.filter(l => l.entity_type === "milestone").length,
    task: logs.filter(l => l.entity_type === "task").length,
  };

  // Get unique agents
  const agents = Array.from(new Set(logs.map(l => l.agent?.name).filter(Boolean))) as string[];

  // Agent counts
  const agentCounts = agents.reduce((acc, agent) => {
    acc[agent] = logs.filter(l => l.agent?.name === agent).length;
    return acc;
  }, {} as Record<string, number>);

  const statusButtons = [
    { key: "all", label: "All", count: stats.total, icon: Activity },
    { key: "success", label: "Success", count: stats.success, icon: CheckCircle, color: "text-green-500" },
    { key: "failed", label: "Failed", count: stats.failed, icon: XCircle, color: "text-destructive" },
    { key: "pending", label: "Pending", count: stats.pending, icon: AlertCircle, color: "text-yellow-500" },
  ];

  const sourceButtons = [
    { key: "all", label: "All Sources", count: stats.total, icon: Activity },
    { key: "teams", label: "Team Chats", count: stats.teams, icon: Users, color: "text-emerald-500" },
    { key: "directors", label: "Director Chats", count: stats.directors, icon: UserCircle, color: "text-blue-500" },
  ];

  const typeButtons = [
    { key: "all", label: "All Types", count: stats.total, icon: FolderKanban },
    { key: "file_upload", label: "File Uploads", count: typeStats.file_upload, icon: FileText, color: "text-purple-500" },
    { key: "decision", label: "Decisions", count: typeStats.decision, icon: CheckCircle, color: "text-orange-500" },
    { key: "milestone", label: "Milestones", count: typeStats.milestone, icon: Zap, color: "text-yellow-500" },
    { key: "task", label: "Tasks", count: typeStats.task, icon: Activity, color: "text-cyan-500" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
      <div className="hidden md:block"><DemoBanner /></div>
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl hidden sm:inline">Activity Logs</span>
          </div>

          <div className="flex items-center gap-2">
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

              {/* Source Filters */}
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <Users className="h-3 w-3 shrink-0" />
                  By Source
                </h3>
                <div className="space-y-0.5 w-full">
                  {sourceButtons.map((btn) => (
                    <button
                      key={btn.key}
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        sourceFilter === btn.key 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSourceFilter(btn.key)}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <btn.icon className={cn("h-3 w-3 shrink-0", sourceFilter !== btn.key && btn.color)} />
                        <span className="truncate">{btn.label}</span>
                      </span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        sourceFilter === btn.key ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {btn.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filters */}
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <FolderKanban className="h-3 w-3 shrink-0" />
                  By Type
                </h3>
                <div className="space-y-0.5 w-full">
                  {typeButtons.map((btn) => (
                    <button
                      key={btn.key}
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        typeFilter === btn.key 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setTypeFilter(btn.key)}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <btn.icon className={cn("h-3 w-3 shrink-0", typeFilter !== btn.key && btn.color)} />
                        <span className="truncate">{btn.label}</span>
                      </span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        typeFilter === btn.key ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {btn.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Filters */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <Bot className="h-3 w-3 shrink-0" />
                  By Agent
                </h3>
                <div className="space-y-0.5 w-full">
                  <button
                    className={cn(
                      "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                      agentFilter === "all" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setAgentFilter("all")}
                  >
                    <span className="truncate flex-1 text-left">All Agents</span>
                    <span className={cn(
                      "text-[10px] tabular-nums shrink-0 ml-2",
                      agentFilter === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {stats.total}
                    </span>
                  </button>
                  {agents.map((agent) => (
                    <button
                      key={agent}
                      className={cn(
                        "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                        agentFilter === agent 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setAgentFilter(agentFilter === agent ? "all" : agent)}
                    >
                      <span className="truncate flex-1 text-left min-w-0">{agent}</span>
                      <span className={cn(
                        "text-[10px] tabular-nums shrink-0 ml-2",
                        agentFilter === agent ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {agentCounts[agent]}
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
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden p-3 border-b space-y-2">
            <div className="flex gap-2 overflow-x-auto">
              {sourceButtons.map((btn) => (
                <Button
                  key={btn.key}
                  variant={sourceFilter === btn.key ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0 h-8 text-xs gap-1"
                  onClick={() => setSourceFilter(btn.key)}
                >
                  <btn.icon className={cn("h-3 w-3", sourceFilter !== btn.key && btn.color)} />
                  {btn.label}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">{btn.count}</Badge>
                </Button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {typeButtons.map((btn) => (
                <Button
                  key={btn.key}
                  variant={typeFilter === btn.key ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0 h-8 text-xs gap-1"
                  onClick={() => setTypeFilter(btn.key)}
                >
                  <btn.icon className={cn("h-3 w-3", typeFilter !== btn.key && btn.color)} />
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {filteredLogs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No activity logs</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No logs match your search" : "Agent activities will appear here"}
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
                              {log.metadata?.description || log.action}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {log.agent && (
                                <Badge variant="secondary" className="text-[10px] px-1.5">
                                  {log.agent.name}
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-1.5",
                                  log.trigger_source.includes("Team Chat") 
                                    ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" 
                                    : "border-blue-500/50 text-blue-600 dark:text-blue-400"
                                )}
                              >
                                {log.trigger_source.includes("Team Chat") ? (
                                  <><Users className="h-2.5 w-2.5 mr-0.5" /> Team</>
                                ) : (
                                  <><UserCircle className="h-2.5 w-2.5 mr-0.5" /> Director</>
                                )}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={
                                  log.status === "success" ? "default" :
                                  log.status === "failed" ? "destructive" : "secondary"
                                }
                                className="text-[10px]"
                              >
                                {log.status}
                              </Badge>
                              {log.metadata?.execution_time_ms && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                                  {log.metadata.execution_time_ms}ms
                                </Badge>
                              )}
                              {log.metadata?.tool_name && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                                  {log.metadata.tool_name}
                                </Badge>
                              )}
                            </div>
                            {log.metadata?.error_message && (
                              <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                                <p className="text-[11px] text-destructive line-clamp-2">
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
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    selectedLog.status === "success" 
                      ? "bg-green-500/10 text-green-500" 
                      : selectedLog.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {getStatusIcon(selectedLog.status)}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl mb-2">
                      {selectedLog.metadata.description}
                    </SheetTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {selectedLog.agent && (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const colors = getAgentColor(selectedLog.agent.category || 'General');
                            return (
                              <div className={`h-6 w-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                                <Bot className={`h-4 w-4 ${colors.icon}`} />
                              </div>
                            );
                          })()}
                          <span>{selectedLog.agent.name}</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(selectedLog.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(selectedLog.created_at), "PPpp")}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <Separator className="my-6" />

              {/* Status & Metrics */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status & Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge
                        variant={
                          selectedLog.status === "success" ? "default" :
                          selectedLog.status === "failed" ? "destructive" : "secondary"
                        }
                      >
                        {selectedLog.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Execution Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-medium">{selectedLog.metadata.execution_time_ms}ms</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tool</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-sm font-medium">{selectedLog.metadata.tool_name}</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trigger Source</p>
                    <p className="text-sm font-medium">{selectedLog.trigger_source}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Error Details */}
              {selectedLog.metadata.error_message && (
                <Alert variant="destructive" className="mb-6">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <p className="font-medium mb-1">Error Details</p>
                    <p className="text-sm">{selectedLog.metadata.error_message}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Input Data */}
              {selectedLog.input_data && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Input Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.input_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-sm font-medium text-right ml-4">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Output Data */}
              {selectedLog.output_data && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Output Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.output_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-sm font-medium text-right ml-4">
                            {Array.isArray(value) 
                              ? value.join(", ") 
                              : typeof value === "object" 
                              ? JSON.stringify(value) 
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Execution Steps */}
              {selectedLog.steps && selectedLog.steps.length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Execution Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLog.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`p-1 rounded-full ${
                              step.status === "success" 
                                ? "bg-green-500/20 text-green-500"
                                : step.status === "failed"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {step.status === "success" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : step.status === "failed" ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <ArrowRight className="h-3 w-3" />
                              )}
                            </div>
                            {index < selectedLog.steps.length - 1 && (
                              <div className="w-px h-6 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-sm font-medium">{step.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {step.duration_ms}ms
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Entities */}
              {selectedLog.related_entities && selectedLog.related_entities.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Related Entities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.related_entities.map((entity, index) => (
                        <Badge key={index} variant="outline">
                          {entity.type}: {entity.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Logs;
