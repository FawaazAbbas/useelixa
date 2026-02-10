import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Clock, Download } from "lucide-react";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

interface DeveloperStatsProps {
  agents: AgentSubmission[];
}

export const DeveloperStats = ({ agents }: DeveloperStatsProps) => {
  const total = agents.length;
  const approved = agents.filter((a) => a.status === "approved").length;
  const pending = agents.filter((a) => a.status === "pending_review").length;
  const downloads = agents.reduce((sum, a) => sum + a.download_count, 0);

  const stats = [
    { label: "Total Agents", value: total, icon: Package, color: "text-primary" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-500" },
    { label: "Total Downloads", value: downloads, icon: Download, color: "text-muted-foreground" },
  ];

  return (
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
  );
};
