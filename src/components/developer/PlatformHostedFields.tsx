import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface PlatformHostedFieldsProps {
  codeFile: File | null;
  onCodeFileChange: (file: File | null) => void;
  requirements: string;
  onRequirementsChange: (val: string) => void;
  entryFunction: string;
  onEntryFunctionChange: (val: string) => void;
  runtime: string;
  onRuntimeChange: (val: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (val: string) => void;
  selectedTools: string[];
  onToggleTool: (tool: string) => void;
  availableTools: string[];
}

export const PlatformHostedFields = ({
  codeFile, onCodeFileChange, requirements, onRequirementsChange,
  entryFunction, onEntryFunctionChange, runtime, onRuntimeChange,
  systemPrompt, onSystemPromptChange, selectedTools, onToggleTool, availableTools,
}: PlatformHostedFieldsProps) => (
  <>
    <div className="space-y-2">
      <Label>Runtime</Label>
      <Select value={runtime} onValueChange={onRuntimeChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="typescript">TypeScript</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Agent Code File (.py or .zip) *</Label>
      <Input
        type="file"
        accept=".py,.zip"
        onChange={(e) => onCodeFileChange(e.target.files?.[0] || null)}
      />
      {codeFile && <p className="text-xs text-muted-foreground">Selected: {codeFile.name}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="requirements">Requirements (paste requirements.txt)</Label>
      <Textarea
        id="requirements"
        value={requirements}
        onChange={(e) => onRequirementsChange(e.target.value)}
        placeholder="requests==2.31.0&#10;openai>=1.0"
        rows={4}
        className="font-mono text-sm"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="entry-fn">Entry Function</Label>
      <Input
        id="entry-fn"
        value={entryFunction}
        onChange={(e) => onEntryFunctionChange(e.target.value)}
        placeholder="handle"
      />
      <p className="text-xs text-muted-foreground">The function we'll call in your code. Defaults to "handle".</p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="system-prompt">System Prompt (optional)</Label>
      <Textarea
        id="system-prompt"
        value={systemPrompt}
        onChange={(e) => onSystemPromptChange(e.target.value)}
        placeholder="You are a helpful assistant that..."
        rows={4}
        className="font-mono text-sm"
      />
    </div>
    <div className="space-y-2">
      <Label>Allowed Tools</Label>
      <div className="flex flex-wrap gap-2">
        {availableTools.map((tool) => (
          <Badge
            key={tool}
            variant={selectedTools.includes(tool) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggleTool(tool)}
          >
            {tool}
            {selectedTools.includes(tool) && <X className="h-3 w-3 ml-1" />}
          </Badge>
        ))}
      </div>
    </div>
  </>
);
