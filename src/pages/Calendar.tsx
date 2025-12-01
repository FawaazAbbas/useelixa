import { useState } from "react";
import { format, addDays, subDays, isToday, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getWeek, startOfYear } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import EventDetailSheet from "@/components/EventDetailSheet";
import CreateEventDialog from "@/components/CreateEventDialog";
import { DraggableEvent } from "@/components/DraggableEvent";
import { DroppableTimeSlot } from "@/components/DroppableTimeSlot";
import { DemoBanner } from "@/components/DemoBanner";
import { toast } from "sonner";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createEventDate, setCreateEventDate] = useState<Date | undefined>(undefined);
  const [miniCalDate, setMiniCalDate] = useState(new Date());
  const [eventTypeFilters, setEventTypeFilters] = useState<string[]>(["meeting", "call", "task", "reminder", "personal"]);

  const hours = Array.from({ length: 24 }, (_, i) => i); // Full 24 hours

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handlePrevious = () => {
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (view === "month") setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (view === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      toast.info("Event rescheduling is disabled in demo mode");
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleNewEvent = (date?: Date, hour?: number) => {
    const eventDate = date ? new Date(date) : new Date();
    if (hour !== undefined) {
      eventDate.setHours(hour, 0, 0, 0);
    }
    setCreateEventDate(eventDate);
    setCreateDialogOpen(true);
  };

  const activeEvent = activeId ? mockCalendarEvents.find(e => e.id === activeId) : null;

  const handleEventClick = (event: MockCalendarEvent) => {
    setSelectedEvent(event);
    setDetailSheetOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter((event) => {
      const matchesDate = isSameDay(new Date(event.start_time), day);
      const matchesFilter = eventTypeFilters.includes(event.type);
      return matchesDate && matchesFilter;
    });
  };

  const getUpcomingEvents = () => {
    return [...mockCalendarEvents]
      .filter(event => eventTypeFilters.includes(event.type))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .filter(event => new Date(event.start_time) >= new Date())
      .slice(0, 5);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: "hsl(var(--chart-1))",
      call: "hsl(var(--chart-2))",
      task: "hsl(var(--chart-3))",
      reminder: "hsl(var(--chart-4))",
      personal: "hsl(var(--chart-5))",
    };
    return colors[type] || "hsl(var(--primary))";
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: "Meeting",
      call: "Call",
      task: "Task",
      reminder: "Reminder",
      personal: "Personal",
    };
    return labels[type] || type;
  };

  // Mini Calendar
  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(miniCalDate);
    const monthEnd = endOfMonth(miniCalDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {format(miniCalDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMiniCalDate(subMonths(miniCalDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMiniCalDate(addMonths(miniCalDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day, index) => {
              if (!day)
                return <div key={`empty-${index}`} className="h-8" />;

              const dayIsToday = isToday(day);
              const dayIsSelected = isSameDay(day, currentDate);
              const hasEvents = getEventsForDay(day).length > 0;

              return (
                <Button
                  key={day.toISOString()}
                  variant={dayIsSelected ? "default" : dayIsToday ? "secondary" : "ghost"}
                  className={`h-8 w-full p-0 text-xs ${
                    dayIsSelected ? "font-bold" : ""
                  }`}
                  onClick={() => {
                    setCurrentDate(day);
                    setView("day");
                  }}
                >
                  <div className="relative">
                    {format(day, "d")}
                    {hasEvents && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Week {getWeek(currentDate, { weekStartsOn: 0 })} of {format(currentDate, "yyyy")}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg border shadow-sm bg-card">
        <div className="border-b bg-gradient-to-r from-muted/30 to-muted/50 backdrop-blur-sm">
          <div className="grid grid-cols-8 min-h-[60px]">
            <div className="border-r" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`border-r p-2 text-center transition-colors ${
                  isToday(day) ? "bg-primary/10" : ""
                }`}
              >
                <div className="text-xs text-muted-foreground uppercase font-medium">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    isToday(day) ? "text-primary" : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-400px)]">
          <div className="grid grid-cols-8 relative">
            <div className="border-r bg-gradient-to-b from-muted/20 to-muted/30">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b px-2 py-1 text-xs text-muted-foreground text-right font-medium"
                >
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <DroppableTimeSlot
                  key={day.toISOString()}
                  id={`day-${day.toISOString()}`}
                  data={{ day }}
                  className={`border-r relative ${
                    isToday(day) ? "bg-primary/5" : ""
                  }`}
                >
                  {hours.map((hour) => (
                    <div 
                      key={hour} 
                      className="h-[60px] border-b hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewEvent(day, hour);
                      }}
                    />
                  ))}

              {dayEvents.map((event, idx) => {
                    const startDate = new Date(event.start_time);
                    const endDate = new Date(event.end_time);
                    const startHour = startDate.getHours();
                    const startMinute = startDate.getMinutes();
                    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
                    const topPosition = event.is_all_day 
                      ? 10 
                      : (startHour * 60) + startMinute + (idx * 3);
                    const height = event.is_all_day ? 40 : Math.max(duration, 30);
                    
                    return (
                      <DraggableEvent
                        key={event.id}
                        id={event.id}
                        className="absolute left-1 right-1 rounded-lg p-2 text-xs shadow-md border border-white/20 backdrop-blur-sm animate-fade-in overflow-hidden"
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                          backgroundColor: event.color,
                          color: "black",
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        {!event.is_all_day && (
                          <div className="text-[10px] opacity-70 mt-0.5">
                            {format(startDate, "h:mm a")}
                          </div>
                        )}
                      </DraggableEvent>
                    );
                  })}
                </DroppableTimeSlot>
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
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg border shadow-sm bg-card">
        <div className="border-b bg-gradient-to-r from-muted/30 to-muted/50 backdrop-blur-sm p-4">
          <h2 className="text-xl font-bold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-400px)]">
          <div className="flex relative">
            <div className="w-20 shrink-0 border-r bg-gradient-to-b from-muted/20 to-muted/30">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[80px] border-b px-2 py-1 text-sm text-muted-foreground text-right font-medium"
                >
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
              ))}
            </div>

            <DroppableTimeSlot
              id={`day-${currentDate.toISOString()}`}
              data={{ day: currentDate }}
              className="flex-1 relative"
            >
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="h-[80px] border-b hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewEvent(currentDate, hour);
                  }}
                />
              ))}

              {dayEvents.map((event, idx) => {
                const startDate = new Date(event.start_time);
                const endDate = new Date(event.end_time);
                const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
                const topPosition = event.is_all_day
                  ? 10
                  : (startDate.getHours() * 80) + (startDate.getMinutes() / 60 * 80) + 10;
                const height = event.is_all_day ? 60 : Math.max((duration / 60) * 80, 60);

                return (
                  <DraggableEvent
                    key={event.id}
                    id={event.id}
                    className="absolute left-2 right-2 rounded-lg p-3 border-l-4 shadow-lg backdrop-blur-sm animate-fade-in overflow-hidden"
                    style={{
                      top: `${topPosition}px`,
                      height: `${height}px`,
                      borderLeftColor: event.color,
                      backgroundColor: "hsl(var(--card))",
                      animationDelay: `${idx * 50}ms`,
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    <div className="font-semibold">{event.title}</div>
                    {!event.is_all_day && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {event.location}
                      </div>
                    )}
                  </DraggableEvent>
                );
              })}
            </DroppableTimeSlot>
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
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden shadow-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-gradient-to-b from-muted/50 to-muted/30 p-3 text-center text-sm font-bold backdrop-blur-sm"
            >
              {day}
            </div>
          ))}

          {allDays.map((day, index) => {
            if (!day)
              return (
                <div
                  key={`empty-${index}`}
                  className="bg-muted/20 min-h-[100px] md:min-h-[120px]"
                />
              );

            const events = getEventsForDay(day);
            const dayIsToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleNewEvent(day)}
                className={`bg-card min-h-[100px] md:min-h-[120px] p-2 cursor-pointer hover:bg-accent/5 transition-colors ${
                  dayIsToday
                    ? "ring-2 ring-primary ring-inset bg-primary/5"
                    : ""
                }`}
              >
                <div
                  className={`text-sm font-bold mb-2 ${
                    dayIsToday
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className="text-[10px] md:text-xs rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 shadow-sm border border-white/20"
                      style={{
                        backgroundColor: event.color,
                        color: "black",
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1.5 font-medium">
                      +{events.length - 3} more
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
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      .slice(0, 20);

    return (
      <ScrollArea className="flex-1 w-full h-[calc(100vh-400px)]">
        <div className="space-y-3 w-full">
          {upcomingEvents.map((event, idx) => {
            const startDate = new Date(event.start_time);
            return (
              <Card
                key={event.id}
                className="w-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200 border-l-4 animate-fade-in bg-gradient-to-r from-card to-card/80 backdrop-blur-sm"
                onClick={() => handleEventClick(event)}
                style={{
                  borderLeftColor: event.color,
                  animationDelay: `${idx * 30}ms`,
                }}
              >
                <CardContent className="p-4 flex gap-4 items-center">
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(startDate, "EEE, MMM d")} •{" "}
                      {event.is_all_day
                        ? "All Day"
                        : format(startDate, "h:mm a")}
                    </div>
                    {event.location && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs shrink-0"
                    style={{
                      backgroundColor: event.color + "20",
                      color: event.color,
                      borderColor: event.color + "40",
                    }}
                  >
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <DemoBanner />

        <div className="flex-1 overflow-y-auto">
          <div className="py-6 px-8 md:py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <CalendarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">Calendar</h1>
                      <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Manage your schedule and events
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleNewEvent()}
                    className="shrink-0 h-10 md:h-11 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Event</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>

                {/* Event Type Filters */}
                <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter by type:</span>
                </div>
                <ToggleGroup
                  type="multiple"
                  value={eventTypeFilters}
                  onValueChange={(value) => {
                    if (value.length > 0) {
                      setEventTypeFilters(value);
                    }
                  }}
                  className="justify-start flex-wrap"
                >
                  <ToggleGroupItem
                    value="meeting"
                    aria-label="Toggle meetings"
                    className="data-[state=on]:bg-chart-1/20 data-[state=on]:text-chart-1 data-[state=on]:border-chart-1"
                  >
                    Meeting
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="call"
                    aria-label="Toggle calls"
                    className="data-[state=on]:bg-chart-2/20 data-[state=on]:text-chart-2 data-[state=on]:border-chart-2"
                  >
                    Call
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="task"
                    aria-label="Toggle tasks"
                    className="data-[state=on]:bg-chart-3/20 data-[state=on]:text-chart-3 data-[state=on]:border-chart-3"
                  >
                    Task
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="reminder"
                    aria-label="Toggle reminders"
                    className="data-[state=on]:bg-chart-4/20 data-[state=on]:text-chart-4 data-[state=on]:border-chart-4"
                  >
                    Reminder
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="personal"
                    aria-label="Toggle personal"
                    className="data-[state=on]:bg-chart-5/20 data-[state=on]:text-chart-5 data-[state=on]:border-chart-5"
                  >
                    Personal
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

                {/* Navigation and Views */}
                <Card className="shadow-lg bg-card/50 backdrop-blur-sm border hover:shadow-xl transition-all animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevious}
                          className="h-10 w-10 hover:bg-primary/10 hover:scale-105 transition-all"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleToday}
                          className="h-10 px-4 hover:bg-primary/10 hover:scale-105 transition-all"
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleNext}
                          className="h-10 w-10 hover:bg-primary/10 hover:scale-105 transition-all"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <Tabs
                        value={view}
                        onValueChange={(v) => setView(v as any)}
                        className="flex-1"
                      >
                        <TabsList className="grid grid-cols-3 w-full h-10">
                          <TabsTrigger value="day" className="text-xs sm:text-sm">
                            Day
                          </TabsTrigger>
                          <TabsTrigger value="week" className="text-xs sm:text-sm">
                            Week
                          </TabsTrigger>
                          <TabsTrigger value="month" className="text-xs sm:text-sm">
                            Month
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="text-xs sm:text-sm px-3 py-1.5 font-medium"
                      >
                        {view === "month" && format(currentDate, "MMMM yyyy")}
                        {view === "week" &&
                          format(currentDate, "MMM d") +
                            " - " +
                            format(
                              addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6),
                              "MMM d, yyyy"
                            )}
                        {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Week {getWeek(currentDate, { weekStartsOn: 0 })}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Views */}
              <div className="mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
                {view === "month" && renderMonthView()}
              </div>
            </div>
          </div>
        </div>

        <EventDetailSheet
          event={selectedEvent}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
        />

        <CreateEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          initialDate={createEventDate}
        />

        <DragOverlay>
          {activeEvent && (
            <div
              className="rounded-lg p-2 text-xs shadow-xl border border-white/20 backdrop-blur-sm opacity-90"
              style={{
                backgroundColor: activeEvent.color,
                color: "black",
              }}
            >
              <div className="font-semibold">{activeEvent.title}</div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Calendar;
