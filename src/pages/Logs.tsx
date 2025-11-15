import { Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockLogs = [
  {
    id: "1",
    agent: "customer-support-pro",
    action: "Resolved ticket #234",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    agent: "content-creator-ai",
    action: "Published blog post 'AI Trends 2024'",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: "3",
    agent: "data-analyst",
    action: "Failed to fetch analytics data",
    timestamp: "1 hour ago",
    status: "error",
  },
  {
    id: "4",
    agent: "social-media-bot",
    action: "Scheduled 5 posts for next week",
    timestamp: "2 hours ago",
    status: "success",
  },
  {
    id: "5",
    agent: "content-creator-ai",
    action: "Waiting for approval on draft",
    timestamp: "3 hours ago",
    status: "pending",
  },
];

const Logs = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
        <p className="text-muted-foreground">
          Monitor all AI agent activities and actions
        </p>
      </div>

      <div className="space-y-3">
        {mockLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(log.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.agent}
                      </p>
                    </div>
                    <Badge
                      variant={
                        log.status === "success"
                          ? "default"
                          : log.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {log.timestamp}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Logs;
