import { useState, useEffect } from "react";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Newspaper, 
  Mail, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  Sparkles,
  Settings,
  Loader2,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DigestSettings } from "@/components/settings/DigestSettings";
import { format, parseISO, isToday, isYesterday, subDays, startOfDay } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ElixaMascot } from "@/components/ElixaMascot";

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
      in_progress: Array<{ id: string; title: string; progress?: number }>;
    };
    calendar?: {
      today_events: Array<{ title: string; time: string; location?: string; duration?: string }>;
      upcoming: Array<{ title: string; date: string; time?: string }>;
    };
    metrics?: {
      stripe_revenue?: string;
      stripe_change?: number;
      shopify_orders?: number;
      shopify_change?: number;
      new_customers?: number;
      customer_change?: number;
    };
    ai_suggestions?: string[];
    productivity?: {
      tasks_completed_week: number;
      average_completion_time?: string;
      most_productive_day?: string;
      streak_days?: number;
    };
  };
}

interface DailyDigest {
  id: string;
  user_id: string;
  digest_date: string;
  content: DigestContent;
  summary: string | null;
  generated_at: string;
  delivered_at: string | null;
}

interface DigestConfig {
  is_enabled: boolean;
  delivery_time: string;
  timezone: string;
  include_emails: boolean;
  include_tasks: boolean;
  include_calendar: boolean;
  include_metrics: boolean;
  include_ai_suggestions: boolean;
}

// Section component for collapsible digest sections
function DigestSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge,
  isEmpty = false
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  isEmpty?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isEmpty) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs capitalize", colorMap[priority.toLowerCase()] || colorMap.low)}
    >
      {priority}
    </Badge>
  );
}

