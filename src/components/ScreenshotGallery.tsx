import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScreenshotGalleryProps {
  screenshots: string[];
  agentName: string;
}

export const ScreenshotGallery = ({ screenshots, agentName }: ScreenshotGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!screenshots || screenshots.length === 0) return null;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-video rounded-xl overflow-hidden border border-border/50 bg-muted cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={screenshots[selectedIndex]}
            alt={`${agentName} screenshot ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
              Click to enlarge
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              <img
                src={screenshot}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedIndex + 1} / {screenshots.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black/95 border-0">
          <div className="relative">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            
            <div className="relative aspect-video">
              <img
                src={screenshots[selectedIndex]}
                alt={`${agentName} screenshot ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {screenshots.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
