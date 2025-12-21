import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Download, Search, Users, Code, RefreshCw, LogOut, Upload, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [waitlistSignups, setWaitlistSignups] = useState<WaitlistSignup[]>([]);
  const [developerApplications, setDeveloperApplications] = useState<DeveloperApplication[]>([]);
  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [developerSearch, setDeveloperSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState("waitlist");

  // Edit state
  const [editingWaitlist, setEditingWaitlist] = useState<WaitlistSignup | null>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperApplication | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Delete state
  const [deletingWaitlist, setDeletingWaitlist] = useState<WaitlistSignup | null>(null);
  const [deletingDeveloper, setDeletingDeveloper] = useState<DeveloperApplication | null>(null);

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
      toast.error("Failed to fetch data");
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

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("CSV file is empty or has no data rows");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
        const dataRows = lines.slice(1);

        const records = dataRows.map(line => {
          const values = parseCSVLine(line);
          const record: any = {};
          
          headers.forEach((header, index) => {
            let value = values[index]?.trim().replace(/^"|"$/g, "") || null;
            
            if (header === "skills" && value) {
              record[header] = value.split(";").map(s => s.trim()).filter(Boolean);
            } else {
              record[header] = value || null;
            }
          });
          
          return record;
        }).filter(r => r.name && r.email);

        if (records.length === 0) {
          toast.error("No valid records found. CSV must have 'name' and 'email' columns.");
          return;
        }

        if (activeTab === "waitlist") {
          const { error } = await supabase
            .from("waitlist_signups")
            .insert(records.map(r => ({
              name: r.name,
              email: r.email,
              company: r.company || null,
              use_case: r.use_case || null,
            })));

          if (error) throw error;
          toast.success(`Imported ${records.length} waitlist signups`);
        } else {
          const { error } = await supabase
            .from("developer_applications")
            .insert(records.map(r => ({
              name: r.name,
              email: r.email,
              skills: r.skills || null,
              message: r.message || null,
            })));

          if (error) throw error;
          toast.success(`Imported ${records.length} developer applications`);
        }

        fetchData();
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(error.message || "Failed to import CSV");
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // Edit handlers
  const handleEditWaitlist = (signup: WaitlistSignup) => {
    setEditingWaitlist(signup);
    setEditForm({
      name: signup.name,
      email: signup.email,
      company: signup.company || "",
      use_case: signup.use_case || "",
    });
  };

  const handleEditDeveloper = (app: DeveloperApplication) => {
    setEditingDeveloper(app);
    setEditForm({
      name: app.name,
      email: app.email,
      skills: app.skills?.join(", ") || "",
      message: app.message || "",
    });
  };

  const handleSaveWaitlist = async () => {
    if (!editingWaitlist) return;

    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .update({
          name: editForm.name,
          email: editForm.email,
          company: editForm.company || null,
          use_case: editForm.use_case || null,
        })
        .eq("id", editingWaitlist.id);

      if (error) throw error;
      toast.success("Waitlist signup updated");
      setEditingWaitlist(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleSaveDeveloper = async () => {
    if (!editingDeveloper) return;

    try {
      const { error } = await supabase
        .from("developer_applications")
        .update({
          name: editForm.name,
          email: editForm.email,
          skills: editForm.skills ? editForm.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
          message: editForm.message || null,
        })
        .eq("id", editingDeveloper.id);

      if (error) throw error;
      toast.success("Developer application updated");
      setEditingDeveloper(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  // Delete handlers
  const handleDeleteWaitlist = async () => {
    if (!deletingWaitlist) return;

    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .delete()
        .eq("id", deletingWaitlist.id);

      if (error) throw error;
      toast.success("Waitlist signup deleted");
      setDeletingWaitlist(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleDeleteDeveloper = async () => {
    if (!deletingDeveloper) return;

    try {
      const { error } = await supabase
        .from("developer_applications")
        .delete()
        .eq("id", deletingDeveloper.id);

      if (error) throw error;
      toast.success("Developer application deleted");
      setDeletingDeveloper(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
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
        <Tabs defaultValue="waitlist" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleCSVImport}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex-1 sm:flex-none"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {importing ? "Importing..." : "Import CSV"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV(filteredWaitlist, "waitlist")}
                        className="flex-1 sm:flex-none"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
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
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaitlist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditWaitlist(signup)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeletingWaitlist(signup)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleCSVImport}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex-1 sm:flex-none"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {importing ? "Importing..." : "Import CSV"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV(filteredDevelopers, "developers")}
                        className="flex-1 sm:flex-none"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
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
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevelopers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditDeveloper(app)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeletingDeveloper(app)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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

      {/* Edit Waitlist Dialog */}
      <Dialog open={!!editingWaitlist} onOpenChange={() => setEditingWaitlist(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Waitlist Signup</DialogTitle>
            <DialogDescription>
              Update the details for this waitlist entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={editForm.company || ""}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="use_case">Use Case</Label>
              <Textarea
                id="use_case"
                value={editForm.use_case || ""}
                onChange={(e) => setEditForm({ ...editForm, use_case: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWaitlist(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWaitlist}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Developer Dialog */}
      <Dialog open={!!editingDeveloper} onOpenChange={() => setEditingDeveloper(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Developer Application</DialogTitle>
            <DialogDescription>
              Update the details for this developer application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dev-name">Name</Label>
              <Input
                id="dev-name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dev-email">Email</Label>
              <Input
                id="dev-email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={editForm.skills || ""}
                onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editForm.message || ""}
                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDeveloper(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDeveloper}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Waitlist Confirmation */}
      <AlertDialog open={!!deletingWaitlist} onOpenChange={() => setDeletingWaitlist(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Waitlist Signup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingWaitlist?.name} ({deletingWaitlist?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWaitlist} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Developer Confirmation */}
      <AlertDialog open={!!deletingDeveloper} onOpenChange={() => setDeletingDeveloper(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Developer Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingDeveloper?.name} ({deletingDeveloper?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeveloper} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;