// Metric card component
function MetricCard({ 
  icon: Icon, 
  value, 
  label, 
  change, 
  iconColor 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string; 
  change?: number;
  iconColor: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 border">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", iconColor)} />
        {change !== undefined && (
          <span className={cn(
            "text-xs font-medium",
            change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          )}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Full digest view component
function FullDigestView({ digest, onTaskClick }: { digest: DailyDigest; onTaskClick?: (taskId: string) => void }) {
  const { content } = digest;
  const sections = content?.sections || {};

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="pb-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(parseISO(digest.digest_date), "EEEE, MMMM d, yyyy")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generated at {format(parseISO(digest.generated_at), "h:mm a")}
        </p>
        {digest.summary && (
          <p className="text-sm mt-3 text-foreground/80 leading-relaxed">
            {digest.summary}
          </p>
        )}
      </div>

      {/* AI Suggestions - Always at top */}
      {sections.ai_suggestions && sections.ai_suggestions.length > 0 && (
        <div className="py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">AI Insights</span>
          </div>
          <div className="space-y-2">
            {sections.ai_suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      <DigestSection 
        title="Tasks" 
        icon={CheckSquare}
        isEmpty={!sections.tasks || (
          !sections.tasks.overdue?.length && 
          !sections.tasks.due_today?.length && 
          !sections.tasks.in_progress?.length &&
          !sections.tasks.completed_yesterday?.length
        )}
        badge={
          sections.tasks?.overdue?.length ? (
            <Badge variant="destructive" className="text-xs ml-2">
              {sections.tasks.overdue.length} overdue
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Overdue Tasks */}
          {sections.tasks?.overdue && sections.tasks.overdue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Overdue</span>
              </div>
              {sections.tasks.overdue.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors text-left"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge variant="destructive" className="text-xs">
                    {task.days_overdue}d overdue
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Due Today */}
          {sections.tasks?.due_today && sections.tasks.due_today.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Due Today</span>
              </div>
              {sections.tasks.due_today.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                >
                  <span className="text-sm">{task.title}</span>
                  <PriorityBadge priority={task.priority} />
                </button>
              ))}
            </div>
          )}

          {/* In Progress */}
          {sections.tasks?.in_progress && sections.tasks.in_progress.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">In Progress</span>
              </div>
              {sections.tasks.in_progress.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                >
                  <span className="text-sm">{task.title}</span>
                  {task.progress !== undefined && (
                    <span className="text-xs text-muted-foreground">{task.progress}%</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Completed Yesterday */}
          {sections.tasks?.completed_yesterday && sections.tasks.completed_yesterday.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckSquare className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Completed Yesterday ({sections.tasks.completed_yesterday.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sections.tasks.completed_yesterday.map((task) => (
                  <Badge key={task.id} variant="outline" className="text-xs bg-emerald-500/5">
                    {task.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DigestSection>

      <Separator />

      {/* Calendar Section */}
      <DigestSection 
        title="Calendar" 
        icon={Calendar}
        isEmpty={!sections.calendar || (
          !sections.calendar.today_events?.length && 
          !sections.calendar.upcoming?.length
        )}
        badge={
          sections.calendar?.today_events?.length ? (
            <Badge variant="secondary" className="text-xs ml-2">
              {sections.calendar.today_events.length} today
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Today's Events */}
          {sections.calendar?.today_events && sections.calendar.today_events.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Today's Schedule</span>
              {sections.calendar.today_events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">{event.time}</Badge>
                    {event.duration && (
                      <p className="text-xs text-muted-foreground mt-1">{event.duration}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Events */}
          {sections.calendar?.upcoming && sections.calendar.upcoming.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Coming Up</span>
              <div className="grid gap-2">
                {sections.calendar.upcoming.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-background"
                  >
                    <span className="text-sm">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.date}{event.time ? ` at ${event.time}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DigestSection>

      <Separator />

      {/* Emails Section */}
      <DigestSection 
        title="Emails" 
        icon={Mail}
        isEmpty={!sections.emails || (
          !sections.emails.actionable?.length && 
          !sections.emails.important?.length
        )}
        badge={
          sections.emails?.unread_count ? (
            <Badge variant="secondary" className="text-xs ml-2">
              {sections.emails.unread_count} unread
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Actionable Emails */}
          {sections.emails?.actionable && sections.emails.actionable.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Needs Action</span>
              </div>
              {sections.emails.actionable.map((email, index) => (
                <div key={index} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{email.subject}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{email.from}</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{email.action_needed}</p>
                </div>
              ))}
            </div>
          )}

          {/* Important Emails */}
          {sections.emails?.important && sections.emails.important.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Important</span>
              {sections.emails.important.slice(0, 5).map((email, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{email.subject}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{email.from}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{email.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DigestSection>

      <Separator />

      {/* Metrics Section */}
      <DigestSection 
        title="Business Metrics" 
        icon={TrendingUp}
        isEmpty={!sections.metrics || (
          !sections.metrics.stripe_revenue && 
          sections.metrics.shopify_orders === undefined && 
          sections.metrics.new_customers === undefined
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sections.metrics?.stripe_revenue && (
            <MetricCard
              icon={DollarSign}
              value={sections.metrics.stripe_revenue}
              label="Revenue"
              change={sections.metrics.stripe_change}
              iconColor="text-emerald-500"
            />
          )}
          {sections.metrics?.shopify_orders !== undefined && (
            <MetricCard
              icon={ShoppingBag}
              value={sections.metrics.shopify_orders}
              label="Orders"
              change={sections.metrics.shopify_change}
              iconColor="text-blue-500"
            />
          )}
          {sections.metrics?.new_customers !== undefined && (
            <MetricCard
              icon={User}
              value={sections.metrics.new_customers}
              label="New Customers"
              change={sections.metrics.customer_change}
              iconColor="text-purple-500"
            />
          )}
        </div>
      </DigestSection>

      {/* Productivity Stats */}
      {sections.productivity && (
        <>
          <Separator />
          <DigestSection title="Productivity" icon={TrendingUp}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sections.productivity.tasks_completed_week !== undefined && (
                <div className="p-3 rounded-lg bg-muted/50 border text-center">
                  <p className="text-2xl font-bold">{sections.productivity.tasks_completed_week}</p>
                  <p className="text-xs text-muted-foreground">Tasks This Week</p>
                </div>
              )}
              {sections.productivity.streak_days !== undefined && (
                <div className="p-3 rounded-lg bg-muted/50 border text-center">
                  <p className="text-2xl font-bold">{sections.productivity.streak_days}🔥</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              )}
              {sections.productivity.average_completion_time && (
                <div className="p-3 rounded-lg bg-muted/50 border text-center">
                  <p className="text-2xl font-bold">{sections.productivity.average_completion_time}</p>
                  <p className="text-xs text-muted-foreground">Avg Completion</p>
                </div>
              )}
              {sections.productivity.most_productive_day && (
                <div className="p-3 rounded-lg bg-muted/50 border text-center">
                  <p className="text-2xl font-bold">{sections.productivity.most_productive_day}</p>
                  <p className="text-xs text-muted-foreground">Best Day</p>
                </div>
              )}
            </div>
          </DigestSection>
        </>
      )}
    </div>
  );
}

export default function Digest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);
  const [config, setConfig] = useState<DigestConfig | null>(null);

  useEffect(() => {
    if (user) {
      fetchDigests();
      fetchConfig();
    }
  }, [user]);

  const fetchDigests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_digests")
        .select("*")
        .order("digest_date", { ascending: false })
        .limit(30);

      if (error) throw error;

      const typedDigests = (data || []).map(d => ({
        ...d,
        content: d.content as unknown as DigestContent
      }));

      setDigests(typedDigests);
      
      // Auto-select today's digest if available
      const todayDigest = typedDigests.find((d) =>
        isToday(parseISO(d.digest_date))
      );
      if (todayDigest) {
        setSelectedDigest(todayDigest);
      } else if (typedDigests.length > 0) {
        setSelectedDigest(typedDigests[0]);
      }
    } catch (error) {
      console.error("Error fetching digests:", error);
      toast.error("Failed to load digests");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("digest_configs")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setConfig(data);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const generateDigest = async () => {
    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke("generate-daily-digest", {
        body: { forceGenerate: true },
      });

      if (error) throw error;

      toast.success("Digest generated successfully");
      fetchDigests();
    } catch (error) {
      console.error("Error generating digest:", error);
      toast.error("Failed to generate digest");
    } finally {
      setGenerating(false);
    }
  };

  const formatDigestDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEE, MMM d");
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks?highlight=${taskId}`);
  };

  if (!user) {
    return (
      <PageLayout title="Daily Digest" icon={Newspaper}>
        <PageEmptyState
          icon={Newspaper}
          title="Sign in to view your digest"
          description="Get daily AI-powered summaries of your emails, tasks, and metrics."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Daily Digest" 
      icon={Newspaper}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" onClick={generateDigest} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Generate Now
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : digests.length === 0 ? (
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <ElixaMascot pose="thinking" size="lg" animation="pulse" className="mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No digests yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Generate your first digest to see a personalized summary of your tasks, emails, calendar, and business metrics.
                </p>
              </div>
              <Button onClick={generateDigest} disabled={generating} className="mt-4">
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate First Digest
              </Button>
              {config?.is_enabled && (
                <p className="text-xs text-muted-foreground mt-2">
                  Auto-delivery scheduled at {config.delivery_time} ({config.timezone})
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          {/* Digest List - Scrollable */}
          <Card className="h-fit max-h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium">Recent Digests</CardTitle>
              {config?.is_enabled && (
                <CardDescription className="text-xs">
                  Daily at {config.delivery_time}
                </CardDescription>
              )}
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {digests.map((digest) => (
                    <button
                      key={digest.id}
                      onClick={() => setSelectedDigest(digest)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                        selectedDigest?.id === digest.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {formatDigestDate(digest.digest_date)}
                          </p>
                          {isToday(parseISO(digest.digest_date)) && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {digest.summary || "Daily summary"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Selected Digest - Full View */}
          <Card className="h-fit">
            <CardContent className="p-6">
              {selectedDigest ? (
                <FullDigestView digest={selectedDigest} onTaskClick={handleTaskClick} />
              ) : (
                <div className="text-center py-12">
                  <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a digest to view</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Digest Settings</SheetTitle>
          </SheetHeader>
          <DigestSettings onClose={() => {
            setShowSettings(false);
            fetchConfig();
          }} />
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
