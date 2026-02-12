

## Single Mascot Avatar with True Color Selection

### The SVG situation

The uploaded SVG is actually a raster image (PNG) embedded inside an SVG container -- it doesn't contain vector paths with `fill` attributes. This means we cannot directly change path colors via SVG fills.

### Solution: CSS `mix-blend-mode` for true recoloring

Instead of the current `hue-rotate` filter (which only shifts existing colors), we'll use a proven technique that produces **genuine color changes**:

1. Convert the mascot image to grayscale using `filter: grayscale(100%) brightness(1.1)`
2. Overlay a colored `div` on top using `mix-blend-mode: color`
3. The result maps the chosen color's hue and saturation onto the mascot's luminosity -- producing a true recolor effect

This works with PNG/raster images and gives far better results than hue-rotate.

### What changes

**File:** `src/components/developer/AgentSubmissionForm.tsx`

1. **Remove all four mascot pose options** -- use only the single uploaded SVG mascot (copied to `src/assets/mascots/Elixa-Mascot-SVG.svg`)

2. **Replace the hue slider with a proper color picker** that maps to actual hex colors, but presented as a slider for simplicity. The slider will output HSL values converted to hex, giving developers a full spectrum of true colors.

3. **Recoloring technique** -- wrap the mascot image in a container:

```text
+----------------------------+
|  <div> (relative, overflow-hidden, rounded)
|    <img> (grayscale filter)
|    <div> (absolute overlay, chosen color bg, mix-blend-mode: color)
+----------------------------+
```

4. **Left column** stays the same layout (no pose grid since there's only one mascot now, just the color controls and review summary)

5. **Right column** shows the large recolored preview

6. **Data storage** -- save both `avatarSvgPath` (the SVG asset path) and `avatarColor` (hex value like `#FF5733`) in the `capability_manifest` JSON

7. **State changes:**
   - Remove `selectedMascot` state (only one mascot now)
   - Change `avatarHue` (0-360) to `avatarColor` (hex string, default empty for original)
   - Add a helper to convert slider position to HSL to hex

### Technical details

**New recolor component pattern:**
```text
<div style="position: relative; overflow: hidden">
  <img 
    src={mascotSvg} 
    style="filter: grayscale(100%) brightness(1.1)"
  />
  <div 
    style="position: absolute; inset: 0; background: #chosen-color; mix-blend-mode: color; pointer-events: none"
  />
</div>
```

When no color is selected (original), the overlay is hidden and the grayscale filter is removed, showing the mascot in its original colors.

**Slider to hex conversion:**
- Slider outputs a hue value 0-360
- Convert to HSL with fixed saturation (80%) and lightness (50%)
- Convert HSL to hex for storage and display
- Position 0 on the slider means "Original" (no recolor)

**Files to modify:**
- Copy `user-uploads://Elixa-Mascot-SVG.svg` to `src/assets/mascots/Elixa-Mascot-SVG.svg`
- Edit `src/components/developer/AgentSubmissionForm.tsx` -- remove pose grid, implement mix-blend-mode recoloring, update data storage

