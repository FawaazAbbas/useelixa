import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  source?: "local";
  htmlLink?: string;
}

export type ViewMode = "month" | "week" | "day";

interface CalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const CalendarGrid = ({
  events,
  selectedDate,
  onSelectDate,
  onEventClick,
  viewMode,
  onViewModeChange,
}: CalendarGridProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const navigatePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onSelectDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), date));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold ml-2">
            {viewMode === "day"
              ? format(currentDate, "EEEE, MMMM d, yyyy")
              : viewMode === "week"
              ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
              : format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "secondary" : "ghost"}
              size="sm"
              className="capitalize px-3"
              onClick={() => onViewModeChange(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {viewMode === "month" && (
        <MonthView
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          getEventsForDate={getEventsForDate}
          onEventClick={onEventClick}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          events={events}
          onEventClick={onEventClick}
        />
      )}
      {viewMode === "day" && (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};

// Month View Component
const MonthView = ({
  currentDate,
  selectedDate,
  onSelectDate,
  getEventsForDate,
  onEventClick,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {weekDay}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(6,minmax(80px,1fr))]">
        {days.map((dayDate, index) => {
          const dayEvents = getEventsForDate(dayDate);
          const isCurrentMonth = isSameMonth(dayDate, currentDate);
          const isSelected = isSameDay(dayDate, selectedDate);
          const isTodayDate = isToday(dayDate);

          return (
            <div
              key={index}
              className={cn(
                "border-b border-r p-1 cursor-pointer transition-colors hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isSelected && "bg-primary/10"
              )}
              onClick={() => onSelectDate(dayDate)}
            >
              <div
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1",
                  isTodayDate && "bg-primary text-primary-foreground font-semibold",
                  isSelected && !isTodayDate && "bg-accent font-medium"
                )}
              >
                {format(dayDate, "d")}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: event.color,
                      color: "white",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1.5">
                    +{dayEvents.length - 3} more
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

// Week View Component
const WeekView = ({
  currentDate,
  selectedDate,
  onSelectDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) => {
  const weekStart = startOfWeek(currentDate);
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, date) && eventStart.getHours() === hour;
    });
  };

  const getAllDayEvents = (date: Date) => {
    return events.filter(
      (event) => event.all_day && isSameDay(new Date(event.start_time), date)
    );
  };

  return (
    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-muted/50 border-b">
        <div className="py-2 border-r" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "py-2 text-center border-r cursor-pointer hover:bg-muted/50",
              isSameDay(day, selectedDate) && "bg-primary/10"
            )}
            onClick={() => onSelectDate(day)}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "text-lg font-medium w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                isToday(day) && "bg-primary text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/20">
        <div className="py-1 px-2 text-xs text-muted-foreground border-r">
          All day
        </div>
        {weekDays.map((day) => {
          const allDayEvents = getAllDayEvents(day);
          return (
            <div key={day.toISOString()} className="p-1 border-r min-h-[40px]">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: event.color,
                    color: "white",
                  }}
                  onClick={() => onEventClick(event)}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="h-12 border-b border-r px-2 text-xs text-muted-foreground flex items-start pt-0.5">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              {weekDays.map((day) => {
                const hourEvents = getEventsForDateAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="h-12 border-b border-r p-0.5 relative"
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="absolute inset-x-0.5 top-0.5 text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: event.color,
                          color: "white",
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Day View Component
const DayView = ({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return (
        isSameDay(eventStart, currentDate) &&
        eventStart.getHours() === hour &&
        !event.all_day
      );
    });
  };

  const allDayEvents = events.filter(
    (event) => event.all_day && isSameDay(new Date(event.start_time), currentDate)
  );

  return (
    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-2 border-b bg-muted/20">
          <div className="text-xs text-muted-foreground mb-1">All Day</div>
          <div className="flex flex-wrap gap-1">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="text-sm px-2 py-1 rounded cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: event.color,
                  color: "white",
                }}
                onClick={() => onEventClick(event)}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time slots */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="flex border-b min-h-[48px]">
              <div className="w-16 flex-shrink-0 border-r px-2 py-1 text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0), "h:mm a")}
              </div>
              <div className="flex-1 p-1">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-sm px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: event.color,
                      color: "white",
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-80">
                      {format(new Date(event.start_time), "h:mm a")} -{" "}
                      {format(new Date(event.end_time), "h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};