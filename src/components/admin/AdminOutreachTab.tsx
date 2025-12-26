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
  ChevronLeft,
  ChevronRight,
  Users,
  Tag,
  Clock,
  Calendar,
  RefreshCw,
  Eye,
  FileText,
  Save,
  Copy,
  Play,
  Square,
  Loader2,
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
  audience: string | null;
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
  scheduled_at: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  audience_filter: string | null;
  next_recurring_run: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  is_default: boolean;
  created_at: string;
}

type RecurrencePattern = "daily" | "weekly" | "monthly" | "none";

type SortDirection = "asc" | "desc" | null;
type OutreachSortKey = "name" | "email" | "company" | "status" | "email_count" | "created_at";

const STATUS_OPTIONS = ["all", "pending", "contacted", "responded", "converted"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  contacted: "bg-blue-500/20 text-blue-700",
  responded: "bg-green-500/20 text-green-700",
  converted: "bg-purple-500/20 text-purple-700",
};

const PAGE_SIZE = 50;

export const AdminOutreachTab = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    pending: 0,
    contacted: 0,
    responded: 0,
    converted: 0,
  });
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [availableAudiences, setAvailableAudiences] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<OutreachSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [importing, setImporting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("contacts");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Dialogs
  const [addingContact, setAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<OutreachContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<OutreachContact | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [assignAudienceOpen, setAssignAudienceOpen] = useState(false);
  const [emailAllMode, setEmailAllMode] = useState(false);
  const [showCampaignComposer, setShowCampaignComposer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Forms
  const [contactForm, setContactForm] = useState({
    email: "",
    name: "",
    company: "",
    source: "",
    notes: "",
    audience: "",
  });
  const [emailForm, setEmailForm] = useState({
    name: "",
    subject: "",
    body_html: "",
    targetAudience: "all" as "all" | "audience" | "selected",
    selectedAudienceForEmail: "",
    scheduledAt: "",
    isRecurring: false,
    recurrencePattern: "none" as RecurrencePattern,
  });
  const [sending, setSending] = useState(false);
  const [cancellingCampaignId, setCancellingCampaignId] = useState<string | null>(null);
  const [resumingCampaignId, setResumingCampaignId] = useState<string | null>(null);
  const [newAudience, setNewAudience] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");

  const fetchData = async () => {
    try {
      // Get total count, status counts, audiences, sources, and templates
      const [countRes, pendingRes, contactedRes, respondedRes, convertedRes, campaignsRes, audiencesRes, sourcesRes, templatesRes] = await Promise.all([
        supabase.from("outreach_contacts").select("*", { count: "exact", head: true }),
        supabase.from("outreach_contacts").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("outreach_contacts").select("*", { count: "exact", head: true }).eq("status", "contacted"),
        supabase.from("outreach_contacts").select("*", { count: "exact", head: true }).eq("status", "responded"),
        supabase.from("outreach_contacts").select("*", { count: "exact", head: true }).eq("status", "converted"),
        supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("outreach_contacts").select("audience").not("audience", "is", null),
        supabase.from("outreach_contacts").select("source").not("source", "is", null),
        supabase.from("email_templates").select("*").order("created_at", { ascending: false }),
      ]);

      setTotalCount(countRes.count ?? 0);
      setStatusCounts({
        pending: pendingRes.count ?? 0,
        contacted: contactedRes.count ?? 0,
        responded: respondedRes.count ?? 0,
        converted: convertedRes.count ?? 0,
      });
      if (campaignsRes.data) setCampaigns(campaignsRes.data as EmailCampaign[]);
      if (templatesRes.data) setTemplates(templatesRes.data as EmailTemplate[]);
      
      // Extract unique audiences
      if (audiencesRes.data) {
        const uniqueAudiences = [...new Set(audiencesRes.data.map((c) => c.audience).filter(Boolean))] as string[];
        setAvailableAudiences(uniqueAudiences.sort());
      }
      
      // Extract unique sources
      if (sourcesRes.data) {
        const uniqueSources = [...new Set(sourcesRes.data.map((c) => c.source).filter(Boolean))] as string[];
        setAvailableSources(uniqueSources.sort());
      }
    } catch (error) {
      console.error("Error fetching outreach data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch paginated contacts
  const fetchContacts = async () => {
    try {
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("outreach_contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      if (data) setContacts(data as OutreachContact[]);
      setSelectedContacts(new Set());
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

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
      const matchesAudience = audienceFilter === "all" || 
        (audienceFilter === "none" ? !c.audience : c.audience === audienceFilter);
      const matchesSource = sourceFilter === "all" || c.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesAudience && matchesSource;
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
  }, [contacts, search, statusFilter, audienceFilter, sourceFilter, sortKey, sortDir]);

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
        audience: contactForm.audience || null,
      });

      if (error) throw error;
      toast.success("Contact added");
      setAddingContact(false);
      setContactForm({ email: "", name: "", company: "", source: "", notes: "", audience: "" });
      fetchData();
      fetchContacts();
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
          audience: contactForm.audience || null,
        })
        .eq("id", editingContact.id);

      if (error) throw error;
      toast.success("Contact updated");
      setEditingContact(null);
      fetchData();
      fetchContacts();
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
      fetchContacts();
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
      fetchContacts();
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast.error(error.message || "Failed to delete contacts");
    }
  };

  const handleDeleteAll = async () => {
    if (totalCount === 0) return;

    try {
      // Delete all contacts in batches using a loop
      const BATCH_SIZE = 500;
      let totalDeleted = 0;
      let hasMore = true;

      while (hasMore) {
        // Fetch a batch of IDs
        const { data: batch, error: fetchError } = await supabase
          .from("outreach_contacts")
          .select("id")
          .limit(BATCH_SIZE);

        if (fetchError) throw fetchError;

        if (!batch || batch.length === 0) {
          hasMore = false;
          break;
        }

        const ids = batch.map((c) => c.id);
        const { error: deleteError } = await supabase
          .from("outreach_contacts")
          .delete()
          .in("id", ids);

        if (deleteError) throw deleteError;
        totalDeleted += ids.length;

        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }

      toast.success(`Deleted all ${totalDeleted.toLocaleString()} contacts`);
      setDeleteAllOpen(false);
      setSelectedContacts(new Set());
      setCurrentPage(1);
      fetchData();
      fetchContacts();
    } catch (error: any) {
      console.error("Delete all error:", error);
      toast.error(error.message || "Failed to delete all contacts");
    }
  };

  // Assign audience to selected contacts
  const handleAssignAudience = async () => {
    if (selectedContacts.size === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    const audienceToAssign = newAudience.trim() || selectedAudience || null;
    
    try {
      const idsToUpdate = Array.from(selectedContacts);
      const BATCH_SIZE = 100;

      for (let i = 0; i < idsToUpdate.length; i += BATCH_SIZE) {
        const batch = idsToUpdate.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from("outreach_contacts")
          .update({ audience: audienceToAssign })
          .in("id", batch);

        if (error) throw error;
      }

      toast.success(`Assigned ${audienceToAssign ? `"${audienceToAssign}"` : "no audience"} to ${selectedContacts.size} contacts`);
      setAssignAudienceOpen(false);
      setNewAudience("");
      setSelectedAudience("");
      setSelectedContacts(new Set());
      fetchData();
      fetchContacts();
    } catch (error: any) {
      console.error("Assign audience error:", error);
      toast.error(error.message || "Failed to assign audience");
    }
  };

  // Email sending
  const handleSendEmail = async () => {
    if (!emailForm.name || !emailForm.subject || !emailForm.body_html) {
      toast.error("Campaign name, subject, and body are required");
      return;
    }

    if (emailForm.targetAudience === "audience" && !emailForm.selectedAudienceForEmail) {
      toast.error("Please select an audience");
      return;
    }

    setSending(true);
    try {
      let recipients: { email: string; name?: string; outreach_contact_id: string }[] = [];
      const targetAudience = emailForm.targetAudience;

      if (targetAudience === "all" || targetAudience === "audience") {
        // Fetch ALL contacts matching current filters (not just current page)
        let allContacts: OutreachContact[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const from = page * 1000;
          const to = from + 999;
          
          let query = supabase
            .from("outreach_contacts")
            .select("*")
            .range(from, to);

          // For audience targeting, filter by selected audience
          if (targetAudience === "audience" && emailForm.selectedAudienceForEmail) {
            query = query.eq("audience", emailForm.selectedAudienceForEmail);
          }

          const { data, error } = await query;
          if (error) throw error;
          
          if (data && data.length > 0) {
            allContacts = [...allContacts, ...(data as OutreachContact[])];
            if (data.length < 1000) hasMore = false;
            page++;
          } else {
            hasMore = false;
          }
        }

        // Apply search filter client-side
        const filtered = allContacts.filter((c) => {
          if (!search) return true;
          return c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
        });

        recipients = filtered.map((c) => ({
          email: c.email,
          name: c.name || undefined,
          outreach_contact_id: c.id,
        }));
      } else {
        if (selectedContacts.size === 0) {
          toast.error("Please select at least one contact");
          setSending(false);
          return;
        }
        
        recipients = filteredAndSortedContacts
          .filter((c) => selectedContacts.has(c.id))
          .map((c) => ({
            email: c.email,
            name: c.name || undefined,
            outreach_contact_id: c.id,
          }));
      }

      if (recipients.length === 0) {
        toast.error("No recipients found");
        setSending(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Not authenticated");
        setSending(false);
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
      setEmailForm({ name: "", subject: "", body_html: "", targetAudience: "all", selectedAudienceForEmail: "", scheduledAt: "", isRecurring: false, recurrencePattern: "none" });
      setSelectedContacts(new Set());
      setEmailAllMode(false);
      fetchData();
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast.error(error.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  // Save as template
  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !emailForm.subject || !emailForm.body_html) {
      toast.error("Template name, subject, and body are required");
      return;
    }

    setSavingTemplate(true);
    try {
      const { error } = await supabase.from("email_templates").insert({
        name: templateName.trim(),
        subject: emailForm.subject,
        body_html: emailForm.body_html,
      });

      if (error) throw error;
      toast.success("Template saved");
      setTemplateName("");
      fetchData();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(error.message || "Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Load template
  const handleLoadTemplate = (template: EmailTemplate) => {
    setEmailForm({
      ...emailForm,
      subject: template.subject,
      body_html: template.body_html,
    });
    setShowTemplates(false);
    toast.success(`Loaded "${template.name}" template`);
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      toast.success("Template deleted");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.message || "Failed to delete template");
    }
  };

  // Generate preview HTML
  const getPreviewHtml = () => {
    const sampleName = "John Doe";
    return emailForm.body_html.replace(/\{\{name\}\}/g, sampleName);
  };

  // Cancel campaign
  const handleCancelCampaign = async (campaignId: string) => {
    setCancellingCampaignId(campaignId);
    try {
      const response = await supabase.functions.invoke("cancel-campaign", {
        body: { campaign_id: campaignId },
      });

      if (response.error) throw response.error;

      toast.success("Campaign cancellation requested");
      fetchData();
    } catch (error: any) {
      console.error("Error cancelling campaign:", error);
      toast.error(error.message || "Failed to cancel campaign");
    } finally {
      setCancellingCampaignId(null);
    }
  };

  // Resume campaign - fetch unsent contacts and restart
  const handleResumeCampaign = async (campaign: EmailCampaign) => {
    setResumingCampaignId(campaign.id);
    try {
      // Get already sent emails for this campaign
      const { data: sentEmails, error: sentError } = await supabase
        .from("email_sends")
        .select("outreach_contact_id")
        .eq("campaign_id", campaign.id);

      if (sentError) throw sentError;

      const sentContactIds = new Set(
        (sentEmails || []).map((e) => e.outreach_contact_id).filter(Boolean)
      );

      // Fetch all contacts and filter out already sent
      let allContacts: OutreachContact[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const from = page * 1000;
        const to = from + 999;
        
        let query = supabase
          .from("outreach_contacts")
          .select("*")
          .range(from, to);

        // Apply audience filter if the campaign had one
        if (campaign.audience_filter) {
          query = query.eq("audience", campaign.audience_filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (data && data.length > 0) {
          allContacts = [...allContacts, ...(data as OutreachContact[])];
          if (data.length < 1000) hasMore = false;
          page++;
        } else {
          hasMore = false;
        }
      }

      // Filter out already sent contacts
      const remainingContacts = allContacts.filter(
        (c) => !sentContactIds.has(c.id)
      );

      if (remainingContacts.length === 0) {
        toast.info("All contacts have already been sent to");
        return;
      }

      const recipients = remainingContacts.map((c) => ({
        email: c.email,
        name: c.name || undefined,
        outreach_contact_id: c.id,
      }));

      const response = await supabase.functions.invoke("send-marketing-email", {
        body: {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          subject: campaign.subject,
          body_html: campaign.body_html,
          recipients,
        },
      });

      if (response.error) throw response.error;

      toast.success(`Resuming campaign with ${remainingContacts.length} remaining contacts`);
      fetchData();
    } catch (error: any) {
      console.error("Error resuming campaign:", error);
      toast.error(error.message || "Failed to resume campaign");
    } finally {
      setResumingCampaignId(null);
    }
  };

  // Auto-refresh campaigns that are sending
  useEffect(() => {
    const sendingCampaigns = campaigns.filter((c) => c.status === "sending");
    if (sendingCampaigns.length === 0) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [campaigns]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {statusCounts.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {statusCounts.contacted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Contacted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {statusCounts.converted.toLocaleString()}
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
                    <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Audiences</SelectItem>
                        <SelectItem value="none">No Audience</SelectItem>
                        {availableAudiences.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableSources.length > 0 && (
                      <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-full sm:w-36">
                          <Tag className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {availableSources.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                  {selectedContacts.size > 0 && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEmailAllMode(false);
                          setEmailForm(prev => ({ ...prev, targetAudience: "selected" }));
                          setComposerOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Email ({selectedContacts.size})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignAudienceOpen(true)}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Assign Audience
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteAllOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All ({totalCount.toLocaleString()})
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
                      <TableHead className="hidden xl:table-cell">Audience</TableHead>
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
                          <TableCell className="hidden xl:table-cell">
                            {contact.audience ? (
                              <Badge variant="outline" className="text-xs">
                                {contact.audience}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
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
                                    audience: contact.audience || "",
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} contacts
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* New Campaign Button */}
          {!showCampaignComposer && (
            <Button 
              onClick={() => setShowCampaignComposer(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          )}

          {/* Email Composer Card */}
          {showCampaignComposer && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  New Email Campaign
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCampaignComposer(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Actions */}
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {showTemplates ? "Hide Templates" : "Load Template"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!emailForm.body_html}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
              </div>

              {/* Templates Panel */}
              {showTemplates && (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Saved Templates</Label>
                  </div>
                  {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No templates saved yet. Create your first template below.</p>
                  ) : (
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-2 border rounded bg-background hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{template.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleLoadTemplate(template)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Save as Template */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate || !templateName.trim() || !emailForm.subject || !emailForm.body_html}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingTemplate ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              {showPreview && emailForm.body_html && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b">
                    <p className="text-sm font-medium">Email Preview</p>
                    <p className="text-xs text-muted-foreground">Subject: {emailForm.subject || "(No subject)"}</p>
                  </div>
                  <div 
                    className="p-4 bg-white min-h-[200px] max-h-[400px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Name *</Label>
                  <Input
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                    placeholder="Q1 Outreach Campaign"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select 
                    value={emailForm.targetAudience} 
                    onValueChange={(v: "all" | "audience" | "selected") => setEmailForm({ ...emailForm, targetAudience: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts ({totalCount.toLocaleString()})</SelectItem>
                      <SelectItem value="audience">Specific Audience</SelectItem>
                      {selectedContacts.size > 0 && (
                        <SelectItem value="selected">Selected Contacts ({selectedContacts.size})</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {emailForm.targetAudience === "audience" && (
                <div className="space-y-2">
                  <Label>Select Audience</Label>
                  <Select 
                    value={emailForm.selectedAudienceForEmail} 
                    onValueChange={(v) => setEmailForm({ ...emailForm, selectedAudienceForEmail: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an audience..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAudiences.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  className="min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Use {"{{name}}"} to personalize with the recipient's name</p>
              </div>

              {/* Scheduling Options */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label className="font-medium">Scheduling Options</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Send Time</Label>
                    <Input
                      type="datetime-local"
                      value={emailForm.scheduledAt}
                      onChange={(e) => setEmailForm({ ...emailForm, scheduledAt: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Recurring</Label>
                    <Select 
                      value={emailForm.recurrencePattern} 
                      onValueChange={(v: RecurrencePattern) => setEmailForm({ 
                        ...emailForm, 
                        recurrencePattern: v, 
                        isRecurring: v !== "none" 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {emailForm.isRecurring && (
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-sm text-blue-700">
                    <RefreshCw className="h-4 w-4" />
                    This campaign will repeat {emailForm.recurrencePattern}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (emailForm.targetAudience === "all") {
                      setEmailAllMode(true);
                    } else {
                      setEmailAllMode(false);
                    }
                    handleSendEmail();
                  }}
                  disabled={sending || !emailForm.name || !emailForm.subject || !emailForm.body_html}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {sending ? (
                    "Sending..."
                  ) : emailForm.scheduledAt ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Campaign
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Campaigns History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Campaign History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No campaigns yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {campaign.name}
                              {campaign.is_recurring && (
                                <Badge variant="outline" className="text-xs">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  {campaign.recurrence_pattern}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{campaign.subject}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                campaign.status === "sent" ? "default" : 
                                campaign.status === "sending" ? "outline" :
                                campaign.status === "cancelled" ? "destructive" :
                                campaign.status === "scheduled" ? "secondary" : 
                                "secondary"
                              }
                              className={
                                campaign.status === "sending" ? "bg-blue-500/20 text-blue-700" :
                                campaign.status === "scheduled" ? "bg-blue-500/20 text-blue-700" :
                                campaign.status === "cancelled" ? "bg-red-500/20 text-red-700" : ""
                              }
                            >
                              {campaign.status === "sending" && (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              )}
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">{campaign.sent_count}</span>
                              <span className="text-muted-foreground">/</span>
                              <span>{campaign.recipient_count}</span>
                              {campaign.failed_count > 0 && (
                                <span className="text-red-600 text-xs">({campaign.failed_count} failed)</span>
                              )}
                            </div>
                            {campaign.status === "sending" && campaign.recipient_count > 0 && (
                              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-primary h-1.5 rounded-full transition-all" 
                                  style={{ width: `${Math.round((campaign.sent_count / campaign.recipient_count) * 100)}%` }}
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.audience_filter ? (
                              <Badge variant="outline" className="text-xs">{campaign.audience_filter}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">All</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.scheduled_at && campaign.status === "scheduled" ? (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Clock className="h-3 w-3" />
                                {format(new Date(campaign.scheduled_at), "MMM d, HH:mm")}
                              </div>
                            ) : campaign.sent_at ? (
                              format(new Date(campaign.sent_at), "MMM d, yyyy HH:mm")
                            ) : (
                              format(new Date(campaign.created_at), "MMM d, yyyy")
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {campaign.status === "sending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancelCampaign(campaign.id)}
                                  disabled={cancellingCampaignId === campaign.id}
                                  title="Cancel campaign"
                                >
                                  {cancellingCampaignId === campaign.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {(campaign.status === "cancelled" || 
                                (campaign.status === "sent" && campaign.sent_count < campaign.recipient_count)) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleResumeCampaign(campaign)}
                                  disabled={resumingCampaignId === campaign.id}
                                  title="Resume campaign"
                                >
                                  {resumingCampaignId === campaign.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
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
            <div className="space-y-2">
              <Label>Audience</Label>
              <Input
                value={contactForm.audience}
                onChange={(e) => setContactForm({ ...contactForm, audience: e.target.value })}
                placeholder="e.g. VCs, Founders, Enterprise..."
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
            <AlertDialogTitle>Delete All {totalCount.toLocaleString()} Contacts</AlertDialogTitle>
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
              {emailAllMode 
                ? `Send an email to all ${totalCount.toLocaleString()} contacts. Use {{name}} to personalize.`
                : `Send an email to ${selectedContacts.size} selected contacts. Use {{name}} to personalize.`
              }
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
            <Button variant="outline" onClick={() => { setComposerOpen(false); setEmailAllMode(false); }} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? "Sending..." : emailAllMode ? `Send to All (${totalCount.toLocaleString()})` : `Send to ${selectedContacts.size} Contacts`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Audience Dialog */}
      <Dialog open={assignAudienceOpen} onOpenChange={setAssignAudienceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Audience</DialogTitle>
            <DialogDescription>
              Assign an audience to {selectedContacts.size} selected contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableAudiences.length > 0 && (
              <div className="space-y-2">
                <Label>Select Existing Audience</Label>
                <Select value={selectedAudience} onValueChange={(v) => { setSelectedAudience(v); setNewAudience(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (remove audience)</SelectItem>
                    {availableAudiences.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Or Create New Audience</Label>
              <Input
                value={newAudience}
                onChange={(e) => { setNewAudience(e.target.value); setSelectedAudience(""); }}
                placeholder="e.g. VCs, Founders, Enterprise..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignAudienceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAudience}>
              Assign to {selectedContacts.size} Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
