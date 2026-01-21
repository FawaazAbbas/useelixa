import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Calendar = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Calendar</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">No Events Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Your calendar events will appear here once you start scheduling.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Calendar;
