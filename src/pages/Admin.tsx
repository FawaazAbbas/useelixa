import { useState, useEffect, useRef, useMemo } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Download, Search, Users, Code, RefreshCw, LogOut, Upload, Pencil, Trash2, FileDown, Plus, ArrowUpDown, ArrowUp, ArrowDown, CalendarIcon, Mail } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminOutreachTab } from "@/components/admin/AdminOutreachTab";

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

type SortDirection = "asc" | "desc" | null;
type WaitlistSortKey = "name" | "email" | "company" | "created_at";
type DeveloperSortKey = "name" | "email" | "created_at";

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

  // Sorting state
  const [waitlistSortKey, setWaitlistSortKey] = useState<WaitlistSortKey | null>(null);
  const [waitlistSortDir, setWaitlistSortDir] = useState<SortDirection>(null);
  const [developerSortKey, setDeveloperSortKey] = useState<DeveloperSortKey | null>(null);
  const [developerSortDir, setDeveloperSortDir] = useState<SortDirection>(null);

  // Add new entry state
  const [addingWaitlist, setAddingWaitlist] = useState(false);
  const [addingDeveloper, setAddingDeveloper] = useState(false);
  const [newWaitlistForm, setNewWaitlistForm] = useState({ name: "", email: "", company: "", use_case: "", created_at: null as Date | null });
  const [newDeveloperForm, setNewDeveloperForm] = useState({ name: "", email: "", skills: "", message: "", created_at: null as Date | null });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingWaitlist, setEditingWaitlist] = useState<WaitlistSignup | null>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperApplication | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Delete state
  const [deletingWaitlist, setDeletingWaitlist] = useState<WaitlistSignup | null>(null);
  const [deletingDeveloper, setDeletingDeveloper] = useState<DeveloperApplication | null>(null);

  // Bulk selection state
  const [selectedWaitlist, setSelectedWaitlist] = useState<Set<string>>(new Set());
  const [selectedDevelopers, setSelectedDevelopers] = useState<Set<string>>(new Set());
  const [bulkDeleteWaitlist, setBulkDeleteWaitlist] = useState(false);
  const [bulkDeleteDevelopers, setBulkDeleteDevelopers] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
      
      // Clear selections on refresh
      setSelectedWaitlist(new Set());
      setSelectedDevelopers(new Set());
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

  // Sorting logic
  const handleWaitlistSort = (key: WaitlistSortKey) => {
    if (waitlistSortKey === key) {
      if (waitlistSortDir === "asc") {
        setWaitlistSortDir("desc");
      } else if (waitlistSortDir === "desc") {
        setWaitlistSortKey(null);
        setWaitlistSortDir(null);
      }
    } else {
      setWaitlistSortKey(key);
      setWaitlistSortDir("asc");
    }
  };

  const handleDeveloperSort = (key: DeveloperSortKey) => {
    if (developerSortKey === key) {
      if (developerSortDir === "asc") {
        setDeveloperSortDir("desc");
      } else if (developerSortDir === "desc") {
        setDeveloperSortKey(null);
        setDeveloperSortDir(null);
      }
    } else {
      setDeveloperSortKey(key);
      setDeveloperSortDir("asc");
    }
  };

  const getSortIcon = (isActive: boolean, direction: SortDirection) => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    if (direction === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredAndSortedWaitlist = useMemo(() => {
    let result = waitlistSignups.filter(
      (signup) =>
        signup.name.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
        signup.email.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
        (signup.company?.toLowerCase().includes(waitlistSearch.toLowerCase()) ?? false)
    );

    if (waitlistSortKey && waitlistSortDir) {
      result = [...result].sort((a, b) => {
        let aVal = a[waitlistSortKey] ?? "";
        let bVal = b[waitlistSortKey] ?? "";
        
        if (waitlistSortKey === "created_at") {
          aVal = new Date(aVal).getTime().toString();
          bVal = new Date(bVal).getTime().toString();
        }
        
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return waitlistSortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [waitlistSignups, waitlistSearch, waitlistSortKey, waitlistSortDir]);

  const filteredAndSortedDevelopers = useMemo(() => {
    let result = developerApplications.filter(
      (app) =>
        app.name.toLowerCase().includes(developerSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(developerSearch.toLowerCase()) ||
        (app.skills?.some((skill) =>
          skill.toLowerCase().includes(developerSearch.toLowerCase())
        ) ?? false)
    );

    if (developerSortKey && developerSortDir) {
      result = [...result].sort((a, b) => {
        let aVal = a[developerSortKey] ?? "";
        let bVal = b[developerSortKey] ?? "";
        
        if (developerSortKey === "created_at") {
          aVal = new Date(aVal).getTime().toString();
          bVal = new Date(bVal).getTime().toString();
        }
        
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return developerSortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [developerApplications, developerSearch, developerSortKey, developerSortDir]);

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

  const downloadTemplate = (type: "waitlist" | "developers") => {
    let csvContent: string;
    let filename: string;

    if (type === "waitlist") {
      csvContent = [
        "name,email,company,use_case,created_at",
        "John Doe,john@example.com,Acme Inc,Looking to automate customer support,2024-01-15",
        "Jane Smith,jane@example.com,StartupXYZ,Want to streamline workflows,2024-02-20"
      ].join("\n");
      filename = "waitlist_template.csv";
    } else {
      csvContent = [
        "name,email,skills,message,created_at",
        "Alex Developer,alex@example.com,\"React; TypeScript; Node.js\",Excited to contribute to the platform,2024-01-10",
        "Sam Coder,sam@example.com,\"Python; Machine Learning\",Looking to build AI integrations,2024-03-05"
      ].join("\n");
      filename = "developers_template.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success("Template downloaded");
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
              ...(r.created_at ? { created_at: new Date(r.created_at).toISOString() } : {}),
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
              ...(r.created_at ? { created_at: new Date(r.created_at).toISOString() } : {}),
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

  // Add new entry handlers
  const handleAddWaitlist = async () => {
    if (!newWaitlistForm.name || !newWaitlistForm.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({
          name: newWaitlistForm.name,
          email: newWaitlistForm.email,
          company: newWaitlistForm.company || null,
          use_case: newWaitlistForm.use_case || null,
          ...(newWaitlistForm.created_at ? { created_at: newWaitlistForm.created_at.toISOString() } : {}),
        });

      if (error) throw error;
      toast.success("Waitlist signup added");
      setAddingWaitlist(false);
      setNewWaitlistForm({ name: "", email: "", company: "", use_case: "", created_at: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeveloper = async () => {
    if (!newDeveloperForm.name || !newDeveloperForm.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("developer_applications")
        .insert({
          name: newDeveloperForm.name,
          email: newDeveloperForm.email,
          skills: newDeveloperForm.skills ? newDeveloperForm.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
          message: newDeveloperForm.message || null,
          ...(newDeveloperForm.created_at ? { created_at: newDeveloperForm.created_at.toISOString() } : {}),
        });

      if (error) throw error;
      toast.success("Developer application added");
      setAddingDeveloper(false);
      setNewDeveloperForm({ name: "", email: "", skills: "", message: "", created_at: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  // Selection handlers
  const toggleWaitlistSelection = (id: string) => {
    setSelectedWaitlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleDeveloperSelection = (id: string) => {
    setSelectedDevelopers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllWaitlist = () => {
    if (selectedWaitlist.size === filteredAndSortedWaitlist.length) {
      setSelectedWaitlist(new Set());
    } else {
      setSelectedWaitlist(new Set(filteredAndSortedWaitlist.map(s => s.id)));
    }
  };

  const toggleAllDevelopers = () => {
    if (selectedDevelopers.size === filteredAndSortedDevelopers.length) {
      setSelectedDevelopers(new Set());
    } else {
      setSelectedDevelopers(new Set(filteredAndSortedDevelopers.map(d => d.id)));
    }
  };

  // Edit handlers
  const handleEditWaitlist = (signup: WaitlistSignup) => {
    setEditingWaitlist(signup);
    setEditForm({
      name: signup.name,
      email: signup.email,
      company: signup.company || "",
      use_case: signup.use_case || "",
      created_at: new Date(signup.created_at),
    });
  };

  const handleEditDeveloper = (app: DeveloperApplication) => {
    setEditingDeveloper(app);
    setEditForm({
      name: app.name,
      email: app.email,
      skills: app.skills?.join(", ") || "",
      message: app.message || "",
      created_at: new Date(app.created_at),
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
          created_at: editForm.created_at instanceof Date ? editForm.created_at.toISOString() : editForm.created_at,
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
          created_at: editForm.created_at instanceof Date ? editForm.created_at.toISOString() : editForm.created_at,
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

  // Bulk delete handlers
  const handleBulkDeleteWaitlist = async () => {
    if (selectedWaitlist.size === 0) return;
    setBulkDeleting(true);

    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .delete()
        .in("id", Array.from(selectedWaitlist));

      if (error) throw error;
      toast.success(`Deleted ${selectedWaitlist.size} waitlist signups`);
      setBulkDeleteWaitlist(false);
      setSelectedWaitlist(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkDeleteDevelopers = async () => {
    if (selectedDevelopers.size === 0) return;
    setBulkDeleting(true);

    try {
      const { error } = await supabase
        .from("developer_applications")
        .delete()
        .in("id", Array.from(selectedDevelopers));

      if (error) throw error;
      toast.success(`Deleted ${selectedDevelopers.size} developer applications`);
      setBulkDeleteDevelopers(false);
      setSelectedDevelopers(new Set());
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setBulkDeleting(false);
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
            <TabsTrigger value="outreach" className="flex-1 sm:flex-none text-xs sm:text-sm gap-1">
              <Mail className="h-3 w-3" />
              Outreach
            </TabsTrigger>
          </TabsList>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col gap-3">
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
                      <div className="flex gap-2 flex-wrap">
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleCSVImport}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => setAddingWaitlist(true)}
                          className="flex-1 sm:flex-none"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate("waitlist")}
                          className="flex-1 sm:flex-none"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importing}
                          className="flex-1 sm:flex-none"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {importing ? "..." : "Import"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToCSV(filteredAndSortedWaitlist, "waitlist")}
                          className="flex-1 sm:flex-none"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                  {selectedWaitlist.size > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">
                        {selectedWaitlist.size} selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteWaitlist(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWaitlist(new Set())}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={filteredAndSortedWaitlist.length > 0 && selectedWaitlist.size === filteredAndSortedWaitlist.length}
                            onCheckedChange={toggleAllWaitlist}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleWaitlistSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {getSortIcon(waitlistSortKey === "name", waitlistSortDir)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleWaitlistSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {getSortIcon(waitlistSortKey === "email", waitlistSortDir)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="whitespace-nowrap hidden md:table-cell cursor-pointer hover:bg-muted/50"
                          onClick={() => handleWaitlistSort("company")}
                        >
                          <div className="flex items-center">
                            Company
                            {getSortIcon(waitlistSortKey === "company", waitlistSortDir)}
                          </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Use Case</TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleWaitlistSort("created_at")}
                        >
                          <div className="flex items-center">
                            Date
                            {getSortIcon(waitlistSortKey === "created_at", waitlistSortDir)}
                          </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedWaitlist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No waitlist signups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedWaitlist.map((signup) => (
                          <TableRow key={signup.id} className={selectedWaitlist.has(signup.id) ? "bg-muted/50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedWaitlist.has(signup.id)}
                                onCheckedChange={() => toggleWaitlistSelection(signup.id)}
                                aria-label={`Select ${signup.name}`}
                              />
                            </TableCell>
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
                <div className="flex flex-col gap-3">
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
                      <div className="flex gap-2 flex-wrap">
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleCSVImport}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => setAddingDeveloper(true)}
                          className="flex-1 sm:flex-none"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate("developers")}
                          className="flex-1 sm:flex-none"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importing}
                          className="flex-1 sm:flex-none"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {importing ? "..." : "Import"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToCSV(filteredAndSortedDevelopers, "developers")}
                          className="flex-1 sm:flex-none"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                  {selectedDevelopers.size > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">
                        {selectedDevelopers.size} selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDevelopers(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDevelopers(new Set())}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={filteredAndSortedDevelopers.length > 0 && selectedDevelopers.size === filteredAndSortedDevelopers.length}
                            onCheckedChange={toggleAllDevelopers}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleDeveloperSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {getSortIcon(developerSortKey === "name", developerSortDir)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleDeveloperSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {getSortIcon(developerSortKey === "email", developerSortDir)}
                          </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap hidden md:table-cell">Skills</TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Message</TableHead>
                        <TableHead 
                          className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                          onClick={() => handleDeveloperSort("created_at")}
                        >
                          <div className="flex items-center">
                            Date
                            {getSortIcon(developerSortKey === "created_at", developerSortDir)}
                          </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedDevelopers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No developer applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedDevelopers.map((app) => (
                          <TableRow key={app.id} className={selectedDevelopers.has(app.id) ? "bg-muted/50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedDevelopers.has(app.id)}
                                onCheckedChange={() => toggleDeveloperSelection(app.id)}
                                aria-label={`Select ${app.name}`}
                              />
                            </TableCell>
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

          {/* Outreach Tab */}
          <TabsContent value="outreach">
            <AdminOutreachTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Waitlist Dialog */}
      <Dialog open={addingWaitlist} onOpenChange={setAddingWaitlist}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Waitlist Signup</DialogTitle>
            <DialogDescription>
              Add a new person to the waitlist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name *</Label>
              <Input
                id="new-name"
                value={newWaitlistForm.name}
                onChange={(e) => setNewWaitlistForm({ ...newWaitlistForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                value={newWaitlistForm.email}
                onChange={(e) => setNewWaitlistForm({ ...newWaitlistForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company">Company</Label>
              <Input
                id="new-company"
                value={newWaitlistForm.company}
                onChange={(e) => setNewWaitlistForm({ ...newWaitlistForm, company: e.target.value })}
                placeholder="Acme Inc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-use-case">Use Case</Label>
              <Textarea
                id="new-use-case"
                value={newWaitlistForm.use_case}
                onChange={(e) => setNewWaitlistForm({ ...newWaitlistForm, use_case: e.target.value })}
                placeholder="What they want to use the product for..."
              />
            </div>
            <div className="space-y-2">
              <Label>Signup Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newWaitlistForm.created_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newWaitlistForm.created_at ? format(newWaitlistForm.created_at, "PPP") : <span>Defaults to now</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newWaitlistForm.created_at || undefined}
                    onSelect={(date) => setNewWaitlistForm({ ...newWaitlistForm, created_at: date || null })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingWaitlist(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddWaitlist} disabled={saving}>
              {saving ? "Adding..." : "Add Signup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Developer Dialog */}
      <Dialog open={addingDeveloper} onOpenChange={setAddingDeveloper}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Developer Application</DialogTitle>
            <DialogDescription>
              Add a new developer application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-dev-name">Name *</Label>
              <Input
                id="new-dev-name"
                value={newDeveloperForm.name}
                onChange={(e) => setNewDeveloperForm({ ...newDeveloperForm, name: e.target.value })}
                placeholder="Jane Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-dev-email">Email *</Label>
              <Input
                id="new-dev-email"
                type="email"
                value={newDeveloperForm.email}
                onChange={(e) => setNewDeveloperForm({ ...newDeveloperForm, email: e.target.value })}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-skills">Skills (comma-separated)</Label>
              <Input
                id="new-skills"
                value={newDeveloperForm.skills}
                onChange={(e) => setNewDeveloperForm({ ...newDeveloperForm, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-message">Message</Label>
              <Textarea
                id="new-message"
                value={newDeveloperForm.message}
                onChange={(e) => setNewDeveloperForm({ ...newDeveloperForm, message: e.target.value })}
                placeholder="Why they want to join..."
              />
            </div>
            <div className="space-y-2">
              <Label>Application Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDeveloperForm.created_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDeveloperForm.created_at ? format(newDeveloperForm.created_at, "PPP") : <span>Defaults to now</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDeveloperForm.created_at || undefined}
                    onSelect={(date) => setNewDeveloperForm({ ...newDeveloperForm, created_at: date || null })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingDeveloper(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddDeveloper} disabled={saving}>
              {saving ? "Adding..." : "Add Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="space-y-2">
              <Label>Signup Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editForm.created_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editForm.created_at ? format(editForm.created_at, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editForm.created_at}
                    onSelect={(date) => setEditForm({ ...editForm, created_at: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
            <div className="space-y-2">
              <Label>Application Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editForm.created_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editForm.created_at ? format(editForm.created_at, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editForm.created_at}
                    onSelect={(date) => setEditForm({ ...editForm, created_at: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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

      {/* Bulk Delete Waitlist Confirmation */}
      <AlertDialog open={bulkDeleteWaitlist} onOpenChange={setBulkDeleteWaitlist}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedWaitlist.size} Waitlist Signups</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedWaitlist.size} selected waitlist signups? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDeleteWaitlist} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Deleting..." : `Delete ${selectedWaitlist.size} entries`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Developers Confirmation */}
      <AlertDialog open={bulkDeleteDevelopers} onOpenChange={setBulkDeleteDevelopers}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDevelopers.size} Developer Applications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDevelopers.size} selected developer applications? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDeleteDevelopers} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Deleting..." : `Delete ${selectedDevelopers.size} entries`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;