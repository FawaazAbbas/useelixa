import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  Sparkles,
  AlertCircle,
  Clock,
  User,
  DollarSign,
  ShoppingBag
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface DigestContent {
  date: string;
  summary: string;
  sections: {
    emails?: {
      unread_count: number;
      important: Array<{ subject: string; from: string; snippet: string }>;
      actionable: Array<{ subject: string; from: string; action_needed: string }>;
    };
    tasks?: {
      due_today: Array<{ id: string; title: string; priority: string }>;
      overdue: Array<{ id: string; title: string; days_overdue: number }>;
      completed_yesterday: Array<{ id: string; title: string }>;
    };
    calendar?: {
      today_events: Array<{ title: string; time: string; location?: string }>;
      upcoming: Array<{ title: string; date: string }>;
    };
    metrics?: {
      stripe_revenue?: string;
      shopify_orders?: number;
      new_customers?: number;
    };
    ai_suggestions?: string[];
  };
}

interface DailyDigest {
  id: string;
  user_id: string;
  digest_date: string;
  content: DigestContent;
  summary: string | null;
  generated_at: string;
}

interface DigestCardProps {
  digest: DailyDigest;
}

export function DigestCard({ digest }: DigestCardProps) {
  const { content } = digest;
  const sections = content?.sections || {};

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {format(parseISO(digest.digest_date), "EEEE, MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              Generated at {format(parseISO(digest.generated_at), "h:mm a")}
            </CardDescription>
          </div>
        </div>
        {digest.summary && (
          <p className="text-sm text-muted-foreground mt-2">{digest.summary}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Suggestions */}
        {sections.ai_suggestions && sections.ai_suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestions
            </div>
            <div className="space-y-2">
              {sections.ai_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.ai_suggestions && sections.ai_suggestions.length > 0 && <Separator />}

        {/* Tasks Section */}
        {sections.tasks && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </div>

            {/* Overdue */}
            {sections.tasks.overdue && sections.tasks.overdue.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue ({sections.tasks.overdue.length})
                </p>
                {sections.tasks.overdue.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded bg-destructive/10"
                  >
                    <span className="text-sm">{task.title}</span>
                    <Badge variant="destructive" className="text-xs">
                      {task.days_overdue}d overdue
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Due Today */}
            {sections.tasks.due_today && sections.tasks.due_today.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due Today ({sections.tasks.due_today.length})
                </p>
                {sections.tasks.due_today.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded bg-muted"
                  >
                    <span className="text-sm">{task.title}</span>
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Yesterday */}
            {sections.tasks.completed_yesterday && sections.tasks.completed_yesterday.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  ✓ Completed Yesterday ({sections.tasks.completed_yesterday.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {sections.tasks.completed_yesterday.map((task) => (
                    <Badge key={task.id} variant="outline" className="text-xs">
                      {task.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sections.tasks && <Separator />}

        {/* Calendar Section */}
        {sections.calendar && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Calendar
            </div>

            {sections.calendar.today_events && sections.calendar.today_events.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Today's Events</p>
                {sections.calendar.today_events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-muted"
                  >
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{event.time}</Badge>
                  </div>
                ))}
              </div>
            )}

            {sections.calendar.upcoming && sections.calendar.upcoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Coming Up</p>
                <div className="flex flex-wrap gap-2">
                  {sections.calendar.upcoming.map((event, index) => (
                    <Badge key={index} variant="outline">
                      {event.title} • {event.date}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sections.calendar && <Separator />}

        {/* Emails Section */}
        {sections.emails && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Emails
              </div>
              <Badge variant="secondary">{sections.emails.unread_count} unread</Badge>
            </div>

            {sections.emails.actionable && sections.emails.actionable.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Needs Action
                </p>
                {sections.emails.actionable.map((email, index) => (
                  <div key={index} className="p-2 rounded bg-muted space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{email.subject}</p>
                      <span className="text-xs text-muted-foreground">{email.from}</span>
                    </div>
                    <p className="text-xs text-primary">{email.action_needed}</p>
                  </div>
                ))}
              </div>
            )}

            {sections.emails.important && sections.emails.important.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Important</p>
                {sections.emails.important.slice(0, 3).map((email, index) => (
                  <div key={index} className="p-2 rounded bg-muted space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{email.subject}</p>
                      <span className="text-xs text-muted-foreground">{email.from}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {email.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sections.emails && sections.metrics && <Separator />}

        {/* Metrics Section */}
        {sections.metrics && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Business Metrics
            </div>
            <div className="grid grid-cols-3 gap-4">
              {sections.metrics.stripe_revenue && (
                <div className="p-3 rounded-lg bg-muted text-center">
                  <DollarSign className="h-5 w-5 mx-auto text-green-500 mb-1" />
                  <p className="text-lg font-bold">{sections.metrics.stripe_revenue}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              )}
              {sections.metrics.shopify_orders !== undefined && (
                <div className="p-3 rounded-lg bg-muted text-center">
                  <ShoppingBag className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold">{sections.metrics.shopify_orders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              )}
              {sections.metrics.new_customers !== undefined && (
                <div className="p-3 rounded-lg bg-muted text-center">
                  <User className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-lg font-bold">{sections.metrics.new_customers}</p>
                  <p className="text-xs text-muted-foreground">New Customers</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
