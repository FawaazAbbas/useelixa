import { useState, useCallback, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFExportModal } from "./PDFExportModal";
import { usePDFExport, PDFExportOptions } from "@/hooks/usePDFExport";
import { usePDFExportContext } from "./PDFExportContext";

// Slide components for rendering
import { TitleSlide } from "./slides/TitleSlide";
import { ProblemSlide } from "./slides/ProblemSlide";
import { SolutionIntroSlide } from "./slides/SolutionIntroSlide";
import { OurSolutionSlide } from "./slides/OurSolutionSlide";
import { ProductSlide } from "./slides/ProductSlide";
import { MarketSlide } from "./slides/MarketSlide";
import { ShopifyDeepDiveSlide } from "./slides/ShopifyDeepDiveSlide";
import { TractionSlide } from "./slides/TractionSlide";
import { CompetitionSlide } from "./slides/CompetitionSlide";
import { PricingSlide } from "./slides/PricingSlide";
import { RevenueSlide } from "./slides/RevenueSlide";
import { GTMSlide } from "./slides/GTMSlide";
import { TeamAskSlide } from "./slides/TeamAskSlide";
import { createRoot } from "react-dom/client";
import { PDFExportProvider } from "./PDFExportContext";

const SLIDE_COMPONENTS = [
  TitleSlide,
  ProblemSlide,
  SolutionIntroSlide,
  OurSolutionSlide,
  ProductSlide,
  MarketSlide,
  ShopifyDeepDiveSlide,
  TractionSlide,
  CompetitionSlide,
  PricingSlide,
  RevenueSlide,
  GTMSlide,
  TeamAskSlide,
];

export const PDFExportButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { exportToPDF, isExporting, progress, currentSlideIndex } =
    usePDFExport();
  const { setIsExporting } = usePDFExportContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderSlideForExport = useCallback(
    async (SlideComponent: React.ComponentType): Promise<HTMLElement> => {
      return new Promise((resolve) => {
        // Create off-screen container
        const container = document.createElement("div");
        container.style.cssText = `
          position: fixed;
          left: -9999px;
          top: 0;
          width: 1920px;
          height: 1080px;
          overflow: hidden;
          background: white;
        `;
        document.body.appendChild(container);

        // Create a wrapper div that will hold the slide
        const slideWrapper = document.createElement("div");
        slideWrapper.className = "pitch-deck-wrapper pitch-deck-light";
        slideWrapper.style.cssText = `
          width: 1920px;
          height: 1080px;
          overflow: hidden;
        `;
        container.appendChild(slideWrapper);

        // Render the slide component with export context
        const root = createRoot(slideWrapper);
        root.render(
          <PDFExportProvider>
            <ExportModeWrapper>
              <SlideComponent />
            </ExportModeWrapper>
          </PDFExportProvider>
        );

        // Wait for render and images
        setTimeout(() => {
          // Override the section styles to fit exactly
          const section = slideWrapper.querySelector("section");
          if (section) {
            section.style.cssText = `
              width: 1920px !important;
              height: 1080px !important;
              min-height: 1080px !important;
              max-height: 1080px !important;
              position: relative !important;
              overflow: hidden !important;
            `;
          }

          resolve(container);
        }, 500);
      });
    },
    []
  );

  const handleExport = useCallback(
    async (options: PDFExportOptions) => {
      setIsExporting(true);

      // Collect all slide elements by rendering them off-screen
      const slideContainers: HTMLElement[] = [];

      try {
        for (const SlideComponent of SLIDE_COMPONENTS) {
          const container = await renderSlideForExport(SlideComponent);
          slideContainers.push(container);
        }

        // Get the actual slide elements
        const getSlideElements = () => {
          return slideContainers.map((container) => {
            const section = container.querySelector("section");
            return section || container;
          }) as HTMLElement[];
        };

        await exportToPDF(options, getSlideElements);
      } finally {
        // Cleanup
        slideContainers.forEach((container) => {
          document.body.removeChild(container);
        });
        setIsExporting(false);
        setModalOpen(false);
      }
    },
    [exportToPDF, renderSlideForExport, setIsExporting]
  );

  return (
    <>
      <div className="fixed top-6 right-6 z-50 print:hidden">
        <Button
          onClick={() => setModalOpen(true)}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 shadow-lg gap-2"
          disabled={isExporting}
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <PDFExportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onExport={handleExport}
        isExporting={isExporting}
        progress={progress}
        currentSlideIndex={currentSlideIndex}
        totalSlides={SLIDE_COMPONENTS.length}
      />
    </>
  );
};

// Wrapper that sets export mode context
const ExportModeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setIsExporting } = usePDFExportContext();

  // Use useLayoutEffect for synchronous state update before render
  useLayoutEffect(() => {
    setIsExporting(true);
    return () => setIsExporting(false);
  }, [setIsExporting]);

  return <>{children}</>;
};
