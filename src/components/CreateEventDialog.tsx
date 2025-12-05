import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockTeams, Team, TeamMember } from "@/data/mockTeams";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

// Get all team members for attendee selection
const getAllAttendeeOptions = (): { id: string; name: string; team: string; isManager: boolean }[] => {
  const attendees: { id: string; name: string; team: string; isManager: boolean }[] = [];
  
  // Add Liam (the user)
  attendees.push({ id: "liam", name: "Liam Baduss", team: "Executive", isManager: true });
  
  // Add Brian
  attendees.push({ id: "brian", name: "Brian (AI COO)", team: "Executive", isManager: true });
  
  // Add all team members
  mockTeams.forEach((team: Team) => {
    attendees.push({ id: team.manager.id, name: team.manager.name, team: team.name, isManager: true });
    team.members.forEach((member: TeamMember) => {
      attendees.push({ id: member.id, name: member.name, team: team.name, isManager: false });
    });
  });
  
  return attendees;
};

const CreateEventDialog = ({ open, onOpenChange, initialDate }: CreateEventDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [startTime, setStartTime] = useState(() => {
    if (initialDate) {
      return format(initialDate, "HH:mm");
    }
    return "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (initialDate) {
      const endDate = new Date(initialDate);
      endDate.setHours(endDate.getHours() + 1);
      return format(endDate, "HH:mm");
    }
    return "10:00";
  });
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  
  const attendeeOptions = getAllAttendeeOptions();

  // Update date when initialDate changes or dialog opens
  useEffect(() => {
    if (open && initialDate) {
      setDate(initialDate);
      setStartTime(format(initialDate, "HH:mm"));
      const endDate = new Date(initialDate);
      endDate.setHours(endDate.getHours() + 1);
      setEndTime(format(endDate, "HH:mm"));
    }
  }, [open, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Event creation is disabled in demo mode");
    onOpenChange(false);
  };

  const addAttendee = (attendeeId: string) => {
    if (!selectedAttendees.includes(attendeeId)) {
      setSelectedAttendees([...selectedAttendees, attendeeId]);
    }
  };

  const removeAttendee = (attendeeId: string) => {
    setSelectedAttendees(selectedAttendees.filter(id => id !== attendeeId));
  };

  const getAttendeeName = (id: string) => {
    return attendeeOptions.find(a => a.id === id)?.name || id;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="all-day">All Day Event</Label>
            <Switch
              id="all-day"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
            />
          </div>

          {/* Time Range */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <Select onValueChange={addAttendee}>
              <SelectTrigger>
                <SelectValue placeholder="Add attendees" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {attendeeOptions
                  .filter(a => !selectedAttendees.includes(a.id))
                  .map(attendee => (
                    <SelectItem key={attendee.id} value={attendee.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        <span>{attendee.name}</span>
                        <span className="text-xs text-muted-foreground">({attendee.team})</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedAttendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAttendees.map(id => (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {getAttendeeName(id)}
                    <button
                      type="button"
                      onClick={() => removeAttendee(id)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Create Event
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
