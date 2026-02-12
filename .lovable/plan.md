

# Match AI Employees Chat UX to Main Chat Page

The AI Employees chat currently uses a basic bubble-style layout (left/right aligned bubbles) while the main Chat page uses a full-width message layout with avatars, timestamps, hover actions (copy, delete, retry), time dividers, markdown with code blocks, and a richer input area. This plan aligns the two.

## Key Differences to Resolve

| Feature | Main Chat (Chat.tsx) | Agent Chat (AIEmployees.tsx) |
|---------|---------------------|------------------------------|
| Layout | Full-width rows, avatar left (both roles) | Bubble alignment (user right, assistant left) |
| Timestamps | Below each message, always visible | None shown |
| Time dividers | "Today at 2:30 PM" dividers between gaps | None |
| Hover actions | Copy, delete, retry, edit, feedback, thread | None |
| Avatar style | 9x9 rounded with border, User icon for user | 7x7 AgentAvatar only for assistant |
| Message width | max-w-[85%] with rounded-2xl | max-w-[75%] with rounded-xl |
| Markdown | ReactMarkdown + remarkGfm + CodeBlock component | ReactMarkdown + remarkGfm (basic) |
| Streaming indicator | Blinking cursor inside bubble | Loader2 spinner |
| Input area | Paperclip, voice, mentions, rounded-xl, help text | Basic textarea + send button |
| Container width | `space-y-6 px-4` | `space-y-4 max-w-3xl mx-auto` |
| Empty state | ChatWelcome component | Inline avatar + description |

## Changes

### 1. Refactor message rendering in AIEmployees.tsx

Replace the current inline message rendering (lines 411-462) with a layout matching `MessageBubble` from Chat.tsx:

- **Full-width row layout**: Both user and assistant messages span full width with avatar on the left (user) or left (assistant), mirroring Chat.tsx's `flex items-start gap-3` pattern with `flex-row-reverse` for user messages
- **Avatar sizing**: Use `h-9 w-9` with `border-2 border-muted` styling. For user messages, show User icon in a muted circle. For assistant messages, use `AgentAvatar` with color
- **Message bubble**: `rounded-2xl px-4 py-3`, `max-w-[85%]`, `bg-muted` for both roles
- **Markdown rendering**: Add `CodeBlock` component support via custom `markdownComponents` (same as Chat.tsx)
- **Timestamps**: Show `formatTime(msg.created_at)` below each message in `text-xs text-muted-foreground`
- **Hover actions**: Add copy button (with copied state), delete button on hover (`opacity-0 group-hover:opacity-100`)
- **Time dividers**: Add 30-minute gap dividers between messages with "Today at X:XX" formatting
- **Streaming cursor**: Replace Loader2 spinner with blinking cursor span inside the bubble

### 2. Update the input/composer area

Replace the basic textarea + button (lines 484-508) with the Chat.tsx input style:

- Wrap in `border-t bg-card/80 backdrop-blur-sm p-4`
- Inner container with `w-full px-4`
- Textarea with `min-h-[48px] max-h-[200px] resize-none rounded-xl`
- Send button `h-12 w-12 rounded-xl`
- Add helper text: "Press Enter to send, Shift+Enter for new line"

### 3. Update container spacing

- Change message container from `space-y-4 max-w-3xl mx-auto` to `space-y-6 px-4` with inner max-w-3xl on composer only
- Keep `max-w-3xl mx-auto` on the messages area but use `space-y-6` spacing

## Technical Details

### Files to edit:
- **`src/pages/AIEmployees.tsx`** -- Main changes: message rendering, composer, timestamps, hover actions, time dividers, code block support

### New imports needed in AIEmployees.tsx:
- `Copy, Check, Trash2, User, RefreshCw` from lucide-react
- `CodeBlock` from `@/components/chat/CodeBlock`

### No new files needed -- all changes are in `AIEmployees.tsx` using existing shared components.

