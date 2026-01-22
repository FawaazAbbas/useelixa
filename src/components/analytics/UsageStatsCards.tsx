import { TrendingUp, Zap, FileText, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UsageStatsCardsProps {
  aiCalls: number;
  toolExecutions: number;
  documentsUploaded: number;
  storageBytesUsed: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const UsageStatsCards = ({
  aiCalls,
  toolExecutions,
  documentsUploaded,
  storageBytesUsed,
}: UsageStatsCardsProps) => {
  const stats = [
    {
      label: "AI Calls",
      value: aiCalls.toLocaleString(),
      icon: TrendingUp,
      description: "This month",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Tool Executions",
      value: toolExecutions.toLocaleString(),
      icon: Zap,
      description: "Last 30 days",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Documents",
      value: documentsUploaded.toLocaleString(),
      icon: FileText,
      description: "Uploaded this month",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Storage Used",
      value: formatBytes(storageBytesUsed),
      icon: HardDrive,
      description: "Total usage",
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
