import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AutomationLog {
  id: string;
  automation_id: string;
  status: string;
  error_message: string | null;
  executed_at: string;
  execution_time_ms: number | null;
  output_data: any;
  automation?: {
    name: string;
    action: string;
  };
}

interface AutomationHistoryDashboardProps {
  workspaceId: string;
  chatId?: string;
}

export function AutomationHistoryDashboard({ workspaceId, chatId }: AutomationHistoryDashboardProps) {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    avgExecutionTime: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [workspaceId, chatId]);

  const fetchLogs = async () => {
    setLoading(true);
    
    let query = supabase
      .from('automation_logs')
      .select(`
        *,
        automation:automations(name, action)
      `)
      .order('executed_at', { ascending: false })
      .limit(100);

    // Filter by workspace through automations
    const { data: workspaceAutomations } = await supabase
      .from('automations')
      .select('id')
      .eq('workspace_id', workspaceId);

    if (workspaceAutomations) {
      const automationIds = workspaceAutomations.map(a => a.id);
      query = query.in('automation_id', automationIds);
    }

    if (chatId) {
      const { data: chatAutomations } = await supabase
        .from('automations')
        .select('id')
        .eq('chat_id', chatId);
      
      if (chatAutomations) {
        const chatAutomationIds = chatAutomations.map(a => a.id);
        query = query.in('automation_id', chatAutomationIds);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
      calculateStats(data || []);
    }
    
    setLoading(false);
  };

  const calculateStats = (logsData: AutomationLog[]) => {
    const total = logsData.length;
    const success = logsData.filter(l => l.status === 'success').length;
    const failed = logsData.filter(l => l.status === 'failed').length;
    const executionTimes = logsData
      .filter(l => l.execution_time_ms)
      .map(l => l.execution_time_ms!);
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length
      : 0;

    setStats({ total, success, failed, avgExecutionTime });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;

  return (
    <div className="space-y-4 p-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3" />
              Total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-500">{stats.success}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <XCircle className="h-3 w-3" />
              Failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Execution History</CardTitle>
          <CardDescription className="text-xs">
            Recent automation runs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <Tabs defaultValue="all">
            <TabsList className="mb-3 h-8 w-full">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="success" className="text-xs">Success</TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Loading logs...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No execution logs yet</p>
                   ) : (
                    logs.map((log) => (
                      <Card key={log.id} className="border-l-2" style={{
                        borderLeftColor: log.status === 'success' ? 'hsl(var(--primary))' : 
                                       log.status === 'failed' ? 'hsl(var(--destructive))' : 
                                       'hsl(var(--muted-foreground))'
                      }}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {getStatusIcon(log.status)}
                              <h4 className="font-semibold text-sm truncate">{log.automation?.name || 'Unnamed'}</h4>
                            </div>
                            {getStatusBadge(log.status)}
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">{formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}</span>
                            </div>
                            {log.execution_time_ms && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.execution_time_ms}ms
                              </div>
                            )}
                          </div>

                          {log.error_message && (
                            <div className="mt-2 p-1.5 bg-destructive/10 rounded text-xs text-destructive">
                              <strong>Error:</strong> {log.error_message}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="success" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {logs.filter(l => l.status === 'success').map((log) => (
                    <Card key={log.id} className="border-l-2 border-l-primary">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <h4 className="font-semibold text-sm truncate">{log.automation?.name || 'Unnamed'}</h4>
                          </div>
                          <Badge variant="default" className="bg-green-500 text-xs">Success</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">{formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}</span>
                          </div>
                          {log.execution_time_ms && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.execution_time_ms}ms
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="failed" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {logs.filter(l => l.status === 'failed').map((log) => (
                    <Card key={log.id} className="border-l-2 border-l-destructive">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <h4 className="font-semibold text-sm truncate">{log.automation?.name || 'Unnamed'}</h4>
                          </div>
                          <Badge variant="destructive" className="text-xs">Failed</Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">{formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}</span>
                        </div>

                        {log.error_message && (
                          <div className="p-1.5 bg-destructive/10 rounded text-xs text-destructive break-words">
                            <strong>Error:</strong> {log.error_message}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance</CardTitle>
          <CardDescription className="text-xs">Execution metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Avg Time</span>
                <span className="font-mono font-medium">{stats.avgExecutionTime.toFixed(0)}ms</span>
              </div>
              <Progress value={Math.min((stats.avgExecutionTime / 5000) * 100, 100)} className="h-1.5" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">{stats.success}</div>
                <div className="text-[10px] text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-destructive">{stats.failed}</div>
                <div className="text-[10px] text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{successRate.toFixed(1)}%</div>
                <div className="text-[10px] text-muted-foreground">Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
