import { useState } from "react";
import { format, addDays, subDays, isToday, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import EventDetailSheet from "@/components/EventDetailSheet";
import { DemoBanner } from "@/components/DemoBanner";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("week");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

  const handlePrevious = () => {
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -30));
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 30));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (event: MockCalendarEvent) => {
    setSelectedEvent(event);
    setDetailSheetOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter((event) =>
      isSameDay(new Date(event.start_time), day)
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b bg-background">
          <div className="grid grid-cols-8 min-h-[60px]">
            <div className="border-r" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`border-r p-2 text-center ${isToday(day) ? "bg-primary/5" : ""}`}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE")}
                </div>
                <div className={`text-xl font-semibold ${isToday(day) ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="grid grid-cols-8 relative">
            <div className="border-r bg-muted/30">
              {hours.map((hour) => (
                <div key={hour} className="h-[60px] border-b px-2 py-1 text-xs text-muted-foreground text-right">
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day.toISOString()} className={`border-r relative ${isToday(day) ? "bg-primary/5" : ""}`}>
                  {hours.map((hour) => (
                    <div key={hour} className="h-[60px] border-b" />
                  ))}
                  
                  {dayEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="absolute left-1 right-1 rounded p-2 text-xs cursor-pointer hover:shadow-md transition-shadow"
                      style={{
                        top: `${(idx * 70) + 80}px`,
                        backgroundColor: event.color,
                        color: "white",
                      }}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b bg-background p-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="flex relative">
            <div className="w-20 shrink-0 border-r bg-muted/30">
              {hours.map((hour) => (
                <div key={hour} className="h-[80px] border-b px-2 py-1 text-sm text-muted-foreground text-right">
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              {hours.map((hour) => (
                <div key={hour} className="h-[80px] border-b" />
              ))}
              
              {dayEvents.map((event, idx) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                  style={{
                    top: `${(idx * 90) + 20}px`,
                    borderLeftColor: event.color,
                    backgroundColor: "hsl(var(--card))",
                  }}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(new Date(event.start_time), "h:mm a")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-muted p-3 text-center text-sm font-semibold">
              {day}
            </div>
          ))}

          {allDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="bg-background min-h-[100px]" />;

            const events = getEventsForDay(day);
            const dayIsToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-background min-h-[100px] p-2 ${dayIsToday ? "ring-2 ring-primary ring-inset" : ""}`}
              >
                <div className={`text-sm font-semibold mb-2 ${dayIsToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="text-xs rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: event.color, color: "white" }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-muted-foreground pl-1.5">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Agenda View
  const renderAgendaView = () => {
    const upcomingEvents = [...mockCalendarEvents]
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 20);

    return (
      <ScrollArea className="flex-1 w-full h-full">
        <div className="p-6 space-y-3 w-full">
          {upcomingEvents.map((event) => (
            <Card
              key={event.id}
              className="w-full cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEventClick(event)}
            >
              <CardContent className="p-4 flex gap-4">
                <div className="w-1 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(new Date(event.start_time), "MMM d, h:mm a")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <DemoBanner />

      {/* Header */}
      <div className="border-b bg-card p-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mt-4 text-lg font-semibold">
          {view === "month" && format(currentDate, "MMMM yyyy")}
          {view === "week" && format(currentDate, "MMM d - ") + format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), "MMM d, yyyy")}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 w-full overflow-hidden">
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "month" && renderMonthView()}
        {view === "agenda" && renderAgendaView()}
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  );
};

export default Calendar;
