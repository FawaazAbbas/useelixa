import { useState } from "react";
import { Download, ZoomIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GeneratedImageProps {
  imageUrl: string;
  prompt: string;
  className?: string;
}

export const GeneratedImage = ({
  imageUrl,
  prompt,
  className,
}: GeneratedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (isError) {
    return (
      <div className={cn(
        "rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground",
        className
      )}>
        Failed to load image
      </div>
    );
  }

  return (
    <>
      <div className={cn("relative group", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={prompt}
          className={cn(
            "rounded-lg max-w-full h-auto transition-opacity",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setIsError(true);
          }}
        />
        
        {/* Hover actions */}
        {!isLoading && (
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsZoomed(true)}
              title="View full size"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Prompt caption */}
        <p className="mt-2 text-xs text-muted-foreground italic truncate">
          "{prompt}"
        </p>
      </div>

      {/* Zoom dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <img
              src={imageUrl}
              alt={prompt}
              className="max-w-full max-h-[70vh] rounded-lg"
            />
            <p className="text-sm text-muted-foreground text-center">
              "{prompt}"
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
