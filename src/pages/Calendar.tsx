import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  created_at?: string;
  source?: "local" | "google";
  htmlLink?: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleAccount, setGoogleAccount] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "local" | "google">("all");
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
    if (user) {
      fetchLocalEvents();
      syncGoogleCalendar();
    }
  }, [user]);

  const fetchLocalEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
    } else {
      setLocalEvents((data as CalendarEvent[])?.map(e => ({ ...e, source: "local" as const })) || []);
    }
    setLoading(false);
  };

  const syncGoogleCalendar = async () => {
    setSyncingGoogle(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { action: "list_events" },
      });

      if (error) throw error;

      if (data.connected) {
        setGoogleConnected(true);
        setGoogleAccount(data.account);
        setGoogleEvents(data.events?.map((e: any) => ({ ...e, source: "google" as const })) || []);
      } else {
        setGoogleConnected(false);
        setGoogleEvents([]);
      }
    } catch (error) {
      console.error("Error syncing Google Calendar:", error);
    } finally {
      setSyncingGoogle(false);
    }
  };

  const allEvents = [...localEvents, ...googleEvents];

  const getFilteredEvents = () => {
    switch (activeTab) {
      case "local":
        return localEvents;
      case "google":
        return googleEvents;
      default:
        return allEvents;
    }
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

    if (editingEvent && editingEvent.source !== "google") {
      const { error } = await supabase
        .from("calendar_events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        toast({ title: "Error updating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event updated" });
        fetchLocalEvents();
      }
    } else {
      const { error } = await supabase.from("calendar_events").insert(eventData);

      if (error) {
        toast({ title: "Error creating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event created" });
        fetchLocalEvents();
      }
    }

    resetForm();
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (event.source === "google") {
      toast({ title: "Cannot delete Google events", description: "Manage this event in Google Calendar", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("calendar_events").delete().eq("id", event.id);
    if (error) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted" });
      fetchLocalEvents();
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    if (event.source === "google") {
      if (event.htmlLink) {
        window.open(event.htmlLink, "_blank");
      }
      return;
    }

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

  const eventsOnSelectedDate = getFilteredEvents().filter(event => 
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const datesWithEvents = allEvents.map(e => new Date(e.start_time));

  if (!user) {
    return (
      <PageLayout title="Calendar" icon={CalendarIcon}>
        <PageEmptyState
          icon={CalendarIcon}
          title="Sign in required"
          description="Please sign in to manage your calendar events."
        />
      </PageLayout>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      {googleConnected && (
        <Badge variant="outline" className="text-green-600 border-green-500/30">
          Google Connected
        </Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={syncGoogleCalendar}
        disabled={syncingGoogle}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${syncingGoogle ? "animate-spin" : ""}`} />
        Sync
      </Button>
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
  );

  return (
    <PageLayout
      title="Calendar"
      icon={CalendarIcon}
      badge={`${allEvents.length} events`}
      actions={headerActions}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6">
          <div className="space-y-4">
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
            {googleConnected && googleAccount && (
              <div className="text-xs text-muted-foreground text-center">
                Synced with {googleAccount}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                  <TabsTrigger value="local" className="text-xs px-3">Local</TabsTrigger>
                  <TabsTrigger value="google" className="text-xs px-3">Google</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
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
                            style={{ backgroundColor: event.source === "google" ? "#4285f4" : event.color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{event.title}</h3>
                              {event.source === "google" && (
                                <Badge variant="outline" className="text-xs">Google</Badge>
                              )}
                            </div>
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
                            {event.source === "google" ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Edit2 className="h-4 w-4" />
                            )}
                          </Button>
                          {event.source !== "google" && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(event)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
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
    </PageLayout>
  );
};

export default Calendar;
