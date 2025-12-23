import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Search,
  Upload,
  Pencil,
  Trash2,
  FileDown,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Send,
  History,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OutreachContact {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  last_contacted_at: string | null;
  email_count: number;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

type SortDirection = "asc" | "desc" | null;
type OutreachSortKey = "name" | "email" | "company" | "status" | "email_count" | "created_at";

const STATUS_OPTIONS = ["all", "pending", "contacted", "responded", "converted"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  contacted: "bg-blue-500/20 text-blue-700",
  responded: "bg-green-500/20 text-green-700",
  converted: "bg-purple-500/20 text-purple-700",
};

export const AdminOutreachTab = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<OutreachSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [importing, setImporting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("contacts");

  // Selection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Dialogs
  const [addingContact, setAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<OutreachContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<OutreachContact | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  // Forms
  const [contactForm, setContactForm] = useState({
    email: "",
    name: "",
    company: "",
    source: "",
    notes: "",
  });
  const [emailForm, setEmailForm] = useState({
    name: "",
    subject: "",
    body_html: "",
  });
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      const [contactsRes, campaignsRes] = await Promise.all([
        supabase
          .from("outreach_contacts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("email_campaigns")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (contactsRes.data) setContacts(contactsRes.data);
      if (campaignsRes.data) setCampaigns(campaignsRes.data);
      setSelectedContacts(new Set());
    } catch (error) {
      console.error("Error fetching outreach data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sorting
  const handleSort = (key: OutreachSortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortIcon = (isActive: boolean, direction: SortDirection) => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    if (direction === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredAndSortedContacts = useMemo(() => {
    let result = contacts.filter((c) => {
      const matchesSearch =
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";

        if (sortKey === "email_count") {
          aVal = a.email_count;
          bVal = b.email_count;
        } else if (sortKey === "created_at") {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else {
          aVal = (a[sortKey] ?? "") as string;
          bVal = (b[sortKey] ?? "") as string;
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return sortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [contacts, search, statusFilter, sortKey, sortDir]);

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedContacts.size === filteredAndSortedContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredAndSortedContacts.map((c) => c.id)));
    }
  };

  // CSV Import
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

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          toast.error("CSV file is empty or has no data rows");
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
        const dataRows = lines.slice(1);

        const records = dataRows
          .map((line) => {
            const values = parseCSVLine(line);
            const record: Record<string, string | null> = {};

            headers.forEach((header, index) => {
              const value = values[index]?.trim().replace(/^"|"$/g, "") || null;
              record[header] = value;
            });

            return record;
          })
          .filter((r) => r.email);

        if (records.length === 0) {
          toast.error("No valid records found. CSV must have 'email' column.");
          return;
        }

        // Insert in batches of 500 to avoid Supabase limits
        const BATCH_SIZE = 500;
        let totalImported = 0;
        let totalErrors = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          const { error } = await supabase.from("outreach_contacts").insert(
            batch.map((r) => ({
              email: r.email!,
              name: r.name || null,
              company: r.company || null,
              source: r.source || "csv_import",
              notes: r.notes || null,
            }))
          );

          if (error) {
            console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error);
            totalErrors += batch.length;
          } else {
            totalImported += batch.length;
          }
        }

        if (totalErrors > 0) {
          toast.warning(`Imported ${totalImported} contacts, ${totalErrors} failed (likely duplicates)`);
        } else {
          toast.success(`Imported ${totalImported} contacts`);
        }
        fetchData();
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(error.message || "Failed to import CSV");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = [
      "email,name,company,source,notes",
      "john@example.com,John Doe,Acme Inc,linkedin,Met at conference",
      "jane@example.com,Jane Smith,StartupXYZ,cold,Reached out via email",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "outreach_template.csv";
    link.click();
    toast.success("Template downloaded");
  };

  const exportToCSV = () => {
    if (filteredAndSortedContacts.length === 0) return;

    const headers = ["email", "name", "company", "source", "status", "email_count", "notes", "created_at"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedContacts.map((c) =>
        headers.map((h) => {
          const value = c[h as keyof OutreachContact];
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `outreach_contacts_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // CRUD handlers
  const handleAddContact = async () => {
    if (!contactForm.email) {
      toast.error("Email is required");
      return;
    }

    try {
      const { error } = await supabase.from("outreach_contacts").insert({
        email: contactForm.email,
        name: contactForm.name || null,
        company: contactForm.company || null,
        source: contactForm.source || null,
        notes: contactForm.notes || null,
      });

      if (error) throw error;
      toast.success("Contact added");
      setAddingContact(false);
      setContactForm({ email: "", name: "", company: "", source: "", notes: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add contact");
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from("outreach_contacts")
        .update({
          email: contactForm.email,
          name: contactForm.name || null,
          company: contactForm.company || null,
          source: contactForm.source || null,
          notes: contactForm.notes || null,
        })
        .eq("id", editingContact.id);

      if (error) throw error;
      toast.success("Contact updated");
      setEditingContact(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update contact");
    }
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return;

    try {
      const { error } = await supabase
        .from("outreach_contacts")
        .delete()
        .eq("id", deletingContact.id);

      if (error) throw error;
      toast.success("Contact deleted");
      setDeletingContact(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete contact");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;

    try {
      const idsToDelete = Array.from(selectedContacts);
      const BATCH_SIZE = 100;
      let totalDeleted = 0;

      // Delete in batches to handle large selections
      for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("outreach_contacts")
          .delete()
          .in("id", batch);

        if (error) throw error;
        totalDeleted += batch.length;
      }

      toast.success(`Deleted ${totalDeleted} contacts`);
      setBulkDeleteOpen(false);
      setSelectedContacts(new Set());
      fetchData();
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast.error(error.message || "Failed to delete contacts");
    }
  };

  const handleDeleteAll = async () => {
    if (contacts.length === 0) return;

    try {
      // Get all contact IDs
      const allIds = contacts.map((c) => c.id);
      const BATCH_SIZE = 100;
      let totalDeleted = 0;

      // Delete in batches
      for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
        const batch = allIds.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("outreach_contacts")
          .delete()
          .in("id", batch);

        if (error) throw error;
        totalDeleted += batch.length;
      }

      toast.success(`Deleted all ${totalDeleted} contacts`);
      setDeleteAllOpen(false);
      setSelectedContacts(new Set());
      fetchData();
    } catch (error: any) {
      console.error("Delete all error:", error);
      toast.error(error.message || "Failed to delete all contacts");
    }
  };

  // Email sending
  const handleSendEmail = async () => {
    if (!emailForm.name || !emailForm.subject || !emailForm.body_html) {
      toast.error("Campaign name, subject, and body are required");
      return;
    }

    if (selectedContacts.size === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    setSending(true);
    try {
      const recipients = filteredAndSortedContacts
        .filter((c) => selectedContacts.has(c.id))
        .map((c) => ({
          email: c.email,
          name: c.name || undefined,
          outreach_contact_id: c.id,
        }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await supabase.functions.invoke("send-marketing-email", {
        body: {
          campaign_name: emailForm.name,
          subject: emailForm.subject,
          body_html: emailForm.body_html,
          recipients,
        },
      });

      if (response.error) throw response.error;

      const result = response.data;
      toast.success(
        `Campaign sent! ${result.sent_count} sent, ${result.failed_count} failed`
      );
      setComposerOpen(false);
      setEmailForm({ name: "", subject: "", body_html: "" });
      setSelectedContacts(new Set());
      fetchData();
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast.error(error.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "contacted").length}
            </div>
            <p className="text-xs text-muted-foreground">Contacted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.status === "converted").length}
            </div>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="contacts" className="gap-2">
            <Mail className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <History className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg">Outreach Contacts</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-full sm:w-48"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                  <Button size="sm" onClick={() => setAddingContact(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? "..." : "Import"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {contacts.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteAllOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  )}
                  {selectedContacts.size > 0 && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setComposerOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Email ({selectedContacts.size})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            filteredAndSortedContacts.length > 0 &&
                            selectedContacts.size === filteredAndSortedContacts.length
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          {getSortIcon(sortKey === "email", sortDir)}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 hidden sm:table-cell"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {getSortIcon(sortKey === "name", sortDir)}
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Company</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon(sortKey === "status", sortDir)}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 hidden lg:table-cell"
                        onClick={() => handleSort("email_count")}
                      >
                        <div className="flex items-center">
                          Sent
                          {getSortIcon(sortKey === "email_count", sortDir)}
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No contacts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedContacts.map((contact) => (
                        <TableRow
                          key={contact.id}
                          className={selectedContacts.has(contact.id) ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedContacts.has(contact.id)}
                              onCheckedChange={() => toggleSelection(contact.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {contact.email}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {contact.name || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {contact.company || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[contact.status] || ""}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {contact.email_count}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingContact(contact);
                                  setContactForm({
                                    email: contact.email,
                                    name: contact.name || "",
                                    company: contact.company || "",
                                    source: contact.source || "",
                                    notes: contact.notes || "",
                                  });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeletingContact(contact)}
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

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No campaigns yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{campaign.subject}</TableCell>
                          <TableCell>
                            <Badge
                              variant={campaign.status === "sent" ? "default" : "secondary"}
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-600">{campaign.sent_count}</TableCell>
                          <TableCell className="text-red-600">{campaign.failed_count}</TableCell>
                          <TableCell>
                            {campaign.sent_at
                              ? format(new Date(campaign.sent_at), "MMM d, yyyy HH:mm")
                              : format(new Date(campaign.created_at), "MMM d, yyyy")}
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

      {/* Add Contact Dialog */}
      <Dialog open={addingContact} onOpenChange={setAddingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new outreach contact.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                placeholder="Acme Inc"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={contactForm.source}
                onChange={(e) => setContactForm({ ...contactForm, source: e.target.value })}
                placeholder="linkedin, conference, cold..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                placeholder="Any notes about this contact..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingContact(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input
                value={contactForm.source}
                onChange={(e) => setContactForm({ ...contactForm, source: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContact}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingContact?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedContacts.size} Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete these contacts? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Dialog */}
      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All {contacts.length} Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ALL contacts? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Composer Dialog */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Campaign</DialogTitle>
            <DialogDescription>
              Send an email to {selectedContacts.size} selected contacts. Use {"{{name}}"} to personalize.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input
                value={emailForm.name}
                onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                placeholder="Q1 Outreach"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Exclusive early access to Elixa"
              />
            </div>
            <div className="space-y-2">
              <Label>Body (HTML) *</Label>
              <Textarea
                value={emailForm.body_html}
                onChange={(e) => setEmailForm({ ...emailForm, body_html: e.target.value })}
                placeholder="<h1>Hello {{name}}</h1><p>We're excited to share...</p>"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposerOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? "Sending..." : `Send to ${selectedContacts.size} Contacts`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
