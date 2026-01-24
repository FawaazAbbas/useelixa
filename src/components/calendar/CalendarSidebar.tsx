import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Link2, Link2Off } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CalendarSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  hasGoogleCalendar: boolean;
  eventCount: number;
}

export const CalendarSidebar = ({
  selectedDate,
  onSelectDate,
  hasGoogleCalendar,
  eventCount,
}: CalendarSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      {/* Mini Calendar */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Quick Navigation</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="rounded-md border p-0"
          classNames={{
            months: "flex flex-col space-y-2",
            month: "space-y-2",
            caption: "flex justify-center pt-1 relative items-center text-sm",
            caption_label: "text-xs font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
            row: "flex w-full mt-1",
            cell: "h-7 w-7 text-center text-xs p-0 relative",
            day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md text-xs",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
          }}
        />
      </div>

      {/* Event Summary */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">This Month</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Events</span>
          <Badge variant="secondary">{eventCount}</Badge>
        </div>
      </div>

      {/* Calendar Sources */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Calendars</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Local Events</span>
          </div>
          {hasGoogleCalendar ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#4285f4" }} />
              <span>Google Calendar</span>
              <Link2 className="h-3 w-3 text-green-500 ml-auto" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2Off className="h-3 w-3" />
              <span>Google Calendar</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs ml-auto"
                onClick={() => navigate("/connections")}
              >
                Connect
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Event Colors</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { color: "#3b82f6", label: "Default" },
            { color: "#ef4444", label: "Important" },
            { color: "#22c55e", label: "Personal" },
            { color: "#f59e0b", label: "Work" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
