import { createContext, useContext, useState, ReactNode } from "react";

interface PDFExportContextType {
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  currentSlide: number;
  setCurrentSlide: (value: number) => void;
}

const PDFExportContext = createContext<PDFExportContextType>({
  isExporting: false,
  setIsExporting: () => {},
  currentSlide: 0,
  setCurrentSlide: () => {},
});

export const usePDFExportContext = () => useContext(PDFExportContext);

interface PDFExportProviderProps {
  children: ReactNode;
}

export const PDFExportProvider = ({ children }: PDFExportProviderProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <PDFExportContext.Provider
      value={{
        isExporting,
        setIsExporting,
        currentSlide,
        setCurrentSlide,
      }}
    >
      {children}
    </PDFExportContext.Provider>
  );
};
