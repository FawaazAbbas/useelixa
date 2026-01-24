import { useState, useEffect } from "react";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DigestSettings } from "@/components/settings/DigestSettings";
import { DigestCard } from "@/components/digest/DigestCard";
import { EmptyState } from "@/components/EmptyState";
import { format, parseISO, isToday, isYesterday, subDays } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  delivered_at: string | null;
}

export default function Digest() {
  const { user } = useAuth();
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);

  useEffect(() => {
    if (user) {
      fetchDigests();
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

      // Type assertion for content field
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
    return format(date, "EEEE, MMM d");
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
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={generateDigest} disabled={generating}>
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
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : digests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <PageEmptyState
                icon={Newspaper}
                title="No digests yet"
                description="Generate your first digest to see a summary of your day"
                action={
                  <Button onClick={generateDigest} disabled={generating}>
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate First Digest
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            {/* Digest List */}
            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Digests</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {digests.map((digest) => (
                    <button
                      key={digest.id}
                      onClick={() => setSelectedDigest(digest)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedDigest?.id === digest.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {formatDigestDate(digest.digest_date)}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {digest.summary || "Daily summary"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Digest */}
            {selectedDigest ? (
              <DigestCard digest={selectedDigest} />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <PageEmptyState
                    icon={Newspaper}
                    title="Select a digest"
                    description="Choose a digest from the list to view its details"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Digest Settings</SheetTitle>
          </SheetHeader>
          <DigestSettings onClose={() => setShowSettings(false)} />
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
