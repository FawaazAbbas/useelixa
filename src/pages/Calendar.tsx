import { useState } from "react";
import { format, addDays, subDays, isToday, getHours, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getMinutes, isFuture, isPast } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid3x3 } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import EventDetailSheet from "@/components/EventDetailSheet";
import CreateEventDialog from "@/components/CreateEventDialog";
import { DemoBanner } from "@/components/DemoBanner";
import { DraggableEvent } from "@/components/DraggableEvent";
import { DroppableTimeSlot } from "@/components/DroppableTimeSlot";
import { toast } from "sonner";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("week");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [miniCalendarDate, setMiniCalendarDate] = useState<Date | undefined>(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    toast.info("Event rescheduling disabled in demo mode");
  };

  const activeEvent = activeId ? mockCalendarEvents.find((e) => e.id === activeId) : null;

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);
    if (currentHour < 7 || currentHour >= 23) return null;
    const top = ((currentHour - 7) * 60 + currentMinute) * (60 / 60);
    return top;
  };

  const getEventTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      meeting: "Meeting",
      call: "Call",
      task: "Task",
      reminder: "Reminder",
      personal: "Personal",
    };
    return typeMap[type] || type;
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const currentTimeTop = getCurrentTimePosition();

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
                <div className="text-xs text-muted-foreground font-medium uppercase">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-2xl font-semibold ${
                    isToday(day) ? "text-primary" : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-8 relative">
            <div className="border-r bg-muted/30">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b px-2 py-1 text-xs text-muted-foreground text-right"
                >
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r relative ${isToday(day) ? "bg-primary/5" : ""}`}
                >
                  {hours.map((hour) => (
                    <DroppableTimeSlot
                      key={hour}
                      id={`week-${day.toISOString()}-${hour}`}
                      data={{ day, hour }}
                      className="h-[60px] border-b hover:bg-accent/20 transition-colors"
                    >
                      <div className="w-full h-full" />
                    </DroppableTimeSlot>
                  ))}

                  {dayEvents.map((event) => {
                    const start = new Date(event.start_time);
                    const end = new Date(event.end_time);
                    const startHour = getHours(start);
                    const startMinute = getMinutes(start);
                    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                    const top = ((startHour - 7) * 60 + startMinute);
                    const height = Math.max(duration, 30);

                    return (
                      <DraggableEvent
                        key={event.id}
                        id={event.id}
                        onClick={() => handleEventClick(event)}
                        className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden shadow-sm hover:shadow-md transition-all z-10"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: event.color,
                          color: "white",
                        }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        {height > 40 && (
                          <div className="text-[10px] opacity-90 mt-0.5">
                            {format(start, "h:mm a")}
                          </div>
                        )}
                      </DraggableEvent>
                    );
                  })}

                  {isToday(day) && currentTimeTop !== null && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${currentTimeTop}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="flex-1 h-[2px] bg-red-500" />
                      </div>
                    </div>
                  )}
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
    const currentTimeTop = getCurrentTimePosition();

    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b bg-background p-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-12 relative">
            <div className="col-span-1 border-r bg-muted/30">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[80px] border-b px-2 py-1 text-xs text-muted-foreground text-right"
                >
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            <div className="col-span-11 relative">
              {hours.map((hour) => (
                <DroppableTimeSlot
                  key={hour}
                  id={`day-${hour}`}
                  data={{ day: currentDate, hour }}
                  className="h-[80px] border-b hover:bg-accent/20 transition-colors"
                >
                  <div className="w-full h-full" />
                </DroppableTimeSlot>
              ))}

              {dayEvents.map((event) => {
                const start = new Date(event.start_time);
                const end = new Date(event.end_time);
                const startHour = getHours(start);
                const startMinute = getMinutes(start);
                const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                const top = ((startHour - 7) * 80 + (startMinute * 80) / 60);
                const height = Math.max((duration * 80) / 60, 40);

                return (
                  <DraggableEvent
                    key={event.id}
                    id={event.id}
                    onClick={() => handleEventClick(event)}
                    className="absolute left-2 right-2 rounded-lg p-3 overflow-hidden shadow-md hover:shadow-lg transition-all z-10 border-l-4"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      borderLeftColor: event.color,
                      backgroundColor: "hsl(var(--card))",
                    }}
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(start, "h:mm a")} - {format(end, "h:mm a")}
                    </div>
                    {event.location && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {event.location}
                      </div>
                    )}
                  </DraggableEvent>
                );
              })}

              {isToday(currentDate) && currentTimeTop !== null && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: `${(currentTimeTop * 80) / 60}px` }}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 -ml-1" />
                    <div className="flex-1 h-[2px] bg-red-500" />
                  </div>
                </div>
              )}
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
            <div
              key={day}
              className="bg-muted p-3 text-center text-sm font-semibold"
            >
              {day}
            </div>
          ))}

          {allDays.map((day, index) => {
            if (!day)
              return (
                <div key={`empty-${index}`} className="bg-background min-h-[120px]" />
              );

            const events = getEventsForDay(day);
            const dayIsToday = isToday(day);

            return (
              <DroppableTimeSlot
                key={day.toISOString()}
                id={`month-${day.toISOString()}`}
                data={{ day }}
                className={`bg-background min-h-[120px] p-2 hover:bg-accent/10 transition-colors ${
                  dayIsToday ? "ring-2 ring-primary ring-inset" : ""
                }`}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    dayIsToday
                      ? "text-primary"
                      : isPast(day)
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="text-xs rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color, color: "white" }}
                    >
                      {format(new Date(event.start_time), "h:mm a")} {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1.5">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </DroppableTimeSlot>
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
      .filter((event) => isFuture(new Date(event.start_time)) || isToday(new Date(event.start_time)));

    const groupedByDate = upcomingEvents.reduce((acc, event) => {
      const dateKey = format(new Date(event.start_time), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, MockCalendarEvent[]>);

    return (
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {Object.entries(groupedByDate).map(([dateKey, events]) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="font-semibold text-lg sticky top-0 bg-background py-2">
                {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-2">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[60px]">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(event.start_time), "h:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "a")}
                        </div>
                      </div>
                      <Separator orientation="vertical" className="h-auto" />
                      <div
                        className="w-1 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.start_time), "h:mm a")} -{" "}
                          {format(new Date(event.end_time), "h:mm a")}
                        </div>
                        {event.location && (
                          <div className="text-sm text-muted-foreground mt-1">
                            📍 {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <DemoBanner />

        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Calendar</h1>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleToday} className="min-w-[80px]">
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-lg font-semibold text-muted-foreground">
                {view === "day" && format(currentDate, "MMMM d, yyyy")}
                {view === "week" && `${format(startOfWeek(currentDate), "MMM d")} - ${format(addDays(startOfWeek(currentDate), 6), "MMM d, yyyy")}`}
                {view === "month" && format(currentDate, "MMMM yyyy")}
                {view === "agenda" && "Upcoming Events"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month">
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="agenda">
                    <List className="w-4 h-4 mr-2" />
                    Agenda
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-[280px] border-r bg-muted/30 flex flex-col">
            <div className="p-4">
              <MiniCalendar
                mode="single"
                selected={miniCalendarDate}
                onSelect={(date) => {
                  setMiniCalendarDate(date);
                  if (date) setCurrentDate(date);
                }}
                className="rounded-md border bg-background shadow-sm"
              />
            </div>

            <Separator />

            <div className="flex-1 overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Upcoming Events</h3>
              </div>
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-2">
                  {mockCalendarEvents.slice(0, 8).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="w-full text-left p-3 rounded-lg hover:bg-background transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1 h-full rounded-full mt-1"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{event.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.start_time), "MMM d, h:mm a")}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main Calendar Area */}
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
          {view === "agenda" && renderAgendaView()}
        </div>

        {/* Dialogs */}
        <EventDetailSheet
          event={selectedEvent}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
        />
        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <DragOverlay>
          {activeEvent && (
            <div
              className="p-3 rounded-lg shadow-xl text-white text-sm font-medium opacity-90"
              style={{ backgroundColor: activeEvent.color }}
            >
              {activeEvent.title}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Calendar;
