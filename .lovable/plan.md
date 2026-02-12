

## Redesign Step 3: Split Layout with Large Avatar Preview

### What changes

**Step 3 of the Agent Submission Form** will be redesigned into a two-column layout:
- **Left column**: Pose selection grid, color slider, custom upload toggle, and the review summary
- **Right column**: A large, prominent live preview of the selected avatar with the agent name underneath

### More intense colors

The CSS filter will be updated from a simple `hue-rotate` to `hue-rotate(...) saturate(1.6)`, making all color shifts significantly more vibrant and punchy. The original (0 degree) option will remain unfiltered.

### Technical Details

**File:** `src/components/developer/AgentSubmissionForm.tsx`

1. **Layout change (Step 3 only):** Wrap the step 3 content in a `flex` / `grid grid-cols-[1fr_1fr]` container with `gap-8`:
   - Left side: pose grid (2x2), hue slider, custom upload toggle, review summary
   - Right side: large avatar preview image (~48-64 size, centered) with agent name and color label below it

2. **Intensify colors:** Change the inline filter style from:
   ```
   filter: hue-rotate(Xdeg)
   ```
   to:
   ```
   filter: hue-rotate(Xdeg) saturate(1.6) brightness(1.05)
   ```
   This applies to all three places the filter is used: the pose grid thumbnails, the large preview image, and the saved `avatarColor` value in `capability_manifest`.

3. **Large preview:** Replace the current small inline preview (h-16 w-16) with a large centered image (h-48 w-48 or larger) inside a styled container with a subtle background, making it the visual focal point of the step.

4. **Pose grid:** Change from `grid-cols-3 sm:grid-cols-5` to `grid-cols-2` since there are only 4 poses, keeping them compact on the left side.

