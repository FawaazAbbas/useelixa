

# Fix: Always Show Mascot Avatar (No Letter Fallbacks)

## Problem
When an agent doesn't have a brand color stored in `icon_url`, the `AgentAvatar` component falls through to a plain letter fallback (e.g. "TE" for "Test Agent") instead of showing the Elixa mascot. The mascot should always appear.

## Solution
Update `AgentAvatar` so that when no `avatarColor` is provided, it still renders the `ColorizedMascot` with either no color filter (default mascot appearance) or a neutral default color, inside the same circular grey background.

### File: `src/components/ai-employees/AgentAvatar.tsx`
- Remove the `if (avatarColor)` conditional branching
- Always render the `ColorizedMascot` with the circular `bg-muted` background
- Pass `color={avatarColor || undefined}` so uncolored agents get the default mascot look
- Keep the `Avatar` + `AvatarImage` path only for agents that have an actual image URL (not a hex color)

### Updated logic:
```
1. If avatarColor is a hex string -> colorized mascot on grey circle
2. If avatarColor is empty/null -> default (uncolored) mascot on grey circle
3. If iconUrl is a real URL (not a hex) and no avatarColor -> show the image
```

This ensures every agent card in the developer list and detail sheet shows the mascot, never a letter emblem.

