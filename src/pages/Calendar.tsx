import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  created_at: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "09:00",
    end_date: "",
    end_time: "10:00",
    all_day: false,
    color: "#3b82f6",
  });

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
    } else {
      setEvents((data as CalendarEvent[]) || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !user) return;

    const startDateTime = formData.all_day
      ? `${formData.start_date}T00:00:00`
      : `${formData.start_date}T${formData.start_time}:00`;
    
    const endDateTime = formData.all_day
      ? `${formData.end_date || formData.start_date}T23:59:59`
      : `${formData.end_date || formData.start_date}T${formData.end_time}:00`;

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      start_time: startDateTime,
      end_time: endDateTime,
      all_day: formData.all_day,
      color: formData.color,
      user_id: user.id,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("calendar_events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        toast({ title: "Error updating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event updated" });
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("calendar_events").insert(eventData);

      if (error) {
        toast({ title: "Error creating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event created" });
        fetchEvents();
      }
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted" });
      fetchEvents();
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    setFormData({
      title: event.title,
      description: event.description || "",
      start_date: format(startDate, "yyyy-MM-dd"),
      start_time: format(startDate, "HH:mm"),
      end_date: format(endDate, "yyyy-MM-dd"),
      end_time: format(endDate, "HH:mm"),
      all_day: event.all_day,
      color: event.color,
    });
    setDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const openNewEventDialog = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      start_date: format(selectedDate, "yyyy-MM-dd"),
      end_date: format(selectedDate, "yyyy-MM-dd"),
    }));
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      start_time: "09:00",
      end_date: format(new Date(), "yyyy-MM-dd"),
      end_time: "10:00",
      all_day: false,
      color: "#3b82f6",
    });
    setEditingEvent(null);
    setDialogOpen(false);
  };

  const eventsOnSelectedDate = events.filter(event => 
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const datesWithEvents = events.map(e => new Date(e.start_time));

  if (!user) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <header className="border-b bg-card/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
        </header>
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to manage events.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Calendar</h1>
            <Badge variant="secondary">{events.length} events</Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewEventDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="all-day"
                    checked={formData.all_day}
                    onCheckedChange={(v) => setFormData({ ...formData, all_day: v })}
                  />
                  <Label htmlFor="all-day">All day event</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  {!formData.all_day && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                  {!formData.all_day && (
                    <div>
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <Input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex gap-2 mt-1">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((c) => (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? "border-foreground" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setFormData({ ...formData, color: c })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingEvent ? "Update" : "Create"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6">
            <Card className="p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={{ hasEvent: datesWithEvents }}
                modifiersStyles={{
                  hasEvent: { fontWeight: "bold", textDecoration: "underline" }
                }}
              />
            </Card>

            <div className="space-y-4">
              <h2 className="font-semibold text-lg">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>
              
              {eventsOnSelectedDate.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No events on this day</p>
                    <Button variant="link" onClick={openNewEventDialog}>
                      Add an event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {eventsOnSelectedDate.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div
                              className="w-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {event.all_day
                                  ? "All day"
                                  : `${format(new Date(event.start_time), "h:mm a")} - ${format(new Date(event.end_time), "h:mm a")}`}
                              </p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Calendar;
