

# Fix Agent Avatar Colors on Developer Page

## Root Cause

The database shows that `icon_url` is `NULL` for all agents. Avatar colors are stored exclusively in `capability_manifest.avatarColor` (e.g. `#4F46E5`, `#00ff6e`, `#EF4444`). But the code in `AgentList.tsx` passes `avatarColor={agent.icon_url}` which is always null -- so every agent gets the default uncolored mascot.

## Changes

### 1. `src/components/developer/AgentList.tsx` (line 95)

Read the color from `capability_manifest` instead of `icon_url`:

```tsx
// Before
<AgentAvatar name={agent.name} avatarColor={agent.icon_url} iconUrl={agent.icon_url} className="h-10 w-10" />

// After
<AgentAvatar
  name={agent.name}
  avatarColor={(agent.capability_manifest as any)?.avatarColor || agent.icon_url}
  iconUrl={agent.icon_url}
  className="h-10 w-10"
/>
```

### 2. `src/components/developer/AgentDetailSheet.tsx`

**A. Fix initialization (line 91)** -- read from manifest first since that's where data actually lives:

```tsx
setAvatarColor((manifest?.avatarColor as string) || agent.icon_url || "");
```

**B. Replace the plain text input with a native color picker + text input combo** for intuitive editing. Add an `<input type="color">` swatch next to the hex input so developers can visually pick a color. Show a larger live preview of the mascot with the selected color.

**C. Fix the header avatar (line 128)** to also read from manifest:

```tsx
<AgentAvatar
  name={agent.name}
  avatarColor={avatarColor || (agent.capability_manifest as any)?.avatarColor}
  iconUrl={agent.icon_url}
  className="h-12 w-12"
/>
```

**D. Branding save (line 276-283)** -- keep writing to both `icon_url` and `capability_manifest.avatarColor` so it works regardless of which field is read.

### 3. Color picker UX in Branding section

Replace the current bare hex input with:
- A native `<input type="color" />` swatch button (click to open OS color picker)
- The hex text input beside it (for manual entry)
- A row of preset color swatches for quick selection
- A larger live mascot preview showing the selected color in real-time

Preset colors: `#6366f1` (indigo), `#EF4444` (red), `#F59E0B` (amber), `#10B981` (green), `#3B82F6` (blue), `#8B5CF6` (purple), `#EC4899` (pink), `#F97316` (orange)

