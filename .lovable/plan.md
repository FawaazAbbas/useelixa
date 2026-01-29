
# PDF Export Feature - Proper Slides with Correct Aspect Ratio

## Overview

Implement a high-quality PDF export feature that generates presentation-style slides with correct 16:9 aspect ratio, proper page breaks, and professional output - not simple screenshots.

---

## Approach: Hybrid html2canvas + jsPDF

After researching the options, the best approach for this use case is:

1. **html2canvas** - Captures each slide as a high-resolution image
2. **jsPDF** - Creates a PDF with proper page dimensions (16:9 landscape)
3. **Export Mode** - Special rendering mode that forces correct aspect ratio

### Why Not Other Approaches?

| Approach | Pros | Cons |
|----------|------|------|
| Browser Print | Simple | Poor quality, no aspect ratio control |
| @react-pdf/renderer | Native PDF | Requires rewriting all slides in PDF components |
| pdfmake | Good quality | Same - requires complete rewrite |
| **html2canvas + jsPDF** | Uses existing slides | Best balance of quality and effort |

---

## Architecture

```text
+------------------+     +-------------------+     +--------------+
|   PitchDeck.tsx  | --> | PDFExportButton   | --> | Export Modal |
|   (existing)     |     | (new component)   |     | with options |
+------------------+     +-------------------+     +--------------+
                                   |
                                   v
                         +-------------------+
                         | usePDFExport hook |
                         | (export logic)    |
                         +-------------------+
                                   |
                    +--------------+--------------+
                    |              |              |
                    v              v              v
              +---------+   +-----------+   +----------+
              | Prepare |   | Capture   |   | Generate |
              | Slides  |   | Each Slide|   | PDF      |
              +---------+   +-----------+   +----------+
```

---

## Implementation Details

### 1. New Dependencies

```json
{
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1"
}
```

### 2. PDF Export Hook (`src/hooks/usePDFExport.ts`)

Core logic for the export process:

```typescript
export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportToPDF = async (options: PDFExportOptions) => {
    // 1. Create hidden container with fixed 16:9 dimensions
    // 2. Clone and render each slide into container
    // 3. Capture with html2canvas at high resolution
    // 4. Add to jsPDF with landscape orientation
    // 5. Repeat for all 13 slides
    // 6. Save PDF
  };

  return { exportToPDF, isExporting, progress };
};
```

**Key Configuration:**
- Slide dimensions: 1920x1080 (16:9 HD)
- PDF page size: Custom landscape (338.67mm x 190.5mm)
- html2canvas scale: 2x for high DPI
- Image format: PNG for quality

### 3. Export Container Component

A hidden container that renders slides at exact 16:9 dimensions:

```typescript
const PDFExportContainer = forwardRef<HTMLDivElement, Props>(
  ({ children, slideIndex }, ref) => (
    <div
      ref={ref}
      style={{
        width: 1920,
        height: 1080,
        position: 'fixed',
        left: -9999,
        top: 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
);
```

### 4. Slide Wrapper for Export Mode

Each slide needs to know when it's being exported to:
- Disable animations (freeze at final state)
- Force exact dimensions
- Hide scroll indicators

```typescript
// Context for export mode
const PDFExportContext = createContext({ isExporting: false });

// In each slide:
const { isExporting } = usePDFExportContext();
// Disable framer-motion animations when isExporting = true
```

### 5. Export Button Component (`src/components/pitch-deck/PDFExportButton.tsx`)

Floating button that appears on the pitch deck:

```typescript
export const PDFExportButton = () => {
  const { exportToPDF, isExporting, progress } = usePDFExport();

  return (
    <div className="fixed top-6 right-20 z-50 print:hidden">
      <Button onClick={() => exportToPDF()}>
        {isExporting ? (
          <span>Exporting... {progress}%</span>
        ) : (
          <><Download /> Export PDF</>
        )}
      </Button>
    </div>
  );
};
```

### 6. Export Options Modal

Allow users to configure:
- Quality level (Standard / High / Ultra)
- Include slide numbers (Yes / No)
- Filename

```typescript
interface PDFExportOptions {
  quality: 'standard' | 'high' | 'ultra'; // 1x, 2x, 3x scale
  includeSlideNumbers: boolean;
  filename: string;
}
```

### 7. Handling Animations

The challenge: Framer Motion animations need to be "frozen" at their final state during export.

**Solution:** Add an `isExporting` prop/context that slides check:

```typescript
// slideAnimations.ts - add export variants
export const getExportVariants = (isExporting: boolean): Variants => {
  if (isExporting) {
    return {
      hidden: { opacity: 1, y: 0 }, // Already visible
      visible: { opacity: 1, y: 0 },
    };
  }
  return fadeInUp; // Normal animation
};
```

### 8. Handling Images and Assets

- All local images (mascot, logos) will be captured correctly
- External images may need CORS handling
- Assets already use local paths (`/logos/...`) which is good

---

## Export Process Flow

```text
1. User clicks "Export PDF"
2. Show progress modal
3. Create off-screen container (1920x1080)
4. For each slide (1-13):
   a. Render slide in container with isExporting=true
   b. Wait for images to load
   c. Capture with html2canvas
   d. Add page to jsPDF
   e. Update progress
5. Save PDF file
6. Close modal
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/usePDFExport.ts` | Export logic and state management |
| `src/components/pitch-deck/PDFExportButton.tsx` | Export trigger UI |
| `src/components/pitch-deck/PDFExportModal.tsx` | Progress and options dialog |
| `src/components/pitch-deck/PDFExportContext.tsx` | Context for export mode |

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add html2canvas, jspdf dependencies |
| `src/pages/PitchDeck.tsx` | Add PDFExportButton and Context provider |
| `src/components/pitch-deck/slideAnimations.ts` | Add export-safe variants |
| All slide components | Use export context to disable animations |

---

## Technical Considerations

### Quality vs File Size

| Quality | Scale | ~File Size | Resolution |
|---------|-------|------------|------------|
| Standard | 1x | ~5MB | 1920x1080 |
| High | 2x | ~15MB | 3840x2160 |
| Ultra | 3x | ~30MB | 5760x3240 |

### Browser Limitations

- html2canvas has a ~16384px canvas limit in some browsers
- Will use 2x scale by default (safe for all browsers)
- Option for ultra quality for modern browsers

### Performance

- Export takes ~10-20 seconds for 13 slides
- Progress bar shows real-time feedback
- Non-blocking (async operation)

---

## Slide-Specific Handling

Some slides need special attention:

1. **Animated Counters** (MarketSlide, TractionSlide)
   - Force to final value during export

2. **Positioning Matrix** (CompetitionSlide)
   - Ensure bubbles are at final positions

3. **Mascot with float animation** (TitleSlide)
   - Freeze at center position

4. **Gradients and blurs**
   - html2canvas handles these well with `useCORS: true`

---

## PDF Output Specifications

- **Format**: PDF/A (archival quality)
- **Page Size**: 338.67mm x 190.5mm (16:9 at 96 DPI equivalent)
- **Orientation**: Landscape
- **Color**: RGB (for screen viewing)
- **Compression**: Medium (balance quality/size)
- **Metadata**: Title, Author, Creation date

---

## User Experience

1. Button visible but unobtrusive (top-right corner)
2. Click shows options modal
3. Select quality and options
4. Click "Export"
5. See progress with slide thumbnails
6. File downloads automatically
7. Toast notification on completion

