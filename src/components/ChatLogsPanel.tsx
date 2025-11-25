import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AutomationLog {
  id: string;
  automation_id: string;
  status: string;
  executed_at: string;
  execution_time_ms: number | null;
  error_message: string | null;
  output_data: any;
  automation?: {
    name: string;
  };
}

interface ChatLogsPanelProps {
  chatId: string;
}

export const ChatLogsPanel = ({ chatId }: ChatLogsPanelProps) => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    let query = supabase
      .from('automation_logs')
      .select(`
        *,
        automation:automations!inner(name, chat_id)
      `)
      .eq('automation.chat_id', chatId)
      .order('executed_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLogs(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('chat-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_logs',
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, filter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Automation Logs</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Recent automation executions
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No logs found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <div>
                        <CardTitle className="text-sm">
                          {log.automation?.name || 'Unknown Automation'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(log.executed_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {log.execution_time_ms && (
                      <p className="text-muted-foreground">
                        Execution time: {log.execution_time_ms}ms
                      </p>
                    )}
                    {log.error_message && (
                      <div className="text-red-500 text-xs">
                        <strong>Error:</strong> {log.error_message}
                      </div>
                    )}
                    {log.output_data && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Output:</strong>{' '}
                        {JSON.stringify(log.output_data).substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
