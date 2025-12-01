export interface MockCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: 'meeting' | 'call' | 'task' | 'reminder' | 'personal';
  color: string;
  attendees?: { name: string; avatar?: string }[];
  is_all_day?: boolean;
  recurrence?: string;
  created_by?: string;
  video_link?: string;
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
    description: "Daily team sync meeting to discuss progress and blockers",
    start_time: getDateAtTime(0, 9, 0),
    end_time: getDateAtTime(0, 9, 30),
    location: "Zoom",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    video_link: "https://zoom.us/j/123456789",
    attendees: [
      { name: "Sarah Chen" },
      { name: "Mike Ross" },
      { name: "Alex Turner" },
    ],
    recurrence: "Daily (Mon-Fri)",
  },
  {
    id: "event-2",
    title: "Client Presentation",
    description: "Q4 results review with Acme Corp - presenting growth metrics and future roadmap",
    start_time: getDateAtTime(1, 14, 0),
    end_time: getDateAtTime(1, 15, 30),
    location: "Conference Room A",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [
      { name: "David Kim" },
      { name: "Emma Watson" },
    ],
  },
  {
    id: "event-3",
    title: "Product Review",
    description: "Review new feature designs with product team and gather feedback",
    start_time: getDateAtTime(2, 10, 0),
    end_time: getDateAtTime(2, 11, 0),
    location: "Office - Design Studio",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [
      { name: "Lisa Park" },
      { name: "Tom Brady" },
      { name: "Nina Patel" },
    ],
  },
  {
    id: "event-4",
    title: "One-on-One with Sarah",
    description: "Quarterly performance review and career development discussion",
    start_time: getDateAtTime(3, 15, 0),
    end_time: getDateAtTime(3, 16, 0),
    location: "Meeting Room 3",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [{ name: "Sarah Chen" }],
  },
  {
    id: "event-5",
    title: "Engineering All-Hands",
    description: "Monthly engineering team meeting - sprint recap and tech updates",
    start_time: getDateAtTime(4, 16, 0),
    end_time: getDateAtTime(4, 17, 0),
    location: "Main Auditorium",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [
      { name: "All Engineering" },
    ],
  },
  {
    id: "event-6",
    title: "Lunch with Investors",
    description: "Casual meeting with potential Series A investors to discuss funding",
    start_time: getDateAtTime(5, 12, 0),
    end_time: getDateAtTime(5, 13, 30),
    location: "The Blue Restaurant",
    type: "personal",
    color: "hsl(var(--chart-5))",
    attendees: [
      { name: "John Investor" },
      { name: "Jane Capital" },
    ],
  },
  {
    id: "event-7",
    title: "Design Sprint Kickoff",
    description: "Starting 3-day design sprint for mobile app redesign",
    start_time: getDateAtTime(0, 10, 0),
    end_time: getDateAtTime(0, 12, 0),
    location: "Design Lab",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [
      { name: "Design Team" },
      { name: "Product Team" },
    ],
  },
  {
    id: "event-8",
    title: "Sales Call - TechCorp",
    description: "Demo call with TechCorp team to showcase our enterprise features",
    start_time: getDateAtTime(0, 14, 0),
    end_time: getDateAtTime(0, 15, 0),
    location: "Video Call",
    type: "call",
    color: "hsl(var(--chart-2))",
    video_link: "https://meet.google.com/abc-defg-hij",
    attendees: [
      { name: "Sales Team" },
    ],
  },
  {
    id: "event-9",
    title: "Gym Session",
    description: null,
    start_time: getDateAtTime(1, 7, 0),
    end_time: getDateAtTime(1, 8, 0),
    location: "Downtown Fitness",
    type: "personal",
    color: "hsl(var(--chart-5))",
    recurrence: "Daily",
  },
  {
    id: "event-10",
    title: "Code Review Session",
    description: "Review PRs and discuss architecture decisions for payment integration",
    start_time: getDateAtTime(1, 10, 0),
    end_time: getDateAtTime(1, 11, 30),
    location: "Zoom",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    video_link: "https://zoom.us/j/987654321",
    attendees: [
      { name: "Dev Team" },
    ],
  },
  {
    id: "event-11",
    title: "Submit Q4 Report",
    description: "Final deadline for Q4 financial report submission",
    start_time: getDateAtTime(2, 0, 0),
    end_time: getDateAtTime(2, 23, 59),
    location: null,
    type: "task",
    color: "hsl(var(--chart-3))",
    is_all_day: true,
  },
  {
    id: "event-12",
    title: "Customer Support Review",
    description: "Weekly review of customer tickets and satisfaction metrics",
    start_time: getDateAtTime(2, 13, 0),
    end_time: getDateAtTime(2, 14, 0),
    location: "Support Hub",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    recurrence: "Weekly",
    attendees: [
      { name: "Support Team" },
    ],
  },
  {
    id: "event-13",
    title: "Dentist Appointment",
    description: "Regular checkup and cleaning",
    start_time: getDateAtTime(3, 11, 0),
    end_time: getDateAtTime(3, 12, 0),
    location: "Downtown Dental",
    type: "personal",
    color: "hsl(var(--chart-5))",
  },
  {
    id: "event-14",
    title: "Marketing Campaign Planning",
    description: "Plan Q1 marketing campaigns and budget allocation",
    start_time: getDateAtTime(3, 13, 0),
    end_time: getDateAtTime(3, 14, 30),
    location: "Conference Room B",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    attendees: [
      { name: "Marketing Team" },
      { name: "Growth Team" },
    ],
  },
  {
    id: "event-15",
    title: "Team Happy Hour",
    description: "Informal team gathering at local bar",
    start_time: getDateAtTime(4, 18, 0),
    end_time: getDateAtTime(4, 20, 0),
    location: "The Crafty Pub",
    type: "personal",
    color: "hsl(var(--chart-5))",
  },
  {
    id: "event-16",
    title: "Board Meeting Prep",
    description: "Prepare slides and talking points for upcoming board meeting",
    start_time: getDateAtTime(5, 9, 0),
    end_time: getDateAtTime(5, 11, 0),
    location: "Executive Office",
    type: "task",
    color: "hsl(var(--chart-3))",
  },
  {
    id: "event-17",
    title: "Webinar: Product Launch",
    description: "Public webinar announcing our new product features",
    start_time: getDateAtTime(5, 15, 0),
    end_time: getDateAtTime(5, 16, 30),
    location: "YouTube Live",
    type: "call",
    color: "hsl(var(--chart-2))",
    video_link: "https://youtube.com/live/abc123",
  },
  {
    id: "event-18",
    title: "Weekly 1:1 with Manager",
    description: "Regular check-in to discuss progress, challenges, and priorities",
    start_time: getDateAtTime(0, 16, 0),
    end_time: getDateAtTime(0, 16, 30),
    location: "Manager's Office",
    type: "meeting",
    color: "hsl(var(--chart-1))",
    recurrence: "Weekly",
    attendees: [{ name: "Manager" }],
  },
  {
    id: "event-19",
    title: "Renew Software License",
    description: "Action required: Renew Adobe Creative Cloud subscription",
    start_time: getDateAtTime(6, 0, 0),
    end_time: getDateAtTime(6, 23, 59),
    location: null,
    type: "reminder",
    color: "hsl(var(--chart-4))",
    is_all_day: true,
  },
];
