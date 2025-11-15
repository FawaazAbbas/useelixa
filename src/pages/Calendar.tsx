import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockEvents = [
  {
    id: "1",
    title: "Weekly content review",
    agent: "content-creator-ai",
    date: "Dec 16, 2024",
    time: "2:00 PM",
    type: "meeting",
  },
  {
    id: "2",
    title: "Customer support sync",
    agent: "customer-support-pro",
    date: "Dec 17, 2024",
    time: "10:00 AM",
    type: "sync",
  },
  {
    id: "3",
    title: "Q4 analytics presentation",
    agent: "data-analyst",
    date: "Dec 20, 2024",
    time: "3:00 PM",
    type: "presentation",
  },
];

const Calendar = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          View scheduled AI agent activities
        </p>
      </div>

      <div className="grid gap-4">
        {mockEvents.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.agent}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} at {event.time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
