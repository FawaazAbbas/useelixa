import { useState, useCallback } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Zap, ArrowRight, FileText, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, formatDistanceToNow } from "date-fns";
import { DemoBanner } from "@/components/DemoBanner";
import { mockActivityLogs, type MockActivityLog } from "@/data/mockLogs";

type ActivityLog = MockActivityLog;

const Logs = () => {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

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
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      <div className="p-4 md:p-6 pb-20 md:pb-6">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Activity Logs</h1>
                <p className="text-sm text-muted-foreground">
                  {logs.length} total activities
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Monitor agent activities
            </p>
          </div>

          <Card className="mb-4 md:mb-6 shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0"
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
            </CardContent>
          </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredLogs.map((log, idx) => (
                  <Card 
                    key={log.id} 
                    className="flex flex-col cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 animate-fade-in"
                    onClick={() => setSelectedLog(log)}
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <CardContent className="p-3 md:p-4 flex-1">
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
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={selectedLog.agent.image_url} />
                              <AvatarFallback>{selectedLog.agent.name[0]}</AvatarFallback>
                            </Avatar>
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
                            selectedLog.status === "success"
                              ? "default"
                              : selectedLog.status === "failed"
                              ? "destructive"
                              : "secondary"
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
                                <span className="text-xs text-muted-foreground">•</span>
                                <Badge 
                                  variant={step.status === "success" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {step.status}
                                </Badge>
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
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Related Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedLog.related_entities.map((entity) => (
                          <div 
                            key={entity.id} 
                            className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entity.type}
                              </Badge>
                              <span className="text-sm">{entity.name}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
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
