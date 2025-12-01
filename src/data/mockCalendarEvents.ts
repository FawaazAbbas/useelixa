export interface MockCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
}

const today = new Date();
const getDateAtTime = (daysOffset: number, hour: number, minute: number = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const mockCalendarEvents: MockCalendarEvent[] = [
  {
    id: "event-1",
    title: "Team Standup",
    description: "Daily team sync meeting",
    start_time: getDateAtTime(0, 9, 0),
    end_time: getDateAtTime(0, 9, 30),
    location: "Zoom",
  },
  {
    id: "event-2",
    title: "Client Presentation",
    description: "Q4 results review with Acme Corp",
    start_time: getDateAtTime(1, 14, 0),
    end_time: getDateAtTime(1, 15, 30),
    location: "Conference Room A",
  },
  {
    id: "event-3",
    title: "Product Review",
    description: "Review new feature designs with product team",
    start_time: getDateAtTime(2, 10, 0),
    end_time: getDateAtTime(2, 11, 0),
    location: "Office - Design Studio",
  },
  {
    id: "event-4",
    title: "One-on-One with Sarah",
    description: "Quarterly performance review",
    start_time: getDateAtTime(3, 15, 0),
    end_time: getDateAtTime(3, 16, 0),
    location: "Meeting Room 3",
  },
  {
    id: "event-5",
    title: "Engineering All-Hands",
    description: "Monthly engineering team meeting",
    start_time: getDateAtTime(4, 16, 0),
    end_time: getDateAtTime(4, 17, 0),
    location: "Main Auditorium",
  },
  {
    id: "event-6",
    title: "Lunch with Investors",
    description: "Casual meeting with potential Series A investors",
    start_time: getDateAtTime(5, 12, 0),
    end_time: getDateAtTime(5, 13, 30),
    location: "The Blue Restaurant",
  },
];
