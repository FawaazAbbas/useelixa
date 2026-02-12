

# Use Colorized Mascot Avatars in AI Employees Page

Currently, the AI Employees section shows generic letter-based avatar fallbacks for agents. The plan is to replace these with the same `ColorizedMascot` component used in the developer submission form, pulling each agent's brand color from `capability_manifest.avatarColor`.

## What Changes

### 1. Pass `avatarColor` through the data pipeline

The `capability_manifest` is already fetched for installed agents in `AIEmployees.tsx`. We need to:
- Extract `avatarColor` from `capability_manifest` in the `FullInstallation` mapping
- Add `avatarColor` to the `InstalledAgent` interface so the sidebar receives it
- Pass `avatarColor` to the marketplace agent data as well

### 2. Create a reusable `AgentAvatar` component

A small wrapper component (`src/components/ai-employees/AgentAvatar.tsx`) that:
- If `avatarColor` exists, renders a `ColorizedMascot` at the appropriate size
- Falls back to a letter-based `AvatarFallback` if no color is set
- Accepts a `size` prop (mapped to pixel dimensions for consistency)

### 3. Replace avatars in all 4 locations

| Location | File | Current | New |
|----------|------|---------|-----|
| Sidebar agent list | `ChatspaceSidebar.tsx` | `Avatar` with `AvatarImage`/`AvatarFallback` | `AgentAvatar` with color |
| Chat header + empty state + messages + loading | `AIEmployees.tsx` | `Avatar` with `AvatarImage`/`AvatarFallback` | `AgentAvatar` with color |
| Settings panel | `AgentSettingsPanel.tsx` | `Avatar` with `AvatarImage`/`AvatarFallback` | `AgentAvatar` with color |
| Browse marketplace cards | `AgentMarketplace.tsx` | `Avatar` with `AvatarImage`/`AvatarFallback` | `AgentAvatar` with color |

## Technical Details

- `ColorizedMascot` uses CSS `hue-rotate` + `saturate` filters on the default PNG mascot -- lightweight and performant
- The `avatarColor` hex string is stored in `agent_submissions.capability_manifest` as `{ avatarColor: "#hex" }`
- No database changes are needed; the data is already available
- The `AgentAvatar` component will accept small sizes like `h-7`, `h-8`, `h-9`, `h-12`, `h-16` using Tailwind classes passed through

