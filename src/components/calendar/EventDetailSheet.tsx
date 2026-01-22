import { Edit2, Trash2, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CalendarEvent } from "./CalendarGrid";

interface EventDetailSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export const EventDetailSheet = ({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EventDetailSheetProps) => {
  if (!event) return null;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <div className="flex-1">
              <SheetTitle className="text-left">{event.title}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              {event.all_day ? (
                <p className="text-sm">All day</p>
              ) : (
                <>
                  <p className="text-sm">
                    {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm">{format(startDate, "EEEE, MMMM d, yyyy")}</p>
              {format(startDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd") && (
                <p className="text-sm text-muted-foreground">
                  to {format(endDate, "EEEE, MMMM d, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{event.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(event)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(event)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};