import { useState } from "react";
import { format, addDays, subDays, isToday, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, LayoutGrid, List, CalendarDays } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import EventDetailSheet from "@/components/EventDetailSheet";
import CreateEventDialog from "@/components/CreateEventDialog";
import { DraggableEvent } from "@/components/DraggableEvent";
import { DroppableTimeSlot } from "@/components/DroppableTimeSlot";
import { DemoBanner } from "@/components/DemoBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<MockCalendarEvent | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createEventDate, setCreateEventDate] = useState<Date | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
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

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleNewEvent = (date?: Date, hour?: number) => {
    const eventDate = date ? new Date(date) : new Date();
    if (hour !== undefined) eventDate.setHours(hour, 0, 0, 0);
    setCreateEventDate(eventDate);
    setCreateDialogOpen(true);
  };

  const activeEvent = activeId ? mockCalendarEvents.find(e => e.id === activeId) : null;

  const handleEventClick = (event: MockCalendarEvent) => {
    setSelectedEvent(event);
    setDetailSheetOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return mockCalendarEvents.filter((event) => isSameDay(new Date(event.start_time), day));
  };

  const getUpcomingEvents = () => {
    return [...mockCalendarEvents]
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .filter(event => new Date(event.start_time) >= new Date())
      .slice(0, 5);
  };

  const getDateRangeLabel = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  // Mini Calendar Component
  const MiniCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">{format(currentDate, "MMMM yyyy")}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {allDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="h-7" />;
            const dayIsToday = isToday(day);
            const dayIsSelected = isSameDay(day, currentDate);
            const hasEvents = getEventsForDay(day).length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => { setCurrentDate(day); setView("day"); }}
                className={cn(
                  "h-7 w-7 rounded-full text-xs flex items-center justify-center relative transition-all hover:bg-accent",
                  dayIsSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  dayIsToday && !dayIsSelected && "bg-primary/20 text-primary font-bold"
                )}
              >
                {format(day, "d")}
                {hasEvents && !dayIsSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="h-full w-full flex flex-col border rounded-lg bg-card overflow-hidden">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] w-full border-b bg-muted/30 shrink-0">
          <div className="border-r" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center border-r last:border-r-0",
                isToday(day) && "bg-primary/10"
              )}
            >
              <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</div>
              <div className={cn(
                "text-lg font-semibold mt-0.5",
                isToday(day) && "text-primary"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 w-full">
          <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] w-full min-h-[1344px]">
            <div className="border-r">
              {hours.map((hour) => (
                <div key={hour} className="h-14 border-b px-2 text-[10px] text-muted-foreground text-right pt-1">
                  {format(new Date().setHours(hour, 0), "ha")}
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
                  className={cn("border-r last:border-r-0 relative", isToday(day) && "bg-primary/5")}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-14 border-b hover:bg-accent/20 cursor-pointer transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleNewEvent(day, hour); }}
                    />
                  ))}
                  {dayEvents.map((event) => {
                    const startDate = new Date(event.start_time);
                    const endDate = new Date(event.end_time);
                    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                    const topPosition = event.is_all_day ? 4 : (startDate.getHours() * 56) + (startDate.getMinutes() / 60 * 56);
                    const height = event.is_all_day ? 24 : Math.max((duration / 60) * 56, 24);

                    return (
                      <DraggableEvent
                        key={event.id}
                        id={event.id}
                        className="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-[10px] shadow-sm overflow-hidden cursor-pointer"
                        style={{ top: `${topPosition}px`, height: `${height}px`, backgroundColor: event.color, color: "#000", zIndex: 10 }}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {height > 30 && !event.is_all_day && (
                          <div className="opacity-70">{format(startDate, "h:mma")}</div>
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
  const DayView = () => {
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="h-full w-full flex flex-col border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/30 shrink-0">
          <h2 className="text-lg font-semibold">{format(currentDate, "EEEE, MMMM d")}</h2>
        </div>

        <ScrollArea className="flex-1 w-full">
          <div className="flex w-full min-h-[1536px]">
            <div className="w-16 shrink-0 border-r">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b px-2 text-xs text-muted-foreground text-right pt-1">
                  {format(new Date().setHours(hour, 0), "ha")}
                </div>
              ))}
            </div>

            <DroppableTimeSlot id={`day-${currentDate.toISOString()}`} data={{ day: currentDate }} className="flex-1 relative min-w-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b hover:bg-accent/20 cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleNewEvent(currentDate, hour); }}
                />
              ))}
              {dayEvents.map((event) => {
                const startDate = new Date(event.start_time);
                const endDate = new Date(event.end_time);
                const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                const topPosition = event.is_all_day ? 8 : (startDate.getHours() * 64) + (startDate.getMinutes() / 60 * 64);
                const height = event.is_all_day ? 48 : Math.max((duration / 60) * 64, 48);

                return (
                  <DraggableEvent
                    key={event.id}
                    id={event.id}
                    className="absolute left-2 right-2 rounded-lg p-2 border-l-4 shadow-sm cursor-pointer bg-card"
                    style={{ top: `${topPosition}px`, height: `${height}px`, borderLeftColor: event.color, zIndex: 10 }}
                    onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    {!event.is_all_day && (
                      <div className="text-xs text-muted-foreground">{format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}</div>
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
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    const allDays = [...paddingDays, ...monthDays];

    return (
      <div className="h-full w-full flex flex-col border rounded-lg bg-card overflow-hidden">
        <div className="grid grid-cols-7 w-full border-b bg-muted/30 shrink-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium border-r last:border-r-0">{day}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 w-full auto-rows-fr">
          {allDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="border-b border-r bg-muted/10" />;

            const events = getEventsForDay(day);
            const dayIsToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleNewEvent(day)}
                className={cn(
                  "border-b border-r p-1.5 cursor-pointer hover:bg-accent/10 transition-colors overflow-hidden",
                  dayIsToday && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  dayIsToday && "bg-primary text-primary-foreground"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                      className="text-[10px] rounded px-1 py-0.5 truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: event.color, color: "#000" }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">+{events.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
        <DemoBanner />
        
        {/* Top Navigation Bar */}
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-2xl hidden sm:inline">Calendar</span>
            </div>

            {/* Right: View Toggles */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              <Button
                variant={view === "day" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="h-7 px-2.5 gap-1"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Day</span>
              </Button>
              <Button
                variant={view === "week" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="h-7 px-2.5 gap-1"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Week</span>
              </Button>
              <Button
                variant={view === "month" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="h-7 px-2.5 gap-1"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Month</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden w-full">
          {/* Sidebar */}
          <div className={cn(
            "hidden lg:flex flex-col w-64 border-r bg-card/50 shrink-0 transition-all overflow-hidden",
            !sidebarOpen && "w-0 overflow-hidden"
          )}>
            <ScrollArea className="flex-1">
              {/* Create Button */}
              <div className="p-4">
                <Button 
                  onClick={() => handleNewEvent()} 
                  className="w-full gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  Create
                </Button>
              </div>
              
              <MiniCalendar />
              
              <div className="border-t">
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Upcoming</h3>
                  <div className="space-y-2">
                    {getUpcomingEvents().map((event) => {
                      const startDate = new Date(event.start_time);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="p-2 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: event.color }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{event.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(startDate, "MMM d")} · {event.is_all_day ? "All day" : format(startDate, "h:mma")}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {getUpcomingEvents().length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Calendar View */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0 w-full">
            {/* Date Navigation - Above Calendar */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevious}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNext}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday} className="ml-2 h-9">
                  Today
                </Button>
              </div>
              <h2 className="text-lg font-medium text-muted-foreground">
                {getDateRangeLabel()}
              </h2>
            </div>
            
            {view === "week" && <WeekView />}
            {view === "day" && <DayView />}
            {view === "month" && <MonthView />}
          </div>
        </div>

        <EventDetailSheet event={selectedEvent} open={detailSheetOpen} onOpenChange={setDetailSheetOpen} />
        <CreateEventDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} initialDate={createEventDate} />

        <DragOverlay>
          {activeEvent && (
            <div className="rounded px-2 py-1 text-xs shadow-lg" style={{ backgroundColor: activeEvent.color, color: "#000" }}>
              <div className="font-medium">{activeEvent.title}</div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Calendar;
