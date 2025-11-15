import { Calendar, CheckSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const mockTasks = [
  {
    id: "1",
    title: "Respond to customer tickets",
    agent: "customer-support-pro",
    dueDate: "Today, 2:00 PM",
    priority: "high",
    completed: false,
  },
  {
    id: "2",
    title: "Draft blog post on AI trends",
    agent: "content-creator-ai",
    dueDate: "Tomorrow, 10:00 AM",
    priority: "medium",
    completed: false,
  },
  {
    id: "3",
    title: "Analyze Q4 performance metrics",
    agent: "data-analyst",
    dueDate: "Dec 20, 2024",
    priority: "low",
    completed: true,
  },
];

const Tasks = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tasks</h1>
        <p className="text-muted-foreground">
          Track and manage all AI agent tasks
        </p>
      </div>

      <div className="space-y-4">
        {mockTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assigned to: {task.agent}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {task.dueDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
