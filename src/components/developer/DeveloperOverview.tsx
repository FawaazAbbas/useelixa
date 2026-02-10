import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Clock, Download, Plus, BookOpen, User, Bot, Send, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import type { DeveloperSection } from "./DeveloperSidebar";

interface DeveloperOverviewProps {
  agents: AgentSubmission[];
  onNavigate: (section: DeveloperSection) => void;
}

export const DeveloperOverview = ({ agents, onNavigate }: DeveloperOverviewProps) => {
  const total = agents.length;
  const approved = agents.filter((a) => a.status === "approved").length;
  const pending = agents.filter((a) => a.status === "pending_review").length;
  const rejected = agents.filter((a) => a.status === "rejected").length;
  const draft = agents.filter((a) => a.status === "draft").length;
  const downloads = agents.reduce((sum, a) => sum + a.download_count, 0);

  const stats = [
    { label: "Total Agents", value: total, icon: Package, color: "text-primary" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-500" },
    { label: "Total Downloads", value: downloads, icon: Download, color: "text-muted-foreground" },
  ];

  // Build activity feed from agent timestamps
  const activities = agents
    .flatMap((a) => {
      const items: { date: string; icon: React.ElementType; text: string; color: string }[] = [];
      items.push({ date: a.created_at, icon: Plus, text: `Created "${a.name}"`, color: "text-primary" });
      if (a.submitted_at) items.push({ date: a.submitted_at, icon: Send, text: `Submitted "${a.name}" for review`, color: "text-yellow-500" });
      if (a.reviewed_at && a.status === "approved") items.push({ date: a.reviewed_at, icon: CheckCircle, text: `"${a.name}" was approved`, color: "text-green-500" });
      if (a.reviewed_at && a.status === "rejected") items.push({ date: a.reviewed_at, icon: XCircle, text: `"${a.name}" was rejected`, color: "text-destructive" });
      return items;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Status breakdown
  const statusBreakdown = [
    { label: "Draft", count: draft, color: "bg-muted-foreground" },
    { label: "Pending", count: pending, color: "bg-yellow-500" },
    { label: "Approved", count: approved, color: "bg-green-500" },
    { label: "Rejected", count: rejected, color: "bg-destructive" },
  ];
  const totalForBar = Math.max(total, 1);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" size="sm" onClick={() => onNavigate("submit")}>
              <Plus className="h-4 w-4 mr-2" /> Create New Agent
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => onNavigate("docs")}>
              <BookOpen className="h-4 w-4 mr-2" /> View Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => onNavigate("settings")}>
              <User className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">No agents yet</p>
            ) : (
              <>
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {statusBreakdown.map((s) =>
                    s.count > 0 ? (
                      <div key={s.label} className={`${s.color}`} style={{ width: `${(s.count / totalForBar) * 100}%` }} />
                    ) : null
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium ml-auto">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <activity.icon className={`h-4 w-4 mt-0.5 shrink-0 ${activity.color}`} />
                    <div className="min-w-0">
                      <p className="truncate">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.date), "MMM d, HH:mm")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
