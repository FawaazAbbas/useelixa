import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { History, Search, Download, RefreshCw, Filter, User, Settings, Link2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAuditLogs, type AuditLogEntry, type AuditActionType } from "@/utils/auditLog";
import { supabase } from "@/integrations/supabase/client";

const ACTION_TYPE_LABELS: Record<AuditActionType, string> = {
  setting_change: "Setting Changed",
  role_change: "Role Changed",
  member_removed: "Member Removed",
  member_invited: "Member Invited",
  integration_connect: "Integration Connected",
  integration_disconnect: "Integration Disconnected",
  ai_paused: "AI Paused",
  ai_resumed: "AI Resumed",
  tool_approval_change: "Tool Approval Changed",
};

const ACTION_TYPE_COLORS: Record<AuditActionType, string> = {
  setting_change: "bg-primary/10 text-primary",
  role_change: "bg-amber-500/10 text-amber-600",
  member_removed: "bg-destructive/10 text-destructive",
  member_invited: "bg-emerald-500/10 text-emerald-600",
  integration_connect: "bg-blue-500/10 text-blue-600",
  integration_disconnect: "bg-orange-500/10 text-orange-600",
  ai_paused: "bg-amber-500/10 text-amber-600",
  ai_resumed: "bg-emerald-500/10 text-emerald-600",
  tool_approval_change: "bg-purple-500/10 text-purple-600",
};

const getActionIcon = (actionType: AuditActionType) => {
  switch (actionType) {
    case "setting_change":
    case "ai_paused":
    case "ai_resumed":
    case "tool_approval_change":
      return <Settings className="h-4 w-4" />;
    case "role_change":
    case "member_removed":
    case "member_invited":
      return <User className="h-4 w-4" />;
    case "integration_connect":
    case "integration_disconnect":
      return <Link2 className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

export const AdminAuditTab = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditActionType | "all">("all");
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAuditLogs({
        limit: 200,
        actionType: actionFilter === "all" ? undefined : actionFilter,
      });

      if (error) {
        console.error("[AdminAuditTab] Error:", error);
      }

      setLogs(data);

      // Fetch user emails for display
      const userIds = [...new Set(data.map((l) => l.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);

        const map: Record<string, string> = {};
        profiles?.forEach((p) => {
          map[p.id] = p.display_name || p.id.slice(0, 8);
        });
        setUserMap(map);
      }
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.entity_id?.toLowerCase().includes(searchLower) ||
      userMap[log.user_id]?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    const headers = ["Date", "User", "Action", "Entity Type", "Entity ID", "Old Value", "New Value"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      userMap[log.user_id] || log.user_id,
      ACTION_TYPE_LABELS[log.action_type] || log.action_type,
      log.entity_type,
      log.entity_id || "",
      log.old_value ? JSON.stringify(log.old_value) : "",
      log.new_value ? JSON.stringify(log.new_value) : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={actionFilter}
            onValueChange={(v) => setActionFilter(v as AuditActionType | "all")}
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Date</TableHead>
                <TableHead className="w-32">User</TableHead>
                <TableHead className="w-48">Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {userMap[log.user_id] || log.user_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${ACTION_TYPE_COLORS[log.action_type]} gap-1`}
                      >
                        {getActionIcon(log.action_type)}
                        {ACTION_TYPE_LABELS[log.action_type] || log.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-muted-foreground">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="ml-1 text-foreground">{log.entity_id}</span>
                      )}
                      {log.new_value && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          → {JSON.stringify(log.new_value).slice(0, 50)}
                          {JSON.stringify(log.new_value).length > 50 && "..."}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Showing {filteredLogs.length} of {logs.length} entries. Audit logs are retained indefinitely.
        </p>
      </CardContent>
    </Card>
  );
};
