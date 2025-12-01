import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getHours, getMinutes, addWeeks, subWeeks, setHours, setMinutes } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, GripVertical } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable, DragStartEvent } from "@dnd-kit/core";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import EventDetailSheet from "@/components/EventDetailSheet";
import CreateEventDialog from "@/components/CreateEventDialog";
import { DemoBanner } from "@/components/DemoBanner";
import { DraggableEvent } from "@/components/DraggableEvent";
import { DroppableTimeSlot } from "@/components/DroppableTimeSlot";
import { toast } from "sonner";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [miniCalendarDate, setMiniCalendarDate] = useState<Date | undefined>(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  const handlePrevious = () => {
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, -1));
    else setCurrentDate(addDays(currentDate, -7));
  };

  const handleNext = () => {
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => setCurrentDate(new Date());

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    trackMouse: false,
  });

  const handleEventClick = (event: MockCalendarEvent) => {
    setSelectedEvent(event);
    setDetailSheetOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter((event) =>
      isSameDay(new Date(event.start_time), day)
    );
  };

  const getEventPosition = (event: MockCalendarEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startHour = getHours(start);
    const startMinute = getMinutes(start);
    const endHour = getHours(end);
    const endMinute = getMinutes(end);

    const top = ((startHour - 6) * 60 + startMinute) * (64 / 60); // 64px per hour
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    const height = Math.max((duration * 64) / 60, 20); // Minimum 20px height

    return { top, height };
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);
    if (currentHour < 6 || currentHour >= 23) return null;
    const top = ((currentHour - 6) * 60 + currentMinute) * (64 / 60);
    return top;
  };

  const getAllDayEvents = (day: Date) => {
    return getEventsForDay(day).filter((event) => event.is_all_day);
  };

  const getTimedEvents = (day: Date) => {
    return getEventsForDay(day).filter((event) => !event.is_all_day);
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    const newDate = new Date(day);
    newDate.setHours(hour, 0, 0, 0);
    setCurrentDate(newDate);
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
        dropData.hour !== undefined ? ` at ${format(setHours(new Date(), dropData.hour), "h:mm a")}` : ""
      }`
    );
  };

  const activeEvent = activeId ? mockCalendarEvents.find((e) => e.id === activeId) : null;

  const renderWeekView = () => {
    const currentTimeTop = getCurrentTimePosition();
    const todayIndex = weekDays.findIndex((day) => isToday(day));

    return (
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Mini Calendar Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 space-y-4">
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
                if (date) setCurrentDate(date);
              }}
              className="rounded-md border-0 pointer-events-auto"
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
                  className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div
                    className="w-1 h-full absolute left-0 rounded-l-lg"
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

      {/* Week Grid */}
      <div className="flex-1">
        {/* Mobile Day Cards */}
        <div className="md:hidden space-y-3">
          {weekDays.map((day) => {
            const events = getEventsForDay(day);
            const dayIsToday = isToday(day);

            return (
              <Card
                key={day.toISOString()}
                className={dayIsToday ? "border-primary" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {format(day, "EEEE, MMM d")}
                    </CardTitle>
                    {dayIsToday && <Badge>Today</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events</p>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                          style={{ borderLeftColor: event.color, borderLeftWidth: "3px" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{event.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {event.is_all_day
                                  ? "All Day"
                                  : `${format(new Date(event.start_time), "h:mm a")} - ${format(new Date(event.end_time), "h:mm a")}`}
                              </div>
                              {event.location && (
                                <div className="text-xs text-muted-foreground truncate">{event.location}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop Time Grid */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-20">
                  <div className="p-2 border-r text-xs text-muted-foreground">Time</div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`p-2 text-center border-r ${isToday(day) ? "bg-primary/10" : ""}`}
                    >
                      <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                      <div className={`text-lg font-semibold ${isToday(day) ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* All-Day Events Row */}
                <div className="grid grid-cols-8 border-b bg-muted/30">
                  <div className="p-2 border-r text-xs text-muted-foreground flex items-center">
                    All Day
                  </div>
                  {weekDays.map((day) => {
                    const allDayEvents = getAllDayEvents(day);
                    return (
                      <DroppableTimeSlot
                        key={day.toISOString()}
                        id={`allday-${day.toISOString()}`}
                        data={{ day, isAllDay: true }}
                        className={`min-h-12 p-1 border-r ${isToday(day) ? "bg-primary/5" : ""}`}
                      >
                        <div className="space-y-1">
                          {allDayEvents.map((event) => (
                            <DraggableEvent
                              key={event.id}
                              id={event.id}
                              className="w-full text-left rounded px-2 py-1 text-white text-xs font-medium hover:opacity-90 transition-opacity truncate"
                              style={{ backgroundColor: event.color }}
                            >
                              <button
                                onClick={() => handleEventClick(event)}
                                className="w-full text-left truncate"
                              >
                                {event.title}
                              </button>
                            </DraggableEvent>
                          ))}
                        </div>
                      </DroppableTimeSlot>
                    );
                  })}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8 relative">
                  {/* Time column */}
                  <div className="border-r">
                    {hours.map((hour) => (
                      <div key={hour} className="h-16 border-b p-2 text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0), "h a")}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day, dayIndex) => {
                    const timedEvents = getTimedEvents(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`relative border-r ${isToday(day) ? "bg-primary/5" : ""}`}
                      >
                        {hours.map((hour) => (
                          <DroppableTimeSlot
                            key={hour}
                            id={`timeslot-${day.toISOString()}-${hour}`}
                            data={{ day, hour }}
                            className="w-full h-16 border-b"
                          >
                            <button
                              onClick={() => handleTimeSlotClick(day, hour)}
                              className="w-full h-full hover:bg-accent/50 transition-colors group"
                            >
                              <div className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground transition-opacity">
                                +
                              </div>
                            </button>
                          </DroppableTimeSlot>
                        ))}
                        
                        {/* Events positioned absolutely */}
                        {timedEvents.map((event, eventIndex) => {
                          const { top, height } = getEventPosition(event);
                          // Simple overlap detection - events at same time offset slightly
                          const overlappingEvents = timedEvents.filter((e, i) => {
                            if (i >= eventIndex) return false;
                            const { top: otherTop, height: otherHeight } = getEventPosition(e);
                            return (
                              (top >= otherTop && top < otherTop + otherHeight) ||
                              (top + height > otherTop && top + height <= otherTop + otherHeight)
                            );
                          });
                          const leftOffset = overlappingEvents.length * 4;
                          const widthReduction = overlappingEvents.length * 4;

                          return (
                            <DraggableEvent
                              key={event.id}
                              id={event.id}
                              className="absolute rounded px-1.5 py-1 text-white text-xs font-medium hover:opacity-90 hover:z-10 transition-all overflow-hidden shadow-sm"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `${4 + leftOffset}px`,
                                right: `${4 + widthReduction}px`,
                                backgroundColor: event.color,
                              }}
                            >
                              <button
                                onClick={() => handleEventClick(event)}
                                className="w-full h-full text-left"
                              >
                                <div className="truncate font-semibold">{event.title}</div>
                                {height > 30 && (
                                  <div className="text-[10px] opacity-90">
                                    {format(new Date(event.start_time), "h:mm a")}
                                  </div>
                                )}
                              </button>
                            </DraggableEvent>
                          );
                        })}

                        {/* Current time indicator */}
                        {isToday(day) && currentTimeTop !== null && (
                          <div
                            className="absolute left-0 right-0 z-10 pointer-events-none"
                            style={{ top: `${currentTimeTop}px` }}
                          >
                            <div className="relative">
                              <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                              <div className="h-0.5 bg-red-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );};

  const renderMonthView = () => {
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {allDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;
              const events = getEventsForDay(day);
              const dayIsToday = isToday(day);

              return (
                <DroppableTimeSlot
                  key={day.toISOString()}
                  id={`month-${day.toISOString()}`}
                  data={{ day }}
                  className={`min-h-24 p-2 rounded-lg border hover:bg-accent transition-colors ${
                    dayIsToday ? "bg-primary/10 border-primary" : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      setCurrentDate(day);
                      setView("day");
                    }}
                    className="w-full text-left"
                  >
                    <div className={`text-sm font-semibold mb-1 ${dayIsToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </button>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <DraggableEvent
                        key={event.id}
                        id={event.id}
                        className="text-[10px] truncate rounded px-1 py-0.5 text-white"
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="truncate">{event.title}</div>
                      </DraggableEvent>
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
    );
  };

  const renderDayView = () => {
    const allDayEvents = getAllDayEvents(currentDate);
    const timedEvents = getTimedEvents(currentDate);
    const currentTimeTop = getCurrentTimePosition();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
            {isToday(currentDate) && <Badge>Today</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* All-Day Events */}
          {allDayEvents.length > 0 && (
            <div className="px-4 py-3 bg-muted/30 border-b">
              <div className="text-xs text-muted-foreground mb-2">All Day</div>
              <div className="space-y-2">
                {allDayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full text-left p-2 rounded text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {hours.map((hour) => {
              const hourEvents = timedEvents.filter((event) => {
                const eventHour = getHours(new Date(event.start_time));
                return eventHour === hour;
              });

              return (
                <div key={hour} className="flex gap-3 border-b">
                  <div className="w-20 p-3 text-sm text-muted-foreground shrink-0">
                    {format(new Date().setHours(hour, 0), "h:mm a")}
                  </div>
                  <DroppableTimeSlot
                    id={`day-${hour}`}
                    data={{ day: currentDate, hour }}
                    className="flex-1 min-h-16"
                  >
                    <button
                      onClick={() => handleTimeSlotClick(currentDate, hour)}
                      className="w-full h-full p-3 hover:bg-accent/50 transition-colors group text-left"
                    >
                      {hourEvents.length === 0 ? (
                        <div className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to add event
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hourEvents.map((event) => (
                            <DraggableEvent
                              key={event.id}
                              id={event.id}
                              className="w-full text-left p-3 rounded-lg hover:scale-[1.02] transition-transform shadow-sm"
                              style={{ borderLeftColor: event.color, borderLeftWidth: "4px", borderStyle: "solid", backgroundColor: "hsl(var(--accent))" }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                className="w-full text-left"
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                                </div>
                                {event.location && (
                                  <div className="text-sm text-muted-foreground mt-1">📍 {event.location}</div>
                                )}
                                {event.description && (
                                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</div>
                                )}
                              </button>
                            </DraggableEvent>
                          ))}
                        </div>
                      )}
                    </button>
                  </DroppableTimeSlot>
                </div>
              );
            })}

            {/* Current time indicator */}
            {isToday(currentDate) && currentTimeTop !== null && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${currentTimeTop + (allDayEvents.length > 0 ? 80 : 0)}px` }}
              >
                <div className="relative flex items-center">
                  <div className="w-20 shrink-0 flex justify-end pr-2">
                    <div className="text-xs text-red-500 font-semibold">
                      {format(new Date(), "h:mm a")}
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                    <div className="h-0.5 bg-red-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        <DemoBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {view === "week" && `Week of ${format(weekStart, "MMM d, yyyy")}`}
            {view === "month" && format(currentDate, "MMMM yyyy")}
            {view === "day" && format(currentDate, "MMMM d, yyyy")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {/* View Tabs & Legend */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Event Type Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span className="text-muted-foreground">Meeting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span className="text-muted-foreground">Call</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
            <span className="text-muted-foreground">Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
            <span className="text-muted-foreground">Reminder</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-5))" }} />
            <span className="text-muted-foreground">Personal</span>
          </div>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="week" {...swipeHandlers}>
          {renderWeekView()}
        </TabsContent>

        <TabsContent value="month" {...swipeHandlers}>
          {renderMonthView()}
        </TabsContent>

        <TabsContent value="day" {...swipeHandlers}>
          {renderDayView()}
        </TabsContent>
      </Tabs>

      {/* Event Detail Sheet */}
      <EventDetailSheet
        event={selectedEvent}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          initialDate={currentDate}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent ? (
            <div
              className="rounded px-3 py-2 text-white text-sm font-medium shadow-lg opacity-90"
              style={{ backgroundColor: activeEvent.color }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                <div>
                  <div className="font-semibold">{activeEvent.title}</div>
                  <div className="text-xs opacity-90">
                    {format(new Date(activeEvent.start_time), "h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Calendar;
