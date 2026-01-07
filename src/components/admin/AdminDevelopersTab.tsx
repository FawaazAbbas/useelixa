import { useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Download, Search, Upload, Pencil, Trash2, FileDown, Plus, ArrowUpDown, ArrowUp, ArrowDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeveloperApplication {
  id: string;
  name: string;
  email: string;
  skills: string[] | null;
  message: string | null;
  created_at: string;
}

type SortDirection = "asc" | "desc" | null;
type SortKey = "name" | "email" | "created_at";

interface AdminDevelopersTabProps {
  applications: DeveloperApplication[];
  onRefresh: () => void;
}

export const AdminDevelopersTab = ({ applications, onRefresh }: AdminDevelopersTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const [addingEntry, setAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DeveloperApplication | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DeveloperApplication | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", skills: "", message: "", created_at: null as Date | null });
  const [editForm, setEditForm] = useState<any>({});

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else { setSortKey(key); setSortDir("asc"); }
  };

  const getSortIcon = (isActive: boolean, direction: SortDirection) => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    if (direction === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredAndSorted = useMemo(() => {
    let result = applications.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ?? false)
    );
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortKey] ?? "";
        let bVal = b[sortKey] ?? "";
        if (sortKey === "created_at") { aVal = new Date(aVal).getTime().toString(); bVal = new Date(bVal).getTime().toString(); }
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return sortDir === "asc" ? comparison : -comparison;
      });
    }
    return result;
  }, [applications, search, sortKey, sortDir]);

  const toggleSelection = (id: string) => setSelectedItems(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleAll = () => setSelectedItems(selectedItems.size === filteredAndSorted.length ? new Set() : new Set(filteredAndSorted.map(a => a.id)));

  const handleAdd = async () => {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("developer_applications").insert({
        name: form.name, email: form.email,
        skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
        message: form.message || null,
        ...(form.created_at ? { created_at: form.created_at.toISOString() } : {}),
      });
      if (error) throw error;
      toast.success("Entry added");
      setAddingEntry(false);
      setForm({ name: "", email: "", skills: "", message: "", created_at: null });
      onRefresh();
    } catch (error: any) { toast.error(error.message || "Failed to add"); }
    finally { setSaving(false); }
  };

  const handleEdit = (entry: DeveloperApplication) => {
    setEditingEntry(entry);
    setEditForm({ ...entry, skills: entry.skills?.join(", ") || "" });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("developer_applications").update({
        name: editForm.name, email: editForm.email,
        skills: editForm.skills ? editForm.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        message: editForm.message || null,
      }).eq("id", editingEntry.id);
      if (error) throw error;
      toast.success("Entry updated");
      setEditingEntry(null);
      onRefresh();
    } catch (error: any) { toast.error(error.message || "Failed to update"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingEntry) return;
    try {
      const { error } = await supabase.from("developer_applications").delete().eq("id", deletingEntry.id);
      if (error) throw error;
      toast.success("Entry deleted");
      setDeletingEntry(null);
      onRefresh();
    } catch (error: any) { toast.error(error.message || "Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    setBulkDeleting(true);
    try {
      const { error } = await supabase.from("developer_applications").delete().in("id", Array.from(selectedItems));
      if (error) throw error;
      toast.success(`Deleted ${selectedItems.size} entries`);
      setBulkDeleteOpen(false);
      setSelectedItems(new Set());
      onRefresh();
    } catch (error: any) { toast.error(error.message || "Failed to delete"); }
    finally { setBulkDeleting(false); }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { result.push(current); current = ""; }
      else current += char;
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
        const lines = text.split("\n").filter(line => line.trim());
        if (lines.length < 2) { toast.error("CSV file is empty"); return; }
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
        const records = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const record: any = {};
          headers.forEach((h, i) => {
            let value = values[i]?.trim().replace(/^"|"$/g, "") || null;
            if (h === "skills" && value) record[h] = value.split(";").map(s => s.trim()).filter(Boolean);
            else record[h] = value;
          });
          return record;
        }).filter(r => r.name && r.email);
        if (records.length === 0) { toast.error("No valid records found"); return; }
        const { error } = await supabase.from("developer_applications").insert(records.map(r => ({
          name: r.name, email: r.email, skills: r.skills || null, message: r.message || null,
          ...(r.created_at ? { created_at: new Date(r.created_at).toISOString() } : {}),
        })));
        if (error) throw error;
        toast.success(`Imported ${records.length} entries`);
        onRefresh();
      } catch (error: any) { toast.error(error.message || "Import failed"); }
      finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    if (filteredAndSorted.length === 0) return;
    const headers = ["name", "email", "skills", "message", "created_at"];
    const csvContent = [headers.join(","), ...filteredAndSorted.map(row =>
      headers.map(h => {
        const v = row[h as keyof DeveloperApplication];
        if (Array.isArray(v)) return `"${v.join("; ")}"`;
        if (typeof v === "string" && (v.includes(",") || v.includes('"'))) return `"${v.replace(/"/g, '""')}"`;
        return v ?? "";
      }).join(",")
    )].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `developers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const downloadTemplate = () => {
    const csv = ['name,email,skills,message,created_at', 'Alex Dev,alex@example.com,"React; TypeScript",Excited to contribute,2024-01-10'].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "developers_template.csv";
    link.click();
    toast.success("Template downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Developer Applications</h2>
          <p className="text-sm text-muted-foreground">{applications.length} total applications</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setAddingEntry(true)}><Plus className="h-4 w-4 mr-2" /> Add</Button>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVImport} className="hidden" />
          <Button variant="outline" size="sm" onClick={downloadTemplate}><FileDown className="h-4 w-4 mr-2" /> Template</Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}><Upload className="h-4 w-4 mr-2" /> {importing ? "..." : "Import"}</Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}><Download className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedItems.size} selected</span>
                <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>Clear</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10"><Checkbox checked={filteredAndSorted.length > 0 && selectedItems.size === filteredAndSorted.length} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}><div className="flex items-center">Name {getSortIcon(sortKey === "name", sortDir)}</div></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("email")}><div className="flex items-center">Email {getSortIcon(sortKey === "email", sortDir)}</div></TableHead>
                  <TableHead className="hidden md:table-cell">Skills</TableHead>
                  <TableHead className="hidden lg:table-cell">Message</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}><div className="flex items-center">Date {getSortIcon(sortKey === "created_at", sortDir)}</div></TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
                ) : (
                  filteredAndSorted.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell><Checkbox checked={selectedItems.has(entry.id)} onCheckedChange={() => toggleSelection(entry.id)} /></TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {entry.skills?.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {(entry.skills?.length ?? 0) > 3 && <Badge variant="outline" className="text-xs">+{entry.skills!.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{entry.message || "-"}</TableCell>
                      <TableCell>{format(new Date(entry.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(entry)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingEntry(entry)}><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={addingEntry} onOpenChange={setAddingEntry}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Developer Application</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Skills (comma-separated)</Label><Input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, TypeScript, Node.js" /></div>
            <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.created_at && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{form.created_at ? format(form.created_at, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.created_at || undefined} onSelect={d => setForm(f => ({ ...f, created_at: d || null }))} /></PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingEntry(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? "Adding..." : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Application</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={editForm.email || ""} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Skills (comma-separated)</Label><Input value={editForm.skills || ""} onChange={e => setEditForm((f: any) => ({ ...f, skills: e.target.value }))} /></div>
            <div><Label>Message</Label><Textarea value={editForm.message || ""} onChange={e => setEditForm((f: any) => ({ ...f, message: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Application</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {deletingEntry?.name}?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {selectedItems.size} Applications</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{bulkDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
