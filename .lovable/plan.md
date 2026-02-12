

## Fix Agent Avatar Recoloring -- Canvas-Based Approach

### The Problem

The current `mix-blend-mode: color` technique fails because the Elixa mascot is predominantly white/light. The `color` blend mode maps hue and saturation onto the image's existing luminosity -- but white pixels have maximum lightness, so the overlay color barely shows. This is why sliding the hue slider produces almost no visible change.

### The Solution: Canvas Pixel Manipulation

Instead of CSS blend modes, we will use an HTML Canvas to directly manipulate pixel colors. This approach works reliably regardless of the source image's brightness.

**How it works:**

1. Draw the mascot image onto an offscreen canvas
2. Read all pixel data
3. For each pixel, multiply its RGB channels by the target color's RGB percentages
4. White pixels (255, 255, 255) become exactly the target color
5. Darker pixels become darker shades of the target color
6. Transparent pixels remain transparent (alpha channel preserved)

This is the same technique used in game sprite recoloring and icon tinting -- it produces vivid, accurate results on white/light source images.

### What Changes

**File:** `src/components/developer/AgentSubmissionForm.tsx`

1. **Replace `RecoloredMascot` component** with a new `CanvasRecoloredMascot` component that:
   - Loads the mascot SVG into an `Image` element
   - Draws it onto a hidden `<canvas>`
   - Reads pixel data with `getImageData`
   - Multiplies each pixel's R, G, B by the chosen color's R, G, B (as 0-1 fractions)
   - Writes the modified pixels back and renders the canvas
   - When no color is selected (hue = 0), renders the original image unmodified

2. **Keep the existing hue slider** (0-360 range with "Original" at 0) and `hslToHex` helper -- these work fine, it's only the rendering that needs fixing

3. **Add hex-to-RGB helper** to convert the hex color to RGB fractions for the canvas multiplication

4. **Everything else stays the same** -- the layout, review summary, data storage (`avatarSvgPath` + `avatarColor` in `capability_manifest`), and custom icon upload fallback

### Technical Details

**Canvas recoloring logic:**

```text
For each pixel (i = 0; i < data.length; i += 4):
  data[i + 0] = data[i + 0] * (targetR / 255)   // Red
  data[i + 1] = data[i + 1] * (targetG / 255)   // Green
  data[i + 2] = data[i + 2] * (targetB / 255)   // Blue
  data[i + 3] = data[i + 3]                      // Alpha unchanged
```

- White pixel (255,255,255) with target red (255,0,0) becomes (255,0,0) -- pure red
- Gray pixel (128,128,128) with target red becomes (128,0,0) -- dark red
- Transparent pixel stays transparent

**New helper function:**

```text
hexToRgb("#FF5733") -> { r: 255, g: 87, b: 51 }
```

**Component structure:**

```text
CanvasRecoloredMascot:
  - Uses useEffect to redraw canvas when avatarColor changes
  - Uses useRef for canvas element
  - Renders <canvas> with rounded corners matching current styling
  - Falls back to plain <img> when avatarColor is empty (original)
```

### Files to Modify

- `src/components/developer/AgentSubmissionForm.tsx` -- replace RecoloredMascot with canvas-based version, add hexToRgb helper

