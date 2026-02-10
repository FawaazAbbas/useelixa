import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Clock, Download, Plus, BookOpen, User, Send, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ElixaMascot } from "@/components/ElixaMascot";
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
      {/* Welcome */}
      {total === 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-6 py-6">
            <ElixaMascot pose="waving" size="lg" animation="float" />
            <div>
              <h2 className="text-lg font-semibold mb-1">Welcome to the Developer Portal!</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Build and deploy custom AI agents for the Elixa marketplace. Get started by submitting your first agent.
              </p>
              <Button size="sm" onClick={() => onNavigate("submit")}>
                <Plus className="h-4 w-4 mr-1" /> Create Your First Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className="p-1.5 bg-muted rounded-lg">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
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
          <CardHeader className="pb-3">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agent Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">No agents yet</p>
            ) : (
              <>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
                  {statusBreakdown.map((s) =>
                    s.count > 0 ? (
                      <div key={s.label} className={`${s.color} transition-all`} style={{ width: `${(s.count / totalForBar) * 100}%` }} />
                    ) : null
                  )}
                </div>
                <div className="grid grid-cols-2 gap-y-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-sm">
                      <div className={`h-2 w-2 rounded-full ${s.color}`} />
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium ml-auto pr-4">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <ElixaMascot pose="search" size="sm" className="mb-2 opacity-60" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <div className="p-1 bg-muted rounded mt-0.5">
                      <activity.icon className={`h-3 w-3 ${activity.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{activity.text}</p>
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
