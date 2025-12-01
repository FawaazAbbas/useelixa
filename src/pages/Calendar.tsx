import { useState } from "react";
import { format, addDays, subDays, isToday, getHours, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import EventDetailSheet from "@/components/EventDetailSheet";
import CreateEventDialog from "@/components/CreateEventDialog";
import { DemoBanner } from "@/components/DemoBanner";
import { DraggableEvent } from "@/components/DraggableEvent";
import { DroppableTimeSlot } from "@/components/DroppableTimeSlot";
import { toast } from "sonner";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [miniCalendarDate, setMiniCalendarDate] = useState<Date | undefined>(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createEventTime, setCreateEventTime] = useState<Date | undefined>();

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  const handlePrevious = () => {
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -7));
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 7));
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

  const getAllDayEvents = (day: Date) => {
    return getEventsForDay(day).filter((event) => event.is_all_day);
  };

  const getTimedEvents = (day: Date) => {
    return getEventsForDay(day).filter((event) => !event.is_all_day);
  };

  const handleTimeSlotClick = (hour: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hour, 0, 0, 0);
    setCreateEventTime(newDate);
    setCreateDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const eventId = active.id as string;
    const dropData = over.data.current as { day: Date; hour?: number; isAllDay?: boolean };

    if (!dropData) return;

    toast.info(
      `Event rescheduling disabled in demo mode. Would reschedule event to ${format(dropData.day, "MMM d, yyyy")}${
        dropData.hour !== undefined ? ` at ${format(new Date().setHours(dropData.hour, 0), "h:mm a")}` : ""
      }`
    );
  };

  const activeEvent = activeId ? mockCalendarEvents.find((e) => e.id === activeId) : null;

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = getHours(now);
    const currentMinute = now.getMinutes();
    if (currentHour < 6 || currentHour >= 23) return null;
    const top = ((currentHour - 6) * 60 + currentMinute) * (80 / 60); // 80px per hour
    return top;
  };

  const renderDayView = () => {
    const allDayEvents = getAllDayEvents(currentDate);
    const timedEvents = getTimedEvents(currentDate);
    const currentTimeTop = getCurrentTimePosition();

    return (
      <div className="flex-1 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {/* All-Day Events Section */}
            {allDayEvents.length > 0 && (
              <DroppableTimeSlot
                id={`allday-${currentDate.toISOString()}`}
                data={{ day: currentDate, isAllDay: true }}
                className="border-b bg-muted/30 p-4"
              >
                <div className="text-xs font-semibold text-muted-foreground mb-2">All Day</div>
                <div className="space-y-2">
                  {allDayEvents.map((event) => (
                    <DraggableEvent
                      key={event.id}
                      id={event.id}
                      onClick={() => handleEventClick(event)}
                      className="w-full text-left rounded-lg px-3 py-2 text-white font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.title}
                    </DraggableEvent>
                  ))}
                </div>
              </DroppableTimeSlot>
            )}

            {/* Hourly Time Grid */}
            <div className="relative">
              {hours.map((hour) => {
                const hourEvents = timedEvents.filter((event) => {
                  const eventHour = getHours(new Date(event.start_time));
                  return eventHour === hour;
                });

                return (
                  <div key={hour} className="flex border-b">
                    <div className="w-20 p-4 text-sm text-muted-foreground shrink-0 border-r">
                      {format(new Date().setHours(hour, 0), "h a")}
                    </div>
                    <DroppableTimeSlot
                      id={`timeslot-${hour}`}
                      data={{ day: currentDate, hour }}
                      className="flex-1 min-h-20 p-3 hover:bg-accent/30 transition-colors cursor-pointer group relative"
                      onClick={(e) => {
                        if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('[data-draggable]')) {
                          handleTimeSlotClick(hour);
                        }
                      }}
                    >
                      {hourEvents.length === 0 ? (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm text-muted-foreground">
                          <Plus className="w-4 h-4" />
                          <span>Add event</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hourEvents.map((event) => (
                            <DraggableEvent
                              key={event.id}
                              id={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className="w-full text-left p-3 rounded-lg transition-all shadow-sm hover:shadow-md z-[5] hover:z-10 border-l-4"
                              style={{
                                borderLeftColor: event.color,
                                backgroundColor: "hsl(var(--accent))",
                              }}
                            >
                              <div className="font-semibold text-sm">{event.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(event.start_time), "h:mm a")} -{" "}
                                {format(new Date(event.end_time), "h:mm a")}
                              </div>
                              {event.location && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  📍 {event.location}
                                </div>
                              )}
                            </DraggableEvent>
                          ))}
                        </div>
                      )}
                    </DroppableTimeSlot>
                  </div>
                );
              })}

              {/* Current Time Indicator */}
              {isToday(currentDate) && currentTimeTop !== null && (
                <div
                  className="absolute left-20 right-0 z-20 pointer-events-none"
                  style={{ top: `${currentTimeTop + (allDayEvents.length > 0 ? 72 : 0)}px` }}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex-1 overflow-auto">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
                  <div className="p-3 border-r text-xs text-muted-foreground font-semibold">Time</div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`p-3 text-center border-r ${isToday(day) ? "bg-primary/10" : ""}`}
                    >
                      <div className="text-xs text-muted-foreground font-semibold">{format(day, "EEE")}</div>
                      <div className={`text-xl font-bold ${isToday(day) ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-8">
                  <div className="border-r">
                    {hours.map((hour) => (
                      <div key={hour} className="h-20 border-b p-2 text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0), "h a")}
                      </div>
                    ))}
                  </div>
                  {weekDays.map((day) => (
                    <div key={day.toISOString()} className="border-r relative">
                      {hours.map((hour) => (
                        <DroppableTimeSlot
                          key={hour}
                          id={`week-${day.toISOString()}-${hour}`}
                          data={{ day, hour }}
                          className="h-20 border-b hover:bg-accent/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setCurrentDate(day);
                            handleTimeSlotClick(hour);
                          }}
                        >
                          <div className="w-full h-full" />
                        </DroppableTimeSlot>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <div className="flex-1 overflow-auto">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {allDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="min-h-24" />;
                const events = getEventsForDay(day);
                const dayIsToday = isToday(day);

                return (
                  <DroppableTimeSlot
                    key={day.toISOString()}
                    id={`month-${day.toISOString()}`}
                    data={{ day }}
                    className={`min-h-24 p-2 rounded-lg border hover:border-primary transition-colors cursor-pointer ${
                      dayIsToday ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setCurrentDate(day);
                      setView("day");
                    }}
                  >
                    <div className={`text-sm font-semibold mb-1 ${dayIsToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] truncate rounded px-1 py-0.5 text-white cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{events.length - 3} more</div>
                      )}
                    </div>
                  </DroppableTimeSlot>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <DemoBanner />

        <div className="w-full p-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-muted-foreground">
                {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
                {view === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
                {view === "month" && format(currentDate, "MMMM yyyy")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          {/* Event Type Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Reminder</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Personal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sidebar */}
            <div className="lg:w-64 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mini Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <MiniCalendar
                    mode="single"
                    selected={miniCalendarDate}
                    onSelect={(date) => {
                      setMiniCalendarDate(date);
                      if (date) {
                        setCurrentDate(date);
                        setView("day");
                      }
                    }}
                    className="rounded-md border-0"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCalendarEvents.slice(0, 5).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors relative pl-3"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="text-xs font-medium truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "MMM d, h:mm a")}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Calendar Area */}
            {view === "day" && renderDayView()}
            {view === "week" && renderWeekView()}
            {view === "month" && renderMonthView()}
          </div>
        </div>

        {/* Dialogs and Sheets */}
        <EventDetailSheet
          event={selectedEvent}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
        />

        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          initialDate={createEventTime}
        />

        <DragOverlay>
          {activeEvent && (
            <div
              className="p-3 rounded-lg shadow-lg text-white text-sm font-medium opacity-90"
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
