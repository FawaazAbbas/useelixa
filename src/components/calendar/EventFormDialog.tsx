import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CalendarEvent } from "./CalendarGrid";

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  color: string;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  selectedDate: Date;
  onSubmit: (data: EventFormData, eventId?: string) => void;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const EventFormDialog = ({
  open,
  onOpenChange,
  event,
  selectedDate,
  onSubmit,
}: EventFormDialogProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    start_date: format(selectedDate, "yyyy-MM-dd"),
    start_time: "09:00",
    end_date: format(selectedDate, "yyyy-MM-dd"),
    end_time: "10:00",
    all_day: false,
    color: "#3b82f6",
  });

  useEffect(() => {
    if (event) {
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
    } else {
      setFormData({
        title: "",
        description: "",
        start_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: "09:00",
        end_date: format(selectedDate, "yyyy-MM-dd"),
        end_time: "10:00",
        all_day: false,
        color: "#3b82f6",
      });
    }
  }, [event, selectedDate, open]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onSubmit(formData, event?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
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
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormData({ ...formData, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
              {event ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
