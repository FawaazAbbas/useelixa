import { format } from "date-fns";
import { Clock, MapPin, Video, Users, Calendar as CalendarIcon, Repeat, X } from "lucide-react";
import { MockCalendarEvent } from "@/data/mockCalendarEvents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface EventDetailSheetProps {
  event: MockCalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const EventDetailSheet = ({ event, open, onOpenChange }: EventDetailSheetProps) => {
  if (!event) return null;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  const handleEdit = () => {
    toast.info("Event editing is disabled in demo mode");
  };

  const handleDelete = () => {
    toast.info("Event deletion is disabled in demo mode");
  };

  const handleDuplicate = () => {
    toast.info("Event duplication is disabled in demo mode");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: event.color, color: "white" }}
                >
                  {getEventTypeLabel(event.type)}
                </Badge>
                {event.is_all_day && (
                  <Badge variant="outline" className="text-xs">
                    All Day
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold">{event.title}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Time & Date */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">
                  {event.is_all_day ? (
                    "All Day"
                  ) : (
                    <>
                      {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                      <span className="text-muted-foreground text-sm ml-2">
                        ({duration} min)
                      </span>
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(startDate, "EEEE, MMMM d, yyyy")}
                </div>
              </div>
            </div>

            {event.recurrence && (
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">{event.recurrence}</div>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">{event.location}</div>
              </div>
            )}

            {event.video_link && (
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-muted-foreground" />
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-primary"
                  onClick={() => window.open(event.video_link, "_blank")}
                >
                  Join Video Call
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {event.description && (
            <>
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">
                    Attendees ({event.attendees.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {event.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {attendee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleEdit} className="flex-1">
              Edit Event
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventDetailSheet;
