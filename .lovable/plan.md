

# Zoom Avatar to Head & Shoulders

The mascot images currently show the full body. To focus on the head and shoulders area, we'll use CSS `object-position` and `object-fit: cover` to crop the image, showing only the top portion.

## Changes

### 1. Update `AgentAvatar` component (`src/components/ai-employees/AgentAvatar.tsx`)

When rendering the `ColorizedMascot` for avatars, wrap it so the image is cropped to the top ~40% (head and shoulders). This means:

- Change the `<img>` from `object-contain` to `object-cover`
- Add `object-top` to anchor the visible area to the top of the image
- Scale the image up slightly (`scale-150`) so the head fills the circular avatar frame
- Apply `overflow-hidden` on the wrapper to clip the rest

### 2. Update `ColorizedMascot` component (`src/components/ColorizedMascot.tsx`)

Add an optional `crop` prop (e.g. `crop?: "head"`) that switches the image from `object-contain` to `object-cover object-top scale-[1.5]` when set. This keeps the full-body view available for larger previews (like the submission form) while enabling the cropped head view for small avatars.

### 3. Pass `crop="head"` from `AgentAvatar`

In `AgentAvatar.tsx`, pass the new crop prop when rendering `ColorizedMascot` so all agent avatars throughout the app (sidebar, chat, marketplace, settings) automatically get the zoomed-in head view.

## Technical Detail

```tsx
// ColorizedMascot.tsx -- add crop prop
interface ColorizedMascotProps {
  color?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  crop?: "head" | "full";  // NEW
  className?: string;
}

// In the <img> tag:
className={cn(
  sizeClasses[size],
  crop === "head"
    ? "object-cover object-[center_15%] scale-[1.6]"
    : "object-contain",
  className
)}

// AgentAvatar.tsx -- pass crop
<ColorizedMascot
  color={avatarColor}
  crop="head"
  className={cn("rounded-full", className)}
/>
```

The `object-[center_15%]` positions the crop point near the top of the image (head area), while `scale-[1.6]` zooms in enough to fill the circular frame with head and shoulders. The `overflow-hidden` from the parent `rounded-full` clips everything else.

### Files to edit:
- `src/components/ColorizedMascot.tsx` -- add `crop` prop
- `src/components/ai-employees/AgentAvatar.tsx` -- pass `crop="head"`

