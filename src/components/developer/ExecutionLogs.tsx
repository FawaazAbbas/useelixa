import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

interface ExecutionLog {
  id: string;
  agent_id: string;
  status: string;
  error_message: string | null;
  execution_time_ms: number | null;
  input_message: string | null;
  output_response: string | null;
  created_at: string;
}

interface ExecutionLogsProps {
  agents: AgentSubmission[];
  developerId: string;
}

export const ExecutionLogs = ({ agents, developerId }: ExecutionLogsProps) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [developerId]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("agent_execution_logs")
      .select("*")
      .eq("developer_id", developerId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setLogs(data as ExecutionLog[]);
    setLoading(false);
  };

  const filtered = logs.filter((l) => {
    if (filterAgent !== "all" && l.agent_id !== filterAgent) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    return true;
  });

  const totalExec = logs.length;
  const successCount = logs.filter((l) => l.status === "success").length;
  const successRate = totalExec > 0 ? Math.round((successCount / totalExec) * 100) : 0;
  const avgDuration = totalExec > 0
    ? Math.round(logs.reduce((s, l) => s + (l.execution_time_ms || 0), 0) / totalExec)
    : 0;

  const agentNameMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "error") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalExec}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{successRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgDuration}ms</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All agents" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No execution logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
                    <TableCell className="font-medium">{agentNameMap[log.agent_id] || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(log.status)}
                        <span className="capitalize text-sm">{log.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.execution_time_ms ? `${log.execution_time_ms}ms` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(log.created_at), "MMM d, HH:mm:ss")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && statusIcon(selectedLog.status)}
              Execution Detail
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Agent:</span> {agentNameMap[selectedLog.agent_id] || "Unknown"}</div>
                <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{selectedLog.status}</span></div>
                <div><span className="text-muted-foreground">Duration:</span> {selectedLog.execution_time_ms ? `${selectedLog.execution_time_ms}ms` : "—"}</div>
                <div><span className="text-muted-foreground">Time:</span> {format(new Date(selectedLog.created_at), "MMM d, yyyy HH:mm:ss")}</div>
              </div>
              {selectedLog.error_message && (
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">Error</p>
                  <pre className="text-xs bg-destructive/5 text-destructive p-3 rounded-md whitespace-pre-wrap">{selectedLog.error_message}</pre>
                </div>
              )}
              {selectedLog.input_message && (
                <div>
                  <p className="text-sm font-medium mb-1">Input</p>
                  <ScrollArea className="max-h-40">
                    <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedLog.input_message}</pre>
                  </ScrollArea>
                </div>
              )}
              {selectedLog.output_response && (
                <div>
                  <p className="text-sm font-medium mb-1">Output</p>
                  <ScrollArea className="max-h-40">
                    <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedLog.output_response}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
