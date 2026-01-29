import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PDFExportOptions } from "@/hooks/usePDFExport";

interface PDFExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: PDFExportOptions) => void;
  isExporting: boolean;
  progress: number;
  currentSlideIndex: number;
  totalSlides: number;
}

export const PDFExportModal = ({
  open,
  onOpenChange,
  onExport,
  isExporting,
  progress,
  currentSlideIndex,
  totalSlides,
}: PDFExportModalProps) => {
  const [quality, setQuality] = useState<"standard" | "high" | "ultra">("high");
  const [includeSlideNumbers, setIncludeSlideNumbers] = useState(false);
  const [filename, setFilename] = useState("ELIXA-Pitch-Deck");

  const handleExport = () => {
    onExport({
      quality,
      includeSlideNumbers,
      filename,
    });
  };

  const qualityOptions = [
    { value: "standard" as const, label: "Standard", desc: "1920×1080 (~5MB)" },
    { value: "high" as const, label: "High", desc: "3840×2160 (~15MB)" },
    { value: "ultra" as const, label: "Ultra", desc: "5760×3240 (~30MB)" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-primary" />
            Export to PDF
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Generate a high-quality PDF with proper 16:9 aspect ratio slides.
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-slate-900">
                Exporting slides...
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Processing slide {currentSlideIndex + 1} of {totalSlides}
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-slate-500">
                {progress}% complete
              </p>
            </div>
          </div>
        ) : progress === 100 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium text-slate-900">
              Export Complete!
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Your PDF has been downloaded.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename" className="text-slate-700">
                Filename
              </Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="bg-white border-slate-200"
              />
            </div>

            {/* Quality Selection */}
            <div className="space-y-3">
              <Label className="text-slate-700">Quality</Label>
              <div className="grid grid-cols-3 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuality(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      quality === option.value
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p
                      className={`font-medium text-sm ${
                        quality === option.value
                          ? "text-primary"
                          : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Numbers Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="slide-numbers"
                  className="text-slate-700 cursor-pointer"
                >
                  Include slide numbers
                </Label>
                <p className="text-xs text-slate-500">
                  Show "1 / 13" at bottom right
                </p>
              </div>
              <Switch
                id="slide-numbers"
                checked={includeSlideNumbers}
                onCheckedChange={setIncludeSlideNumbers}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {!isExporting && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-200"
              >
                Cancel
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
