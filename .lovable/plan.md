

# Chat History as Right-Side Popout Panel

## Problem
When "Elixa AI" is selected in the Chats page, the embedded Chat component renders a permanent session sidebar on the left (a third column alongside MainNavSidebar and ChatspaceSidebar), making the layout feel cramped with three navigation columns.

## Solution
Replace the always-visible left session sidebar with a toggleable right-side Sheet panel. Add a "History" button to the chat header that slides open the session list from the right.

## Changes

### `src/pages/Chat.tsx`
- Remove the permanent `<div className="hidden md:flex w-72 border-r flex-col"><SessionList /></div>` column
- Add an `embedded` prop (optional boolean) that, when true, hides `MainNavSidebar` and adjusts the layout to fill its container
- Replace the left sidebar with a right-side `<Sheet>` containing `<SessionList />`, triggered by a history/clock icon button in the header
- Keep the mobile Sheet (left side) as fallback for standalone `/chat` route
- Add a `History` or `PanelRight` icon button in the header toolbar area

### `src/pages/AIEmployees.tsx`
- Update `EmbeddedChatWrapper` to pass `embedded={true}` to `<Chat />` instead of using CSS hacks to hide the sidebar
- Remove the `[&>div>div:first-child]:hidden` CSS workaround

### Header Layout (in Chat.tsx)
Current header: `[Menu(mobile)] [Elixa avatar] [spacer] [ModelSelector] [Share] [Actions]`
New header: `[Menu(mobile)] [Elixa avatar] [spacer] [ModelSelector] [Share] [Actions] [History toggle]`

The History toggle button uses `PanelRight` or `History` icon and opens a Sheet from the right containing the full SessionList with pinned chats, search, date groups, etc.

