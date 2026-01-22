import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, FileText, HardDrive, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { UsageStatsCards } from "@/components/analytics/UsageStatsCards";
import { ToolUsageChart } from "@/components/analytics/ToolUsageChart";
import { ExecutionTimeline } from "@/components/analytics/ExecutionTimeline";
import { ErrorRateCard } from "@/components/analytics/ErrorRateCard";

interface UsageStats {
  ai_calls: number;
  tool_executions: number;
  documents_uploaded: number;
  storage_bytes_used: number;
  month: string;
}

interface ToolExecution {
  id: string;
  tool_name: string;
  success: boolean;
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [toolBreakdown, setToolBreakdown] = useState<{ name: string; count: number; color: string }[]>([]);
  const [errorRate, setErrorRate] = useState(0);
  const [avgExecutionTime, setAvgExecutionTime] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Get current month's usage stats
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      
      // Fetch org membership first
      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user!.id)
        .single();

      if (membership?.org_id) {
        // Fetch usage stats for this org
        const { data: stats } = await supabase
          .from("usage_stats")
          .select("*")
          .eq("org_id", membership.org_id)
          .eq("month", currentMonth)
          .single();

        if (stats) {
          setUsageStats(stats as UsageStats);
        }
      }

      // Fetch tool executions for the current user (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: executions } = await supabase
        .from("tool_execution_log")
        .select("*")
        .eq("user_id", user!.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (executions) {
        setToolExecutions(executions as ToolExecution[]);

        // Calculate tool breakdown
        const toolCounts: Record<string, number> = {};
        let errorCount = 0;
        let totalTime = 0;

        executions.forEach((exec: ToolExecution) => {
          const toolName = exec.tool_name.split("_").slice(0, 2).join(" ");
          toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
          if (!exec.success) errorCount++;
          if (exec.execution_time_ms) totalTime += exec.execution_time_ms;
        });

        const colors = [
          "hsl(var(--primary))",
          "hsl(142, 76%, 36%)",
          "hsl(38, 92%, 50%)",
          "hsl(0, 84%, 60%)",
          "hsl(262, 83%, 58%)",
          "hsl(330, 81%, 60%)",
        ];

        const breakdown = Object.entries(toolCounts)
          .map(([name, count], index) => ({
            name,
            count,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setToolBreakdown(breakdown);
        setErrorRate(executions.length > 0 ? (errorCount / executions.length) * 100 : 0);
        setAvgExecutionTime(executions.length > 0 ? totalTime / executions.length : 0);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <PageLayout title="Analytics" icon={BarChart3}>
        <PageEmptyState
          icon={BarChart3}
          title="Sign in required"
          description="Please sign in to view analytics."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Analytics"
      icon={BarChart3}
      badge="Last 30 days"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Usage Stats Cards */}
          <UsageStatsCards
            aiCalls={usageStats?.ai_calls || 0}
            toolExecutions={usageStats?.tool_executions || toolExecutions.length}
            documentsUploaded={usageStats?.documents_uploaded || 0}
            storageBytesUsed={usageStats?.storage_bytes_used || 0}
          />

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tool Usage Chart */}
            <ToolUsageChart data={toolBreakdown} />

            {/* Error Rate & Performance */}
            <div className="space-y-6">
              <ErrorRateCard errorRate={errorRate} totalExecutions={toolExecutions.length} />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Avg Execution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {avgExecutionTime.toFixed(0)}
                    <span className="text-lg font-normal text-muted-foreground ml-1">ms</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Across {toolExecutions.length} tool executions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Execution Timeline */}
          <ExecutionTimeline executions={toolExecutions.slice(0, 20)} />
        </div>
      )}
    </PageLayout>
  );
};

export default Analytics;
