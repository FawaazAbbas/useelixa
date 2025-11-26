import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import PullToRefresh from "react-pull-to-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().trim().max(200, "Location must be less than 200 characters").optional()
});

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
}

const Calendar = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchEvents();

    const channel = supabase
      .channel("calendar-events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_events",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, navigate, currentWeek]);

  const fetchEvents = async () => {
    if (!user) return;

    const startDate = new Date(weekStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(weekStart);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time");

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    await fetchEvents();
  }, [currentWeek, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = eventSchema.parse(formData);

      const { error } = await supabase.from("calendar_events").insert([{
        title: validatedData.title,
        description: validatedData.description || null,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        location: validatedData.location || null,
        user_id: user?.id!
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully"
      });

      setDialogOpen(false);
      setFormData({ title: "", description: "", start_time: "", end_time: "", location: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create event"
        });
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event"
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted"
      });
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentWeek(addWeeks(currentWeek, 1)),
    onSwipedRight: () => setCurrentWeek(subWeeks(currentWeek, 1)),
    trackMouse: false,
  });

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter event description"
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  {errors.start_time && <p className="text-sm text-destructive mt-1">{errors.start_time}</p>}
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                  {errors.end_time && <p className="text-sm text-destructive mt-1">{errors.end_time}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Create Event</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6" {...swipeHandlers}>
        {/* Mobile: Simplified day list view with swipe navigation */}
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

        {/* Desktop: Week grid view */}
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
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events this week. Create one to get started!</p>
              </div>
            ) : (
              events.map((event) => (
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
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
};

export default Calendar;
