import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Code, TrendingUp, Calendar } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

interface WaitlistSignup {
  id: string;
  name: string;
  email: string;
  company: string | null;
  use_case: string | null;
  created_at: string;
}

interface DeveloperApplication {
  id: string;
  name: string;
  email: string;
  skills: string[] | null;
  message: string | null;
  created_at: string;
}

interface AdminOverviewTabProps {
  waitlistSignups: WaitlistSignup[];
  developerApplications: DeveloperApplication[];
  onNavigate: (tab: string) => void;
}

export const AdminOverviewTab = ({ 
  waitlistSignups, 
  developerApplications,
  onNavigate 
}: AdminOverviewTabProps) => {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  const recentWaitlist = waitlistSignups.filter(s => 
    isAfter(new Date(s.created_at), sevenDaysAgo)
  ).length;
  
  const recentDevelopers = developerApplications.filter(d => 
    isAfter(new Date(d.created_at), sevenDaysAgo)
  ).length;

  const latestWaitlist = waitlistSignups.slice(0, 5);
  const latestDevelopers = developerApplications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("waitlist")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Waitlist
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waitlistSignups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{recentWaitlist} this week
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("developers")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Developer Apps
            </CardTitle>
            <Code className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{developerApplications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{recentDevelopers} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              +{recentWaitlist + recentDevelopers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New signups this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Activity
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {waitlistSignups.length > 0 
                ? format(new Date(waitlistSignups[0].created_at), "MMM d")
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most recent signup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Waitlist */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Waitlist Signups</CardTitle>
            <button 
              onClick={() => onNavigate("waitlist")}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            {latestWaitlist.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No signups yet
              </p>
            ) : (
              <div className="space-y-3">
                {latestWaitlist.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{signup.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{signup.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {format(new Date(signup.created_at), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Developers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Developer Apps</CardTitle>
            <button 
              onClick={() => onNavigate("developers")}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            {latestDevelopers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet
              </p>
            ) : (
              <div className="space-y-3">
                {latestDevelopers.map((dev) => (
                  <div key={dev.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{dev.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dev.skills?.slice(0, 3).join(", ") || dev.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {format(new Date(dev.created_at), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
