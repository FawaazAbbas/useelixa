import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Bot, RefreshCw } from "lucide-react";
import type { Task } from "./KanbanBoard";

interface TaskStatsHeaderProps {
  tasks: Task[];
}

export const TaskStatsHeader = ({ tasks }: TaskStatsHeaderProps) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === "completed") return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
    const aiAssigned = tasks.filter(t => t.assigned_to === "ai").length;
    const recurring = tasks.filter(t => t.is_recurring).length;

    return { total, completed, inProgress, overdue, aiAssigned, recurring };
  }, [tasks]);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      hideIfZero: true,
    },
    {
      label: "AI Assigned",
      value: stats.aiAssigned,
      icon: Bot,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hideIfZero: true,
    },
    {
      label: "Recurring",
      value: stats.recurring,
      icon: RefreshCw,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hideIfZero: true,
    },
  ];

  const visibleStats = statCards.filter(s => !s.hideIfZero || s.value > 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {visibleStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
