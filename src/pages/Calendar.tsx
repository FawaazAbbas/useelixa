import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

const timeSlots = [
  "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"
];

const weekDays = [
  { date: "Sun 9", day: "Sunday" },
  { date: "Mon 10", day: "Monday" },
  { date: "Tue 11", day: "Tuesday" },
  { date: "Wed 12", day: "Wednesday" },
  { date: "Thu 13", day: "Thursday" },
  { date: "Fri 14", day: "Friday" },
  { date: "Sat 15", day: "Saturday", today: true },
];

const mockEvents = [
  {
    id: "1",
    title: "Define campaign strategy",
    time: "9 - 10 AM",
    day: 2,
    slot: 3,
    color: "bg-blue-100 border-blue-300 text-blue-900",
    completed: false,
  },
  {
    id: "2",
    title: "Conduct market research to identify target audience",
    time: "10 AM - 12 PM",
    day: 2,
    slot: 4,
    color: "bg-blue-100 border-blue-300 text-blue-900",
    completed: false,
    span: 2,
  },
  {
    id: "3",
    title: "Setup Team workspace",
    time: "9 - 10 AM",
    day: 3,
    slot: 3,
    color: "bg-red-100 border-red-300 text-red-900",
    completed: false,
  },
  {
    id: "4",
    title: "Create design concepts for the summer collection",
    time: "11 AM - 12 PM",
    day: 4,
    slot: 5,
    color: "bg-gray-100 border-gray-300 text-gray-700",
    completed: false,
  },
];

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-2xl font-semibold">Nov 2025</h1>
            <Button variant="outline" size="sm">Today</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Week</Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Week View */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-background z-10">
              <div className="p-3 border-r border-border text-xs text-muted-foreground">GMT</div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="p-3 border-r border-border text-center">
                  <div className="text-xs text-muted-foreground">{day.date.split(' ')[0]}</div>
                  <div className={`text-2xl font-semibold ${day.today ? 'text-primary' : ''}`}>
                    {day.date.split(' ')[1]}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {timeSlots.map((time, idx) => (
                <div key={idx} className="grid grid-cols-8 border-b border-border" style={{ height: '80px' }}>
                  <div className="p-2 border-r border-border text-xs text-muted-foreground">
                    {time}
                  </div>
                  {weekDays.map((_, dayIdx) => (
                    <div key={dayIdx} className="border-r border-border hover:bg-muted/30 transition-colors relative">
                      {mockEvents
                        .filter(event => event.day === dayIdx && event.slot === idx)
                        .map(event => (
                          <Card 
                            key={event.id} 
                            className={`absolute inset-1 ${event.color} border-l-4 cursor-pointer hover:shadow-md transition-shadow`}
                            style={{ height: event.span ? `${event.span * 80 - 8}px` : 'calc(100% - 8px)' }}
                          >
                            <CardContent className="p-2 h-full overflow-hidden">
                              <div className="flex items-start gap-2">
                                <Checkbox className="mt-0.5" checked={event.completed} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium line-clamp-2 mb-1">{event.title}</p>
                                  <p className="text-xs opacity-70">{event.time}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Mini Calendar */}
        <div className="w-80 border-l border-border p-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-4">November 2025</h3>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Calendars</h3>
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                + Add calendar
              </Button>
            </div>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Link a calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
