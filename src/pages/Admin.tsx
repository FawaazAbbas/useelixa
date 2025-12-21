import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Users, Code, RefreshCw, LogOut } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [waitlistSignups, setWaitlistSignups] = useState<WaitlistSignup[]>([]);
  const [developerApplications, setDeveloperApplications] = useState<DeveloperApplication[]>([]);
  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [developerSearch, setDeveloperSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [waitlistRes, developerRes] = await Promise.all([
        supabase
          .from("waitlist_signups")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("developer_applications")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (waitlistRes.data) setWaitlistSignups(waitlistRes.data);
      if (developerRes.data) setDeveloperApplications(developerRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredWaitlist = waitlistSignups.filter(
    (signup) =>
      signup.name.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
      signup.email.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
      (signup.company?.toLowerCase().includes(waitlistSearch.toLowerCase()) ?? false)
  );

  const filteredDevelopers = developerApplications.filter(
    (app) =>
      app.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(developerSearch.toLowerCase()) ||
      (app.skills?.some((skill) =>
        skill.toLowerCase().includes(developerSearch.toLowerCase())
      ) ?? false)
  );

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (Array.isArray(value)) {
              return `"${value.join("; ")}"`;
            }
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? "";
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (adminLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage waitlist signups and developer applications
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex-1 sm:flex-none">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Waitlist Signups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold">{waitlistSignups.length}</div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                Total people on the waitlist
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Developer Apps
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold">{developerApplications.length}</div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                Total developer applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="waitlist" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="waitlist" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Waitlist ({waitlistSignups.length})
            </TabsTrigger>
            <TabsTrigger value="developers" className="flex-1 sm:flex-none text-xs sm:text-sm">
              Developers ({developerApplications.length})
            </TabsTrigger>
          </TabsList>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg">Waitlist Signups</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={waitlistSearch}
                        onChange={(e) => setWaitlistSearch(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(filteredWaitlist, "waitlist")}
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap hidden md:table-cell">Company</TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Use Case</TableHead>
                        <TableHead className="whitespace-nowrap">Signed Up</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaitlist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No waitlist signups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWaitlist.map((signup) => (
                          <TableRow key={signup.id}>
                            <TableCell className="font-medium whitespace-nowrap">{signup.name}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">{signup.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{signup.company || "-"}</TableCell>
                            <TableCell className="max-w-xs truncate hidden lg:table-cell">
                              {signup.use_case || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                              {format(new Date(signup.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developers Tab */}
          <TabsContent value="developers" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg">Developer Applications</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={developerSearch}
                        onChange={(e) => setDeveloperSearch(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(filteredDevelopers, "developers")}
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap hidden md:table-cell">Skills</TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Message</TableHead>
                        <TableHead className="whitespace-nowrap">Applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevelopers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No developer applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDevelopers.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium whitespace-nowrap">{app.name}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">{app.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {app.skills?.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {(app.skills?.length ?? 0) > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(app.skills?.length ?? 0) - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate hidden lg:table-cell">
                              {app.message || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                              {format(new Date(app.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
