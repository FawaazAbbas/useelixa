import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

export interface PDFExportOptions {
  quality: "standard" | "high" | "ultra";
  includeSlideNumbers: boolean;
  filename: string;
}

const QUALITY_SCALES = {
  standard: 1,
  high: 2,
  ultra: 3,
};

// 16:9 aspect ratio dimensions
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

// PDF dimensions in mm (16:9 at 96 DPI)
const PDF_WIDTH = 338.67;
const PDF_HEIGHT = 190.5;

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const waitForImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });
    await Promise.all(promises);
  };

  const captureSlide = async (
    slideElement: HTMLElement,
    scale: number
  ): Promise<HTMLCanvasElement> => {
    // Wait for all images to load
    await waitForImages(slideElement);

    // Capture with html2canvas
    const canvas = await html2canvas(slideElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      logging: false,
    });

    return canvas;
  };

  const exportToPDF = useCallback(
    async (
      options: PDFExportOptions,
      getSlideElements: () => HTMLElement[]
    ) => {
      setIsExporting(true);
      setProgress(0);
      setCurrentSlideIndex(0);

      try {
        const scale = QUALITY_SCALES[options.quality];
        const slides = getSlideElements();
        const totalSlides = slides.length;

        if (totalSlides === 0) {
          throw new Error("No slides found to export");
        }

        // Create PDF with landscape orientation and custom size
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [PDF_WIDTH, PDF_HEIGHT],
        });

        // Add metadata
        pdf.setProperties({
          title: "ELIXA - Pre-Seed Deck",
          author: "ELIXA",
          creator: "ELIXA Pitch Deck",
        });

        for (let i = 0; i < totalSlides; i++) {
          setCurrentSlideIndex(i);
          setProgress(Math.round(((i + 0.5) / totalSlides) * 100));

          const slideElement = slides[i];
          const canvas = await captureSlide(slideElement, scale);

          // Convert canvas to image
          const imgData = canvas.toDataURL("image/png", 1.0);

          // Add page (except for first slide)
          if (i > 0) {
            pdf.addPage([PDF_WIDTH, PDF_HEIGHT], "landscape");
          }

          // Add image to PDF
          pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH, PDF_HEIGHT);

          // Add slide number if requested
          if (options.includeSlideNumbers) {
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(
              `${i + 1} / ${totalSlides}`,
              PDF_WIDTH - 15,
              PDF_HEIGHT - 5
            );
          }

          setProgress(Math.round(((i + 1) / totalSlides) * 100));
        }

        // Save the PDF
        pdf.save(`${options.filename}.pdf`);

        toast({
          title: "PDF Exported Successfully",
          description: `${totalSlides} slides exported to ${options.filename}.pdf`,
        });
      } catch (error) {
        console.error("PDF export error:", error);
        toast({
          title: "Export Failed",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
        setProgress(0);
        setCurrentSlideIndex(0);
      }
    },
    []
  );

  return {
    exportToPDF,
    isExporting,
    progress,
    currentSlideIndex,
  };
};
