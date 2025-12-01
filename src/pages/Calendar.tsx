import { useState } from "react";
import { format, addDays, subDays, isToday, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
                      className="absolute left-1 right-1 rounded p-2 text-xs cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 animate-fade-in"
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
                  className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-l-4 animate-fade-in"
                  style={{
                    top: `${(idx * 90) + 20}px`,
                    borderLeftColor: event.color,
                    backgroundColor: "hsl(var(--card))",
                    animationDelay: `${idx * 50}ms`
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
                      className="text-xs rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
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
          {upcomingEvents.map((event, idx) => (
            <Card
              key={event.id}
              className="w-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200 border-l-4 animate-fade-in"
              onClick={() => handleEventClick(event)}
              style={{
                borderLeftColor: event.color,
                animationDelay: `${idx * 30}ms`
              }}
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
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />

      {/* Header */}
      <div className="py-4 sm:py-6 px-4 md:py-8 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Calendar</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {mockCalendarEvents.length} events scheduled
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-sm mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevious} className="h-9 w-9 touch-manipulation">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleToday} className="min-w-[70px] h-9 touch-manipulation text-sm">
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 touch-manipulation">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex-1">
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="day" className="text-xs sm:text-sm">Day</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
                    <TabsTrigger value="agenda" className="text-xs sm:text-sm">Agenda</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-full sm:w-auto text-center truncate">
                {view === "month" && format(currentDate, "MMMM yyyy")}
                {view === "week" && format(currentDate, "MMM d - ") + format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), "MMM d, yyyy")}
                {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
                {view === "agenda" && "Upcoming Events"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-20 md:pb-8">
        <div className={view === "week" || view === "day" ? "overflow-x-auto -mx-2 sm:mx-0" : ""}>
          {view === "week" && renderWeekView()}
          {view === "day" && renderDayView()}
          {view === "month" && renderMonthView()}
          {view === "agenda" && renderAgendaView()}
        </div>
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
