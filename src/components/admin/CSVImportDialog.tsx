import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, XCircle, Upload, ArrowRight, FileSpreadsheet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: Set<string>;
  onSuccess: () => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  name: string | null;
  email: string | null;
  company: string | null;
  use_case: string | null;
  source: string | null;
  created_at: string | null;
}

type ImportMode = "skip" | "update";

const DB_COLUMNS = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "company", label: "Company", required: false },
  { key: "use_case", label: "Use Case", required: false },
  { key: "source", label: "Source", required: false },
  { key: "created_at", label: "Created At", required: false },
];

export const CSVImportDialog = ({
  open,
  onOpenChange,
  existingEmails,
  onSuccess,
}: CSVImportDialogProps) => {
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: null,
    email: null,
    company: null,
    use_case: null,
    source: null,
    created_at: null,
  });
  const [importMode, setImportMode] = useState<ImportMode>("skip");
  const [importing, setImporting] = useState(false);

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
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error("CSV file needs at least a header row and one data row");
        return;
      }

      const headers = parseCSVLine(lines[0]).map((h) =>
        h.replace(/^"|"$/g, "").trim()
      );
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: CSVRow = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx]?.replace(/^"|"$/g, "").trim() || "";
        });
        rows.push(row);
      }

      setCsvHeaders(headers);
      setCsvData(rows);

      // Auto-map columns based on common names
      const autoMapping: ColumnMapping = {
        name: null,
        email: null,
        company: null,
        use_case: null,
        source: null,
        created_at: null,
      };

      headers.forEach((h) => {
        const lower = h.toLowerCase();
        if (lower === "name" || lower === "full_name" || lower === "fullname") {
          autoMapping.name = h;
        } else if (lower === "email" || lower === "email_address") {
          autoMapping.email = h;
        } else if (lower === "company" || lower === "organization" || lower === "org") {
          autoMapping.company = h;
        } else if (lower === "use_case" || lower === "usecase" || lower === "use case") {
          autoMapping.use_case = h;
        } else if (lower === "source") {
          autoMapping.source = h;
        } else if (lower === "created_at" || lower === "date" || lower === "signup_date") {
          autoMapping.created_at = h;
        }
      });

      setColumnMapping(autoMapping);
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const isValidMapping = useMemo(() => {
    return columnMapping.name && columnMapping.email;
  }, [columnMapping]);

  const mappedData = useMemo(() => {
    if (!isValidMapping) return [];

    return csvData
      .map((row) => ({
        name: columnMapping.name ? row[columnMapping.name] : "",
        email: columnMapping.email ? row[columnMapping.email]?.toLowerCase().trim() : "",
        company: columnMapping.company ? row[columnMapping.company] || null : null,
        use_case: columnMapping.use_case ? row[columnMapping.use_case] || null : null,
        source: columnMapping.source ? row[columnMapping.source] || null : null,
        created_at: columnMapping.created_at ? row[columnMapping.created_at] || null : null,
      }))
      .filter((row) => row.name && row.email);
  }, [csvData, columnMapping, isValidMapping]);

  const { newRecords, duplicateRecords, invalidRecords } = useMemo(() => {
    const newRecs: typeof mappedData = [];
    const dupRecs: typeof mappedData = [];
    const invalidRecs: typeof mappedData = [];

    mappedData.forEach((row) => {
      // Basic email validation
      if (!row.email || !row.email.includes("@")) {
        invalidRecs.push(row);
      } else if (existingEmails.has(row.email.toLowerCase())) {
        dupRecs.push(row);
      } else {
        newRecs.push(row);
      }
    });

    return { newRecords: newRecs, duplicateRecords: dupRecs, invalidRecords: invalidRecs };
  }, [mappedData, existingEmails]);

  const handleImport = async () => {
    if (newRecords.length === 0 && (importMode === "skip" || duplicateRecords.length === 0)) {
      toast.error("No records to import");
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Insert new records
      if (newRecords.length > 0) {
        const { error } = await supabase.from("waitlist_signups").insert(
          newRecords.map((r) => ({
            name: r.name,
            email: r.email,
            company: r.company,
            use_case: r.use_case,
            source: r.source || "IMPORT",
            ...(r.created_at ? { created_at: new Date(r.created_at).toISOString() } : {}),
          }))
        );
        if (error) throw error;
        successCount += newRecords.length;
      }

      // Update duplicates if mode is update
      if (importMode === "update" && duplicateRecords.length > 0) {
        for (const record of duplicateRecords) {
          const updateData: any = {};
          if (record.name) updateData.name = record.name;
          if (record.company) updateData.company = record.company;
          if (record.use_case) updateData.use_case = record.use_case;
          if (record.source) updateData.source = record.source;

          const { error } = await supabase
            .from("waitlist_signups")
            .update(updateData)
            .eq("email", record.email);

          if (error) {
            errorCount++;
            console.error(`Failed to update ${record.email}:`, error);
          } else {
            successCount++;
          }
        }
      }

      toast.success(
        `Imported ${successCount} records${errorCount > 0 ? `, ${errorCount} failed` : ""}`
      );
      handleReset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({
      name: null,
      email: null,
      company: null,
      use_case: null,
      source: null,
      created_at: null,
    });
    setImportMode("skip");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleReset}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Safe CSV Import
          </DialogTitle>
          <DialogDescription>
            Import contacts safely with column mapping preview and duplicate detection
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              step === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-background text-foreground flex items-center justify-center text-xs">1</span>
            Upload
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              step === "mapping" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-background text-foreground flex items-center justify-center text-xs">2</span>
            Map Columns
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              step === "preview" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-background text-foreground flex items-center justify-center text-xs">3</span>
            Preview & Confirm
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {step === "upload" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ position: "absolute" }}
                />
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Your file should include:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A header row with column names</li>
                  <li>At minimum: name and email columns</li>
                  <li>Optional: company, use_case, source, created_at</li>
                </ul>
              </div>
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-3">
                  Found {csvData.length} rows with {csvHeaders.length} columns
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DB_COLUMNS.map((col) => (
                    <div key={col.key} className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        {col.label}
                        {col.required && <span className="text-destructive">*</span>}
                      </Label>
                      <Select
                        value={columnMapping[col.key as keyof ColumnMapping] || "none"}
                        onValueChange={(v) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            [col.key]: v === "none" ? null : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Not mapped --</SelectItem>
                          {csvHeaders.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview first 3 rows */}
              <div className="rounded-lg border">
                <p className="text-sm font-medium p-3 border-b bg-muted/30">
                  Preview (first 3 rows)
                </p>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {DB_COLUMNS.map((col) => (
                          <TableHead key={col.key} className="text-xs">
                            {col.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 3).map((row, idx) => (
                        <TableRow key={idx}>
                          {DB_COLUMNS.map((col) => {
                            const mappedCol = columnMapping[col.key as keyof ColumnMapping];
                            const value = mappedCol ? row[mappedCol] : "";
                            return (
                              <TableCell key={col.key} className="text-xs">
                                {value || (
                                  <span className="text-muted-foreground italic">empty</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 bg-emerald-500/10 border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">New Records</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{newRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Will be added</p>
                </div>
                <div className="rounded-lg border p-3 bg-amber-500/10 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Duplicates</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{duplicateRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Already in waitlist</p>
                </div>
                <div className="rounded-lg border p-3 bg-red-500/10 border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Invalid</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{invalidRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Will be skipped</p>
                </div>
              </div>

              {/* Duplicate Handling */}
              {duplicateRecords.length > 0 && (
                <div className="rounded-lg border p-4 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">How to handle duplicates?</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={importMode === "skip" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImportMode("skip")}
                    >
                      Skip duplicates
                    </Button>
                    <Button
                      variant={importMode === "update" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImportMode("update")}
                    >
                      Update existing records
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {importMode === "skip"
                      ? "Duplicate emails will be ignored - no existing data will be changed"
                      : "Existing records will be updated with new values (email stays the same)"}
                  </p>
                </div>
              )}

              {/* Data Preview */}
              <div className="rounded-lg border">
                <p className="text-sm font-medium p-3 border-b bg-muted/30">
                  Records to Import
                </p>
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newRecords.map((row, idx) => (
                        <TableRow key={`new-${idx}`}>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.company || "-"}</TableCell>
                          <TableCell>{row.source || "IMPORT"}</TableCell>
                        </TableRow>
                      ))}
                      {duplicateRecords.map((row, idx) => (
                        <TableRow key={`dup-${idx}`} className="opacity-60">
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {importMode === "skip" ? "Skip" : "Update"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.company || "-"}</TableCell>
                          <TableCell>{row.source || "IMPORT"}</TableCell>
                        </TableRow>
                      ))}
                      {invalidRecords.map((row, idx) => (
                        <TableRow key={`inv-${idx}`} className="opacity-40 line-through">
                          <TableCell>
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Invalid
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email || "(missing)"}</TableCell>
                          <TableCell>{row.company || "-"}</TableCell>
                          <TableCell>{row.source || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("preview")} disabled={!isValidMapping}>
                Preview Import
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || (newRecords.length === 0 && importMode === "skip")}
              >
                {importing ? "Importing..." : `Import ${importMode === "skip" ? newRecords.length : newRecords.length + duplicateRecords.length} Records`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
