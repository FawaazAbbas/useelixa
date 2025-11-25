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
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Successful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.success}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Detailed logs of all automation executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="success">Success ({stats.success})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Loading logs...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No execution logs yet</p>
                  ) : (
                    logs.map((log) => (
                      <Card key={log.id} className="border-l-4" style={{
                        borderLeftColor: log.status === 'success' ? 'hsl(var(--primary))' : 
                                       log.status === 'failed' ? 'hsl(var(--destructive))' : 
                                       'hsl(var(--muted-foreground))'
                      }}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <h4 className="font-semibold">{log.automation?.name || 'Unnamed Automation'}</h4>
                            </div>
                            {getStatusBadge(log.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {log.automation?.action || 'No description'}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
                            </div>
                            {log.execution_time_ms && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.execution_time_ms}ms
                              </div>
                            )}
                          </div>

                          {log.error_message && (
                            <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                              <strong>Error:</strong> {log.error_message}
                            </div>
                          )}

                          {log.output_data && (
                            <details className="mt-3">
                              <summary className="text-xs font-medium cursor-pointer hover:text-primary">
                                View Output Data
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(log.output_data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="success">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {logs.filter(l => l.status === 'success').map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <h4 className="font-semibold">{log.automation?.name || 'Unnamed Automation'}</h4>
                          </div>
                          <Badge variant="default" className="bg-green-500">Success</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
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

            <TabsContent value="failed">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {logs.filter(l => l.status === 'failed').map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-destructive">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <h4 className="font-semibold">{log.automation?.name || 'Unnamed Automation'}</h4>
                          </div>
                          <Badge variant="destructive">Failed</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
                          </div>
                        </div>

                        {log.error_message && (
                          <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
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
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Average execution times and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Average Execution Time</span>
                <span className="font-mono">{stats.avgExecutionTime.toFixed(0)}ms</span>
              </div>
              <Progress value={Math.min((stats.avgExecutionTime / 5000) * 100, 100)} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.success}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
