import { Calendar, CheckSquare, Clock, User, Filter, Plus, List, LayoutGrid, Search, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockTaskGroups = [
  {
    dateRange: "Mon Nov 10 - Sun Nov 16",
    count: 4,
    status: "current",
    tasks: [
      {
        id: "1",
        title: "Respond to customer tickets",
        project: "Customer Support",
        projectColor: "bg-blue-500",
        status: "Todo",
        dueDate: "Fri Nov 14",
        estimate: "0m of 4h",
        assignee: "CS",
        priority: "high",
        comments: 0,
      },
      {
        id: "2",
        title: "Draft blog post on AI trends",
        project: "Content Creation",
        projectColor: "bg-purple-500",
        status: "Todo",
        dueDate: "Thu Nov 13",
        estimate: "0m of 3h",
        assignee: "CC",
        priority: "medium",
        comments: 1,
      },
    ],
  },
  {
    dateRange: "Mon Nov 17 - Sun Nov 23",
    count: 3,
    status: "upcoming",
    tasks: [
      {
        id: "3",
        title: "Analyze Q4 performance metrics",
        project: "Data Analysis",
        projectColor: "bg-green-500",
        status: "Todo",
        dueDate: "Mon Nov 17",
        estimate: "0m of 2h",
        assignee: "DA",
        priority: "low",
        comments: 0,
      },
    ],
  },
  {
    dateRange: "Mon Dec 1 - Sun Dec 7",
    count: 2,
    status: "future",
    tasks: [
      {
        id: "4",
        title: "Execute campaign launch",
        project: "Marketing",
        projectColor: "bg-orange-500",
        status: "Todo",
        dueDate: "Wed Dec 3",
        estimate: "0m of 2h",
        assignee: "MK",
        priority: "high",
        comments: 0,
      },
    ],
  },
];

const Tasks = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Projects & Tasks</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters (1)
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tabs defaultValue="deadline" className="w-auto">
              <TabsList>
                <TabsTrigger value="deadline">Group by: Deadline</TabsTrigger>
                <TabsTrigger value="project">Group by: Project</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button variant="ghost" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-9 w-64" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Groups */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex gap-4">
            {mockTaskGroups.map((group) => (
              <div key={group.dateRange} className="flex-1 min-w-[320px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{group.dateRange}</h3>
                    <Badge variant="secondary" className="text-xs">{group.count}</Badge>
                    {group.status === "current" && (
                      <Badge className="text-xs">Current</Badge>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`h-3 w-3 rounded-full ${task.projectColor}`} />
                              <span className="text-xs text-muted-foreground">{task.project}</span>
                            </div>
                            <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimate}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[8px]">{task.assignee}</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Add Column */}
            <div className="flex-1 min-w-[320px]">
              <Button variant="ghost" className="w-full h-12 border-2 border-dashed">
                <Plus className="h-4 w-4 mr-2" />
                Add time period
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
