import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import PullToRefresh from "react-pull-to-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { DemoBanner } from "@/components/DemoBanner";
import { mockCalendarEvents, MockCalendarEvent } from "@/data/mockCalendarEvents";

const Calendar = () => {
  const { toast } = useToast();
  const [events] = useState<MockCalendarEvent[]>(mockCalendarEvents);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const deleteEvent = (eventId: string) => {
    toast({
      title: "Demo Mode",
      description: "Event deletion disabled in demo",
    });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentWeek(addWeeks(currentWeek, 1)),
    onSwipedRight: () => setCurrentWeek(subWeeks(currentWeek, 1)),
    trackMouse: false,
  });

  return (
    <>
      <DemoBanner />
      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background pb-16 md:pb-0">
          <div className="border-b border-border px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h1 className="text-lg md:text-2xl font-semibold">{format(currentWeek, "MMM yyyy")}</h1>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentWeek(new Date())}>
                  Today
                </Button>
              </div>
              <Button size="sm" onClick={() => toast({ title: "Demo Mode", description: "Event creation disabled in demo" })}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6" {...swipeHandlers}>
            <div className="md:hidden space-y-3">
              {weekDays.map((day, idx) => {
                const dayEvents = events.filter(event => 
                  format(new Date(event.start_time), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <Card key={idx} className={isToday ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs text-muted-foreground">{format(day, "EEEE")}</div>
                          <div className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                            {format(day, "MMM d")}
                          </div>
                        </div>
                        {isToday && <Badge variant="default" className="text-xs">Today</Badge>}
                      </div>
                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No events</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div key={event.id} className="p-2 bg-accent/50 rounded text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{event.title}</p>
                                  <p className="text-muted-foreground">
                                    {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteEvent(event.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-sm text-muted-foreground">{format(day, "EEE")}</div>
                    <div className={`text-2xl font-semibold ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.start_time), "MMM d, h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </>
  );
};

export default Calendar;
