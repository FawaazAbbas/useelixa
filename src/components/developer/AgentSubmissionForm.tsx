import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";

interface AgentSubmissionFormProps {
  onSubmit: (agent: Partial<AgentSubmission>) => Promise<any>;
  userId?: string;
}

const CATEGORIES = ["productivity", "sales", "research", "customer-support", "marketing", "engineering", "hr", "finance", "other"];

const AVAILABLE_TOOLS = [
  "gmail", "google-calendar", "google-sheets", "slack", "notion",
  "shopify", "stripe", "hubspot", "jira", "github",
  "salesforce", "asana", "clickup", "zendesk", "freshdesk",
];

export const AgentSubmissionForm = ({ onSubmit, userId }: AgentSubmissionFormProps) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");

  // Step 2: Configuration
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Step 3: Assets
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const uploadIcon = async (): Promise<string | null> => {
    if (!iconFile || !userId) return null;
    const ext = iconFile.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("agent-assets").upload(path, iconFile);
    if (error) return null;
    const { data } = supabase.storage.from("agent-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setSaving(true);
    let iconUrl: string | null = null;
    if (iconFile) {
      iconUrl = await uploadIcon();
    }

    await onSubmit({
      name,
      description,
      category,
      version,
      system_prompt: systemPrompt,
      allowed_tools: selectedTools.length > 0 ? selectedTools : null,
      icon_url: iconUrl,
    });

    // Reset form
    setStep(1);
    setName("");
    setDescription("");
    setCategory("");
    setVersion("1.0.0");
    setSystemPrompt("");
    setSelectedTools([]);
    setIconFile(null);
    setIconPreview(null);
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Agent</CardTitle>
        <CardDescription>Step {step} of 4</CardDescription>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My AI Agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">Description</Label>
              <Textarea id="agent-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your agent do?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-version">Version</Label>
              <Input id="agent-version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea id="system-prompt" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are a helpful assistant that..." rows={6} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Allowed Tools</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TOOLS.map((tool) => (
                  <Badge
                    key={tool}
                    variant={selectedTools.includes(tool) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTool(tool)}
                  >
                    {tool}
                    {selectedTools.includes(tool) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <Label>Agent Icon</Label>
            <Input type="file" accept="image/*" onChange={handleIconChange} />
            {iconPreview && (
              <img src={iconPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover mt-2" />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Review your agent</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span>
              <span className="text-muted-foreground">Category:</span><span>{category || "None"}</span>
              <span className="text-muted-foreground">Version:</span><span>{version}</span>
              <span className="text-muted-foreground">Tools:</span><span>{selectedTools.length > 0 ? selectedTools.join(", ") : "None"}</span>
              <span className="text-muted-foreground">Icon:</span><span>{iconFile ? iconFile.name : "None"}</span>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Create Agent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
