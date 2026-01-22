import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import {
  CalendarGrid,
  EventDetailSheet,
  EventFormDialog,
  type CalendarEvent,
  type ViewMode,
} from "@/components/calendar";

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (user) {
      fetchLocalEvents();
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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailSheetOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setDetailSheetOpen(false);
    setEditingEvent(event);
    setFormDialogOpen(true);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", event.id);
    if (error) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted" });
      setDetailSheetOpen(false);
      fetchLocalEvents();
    }
  };

  const handleFormSubmit = async (
    formData: {
      title: string;
      description: string;
      start_date: string;
      start_time: string;
      end_date: string;
      end_time: string;
      all_day: boolean;
      color: string;
    },
    eventId?: string
  ) => {
    if (!user) return;

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

    if (eventId) {
      const { error } = await supabase
        .from("calendar_events")
        .update(eventData)
        .eq("id", eventId);

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

    setEditingEvent(null);
  };

  const openNewEventDialog = () => {
    setEditingEvent(null);
    setFormDialogOpen(true);
  };

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
      <Button onClick={openNewEventDialog}>
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Add Event</span>
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Calendar"
      icon={CalendarIcon}
      badge={`${localEvents.length} events`}
      actions={headerActions}
      fullWidth
      noPadding
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex-1 p-4 h-[calc(100vh-120px)]">
          <CalendarGrid
            events={localEvents}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onEventClick={handleEventClick}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      )}

      {/* Event Detail Sheet */}
      <EventDetailSheet
        event={selectedEvent}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Event Form Dialog */}
      <EventFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        event={editingEvent}
        selectedDate={selectedDate}
        onSubmit={handleFormSubmit}
      />
    </PageLayout>
  );
};

export default Calendar;