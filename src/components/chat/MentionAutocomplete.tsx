import { useState, useRef, useCallback } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import type { TeamMember } from "@/utils/mentions";

interface MentionAutocompleteProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  teamMembers: TeamMember[];
  onMentionSelect: (member: TeamMember) => void;
}

export const useMentionAutocomplete = (teamMembers: TeamMember[]) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const mentionStartIndex = useRef<number>(-1);

  const handleInputChange = useCallback((
    value: string,
    cursorPosition: number,
    inputElement: HTMLTextAreaElement | null
  ) => {
    // Find if we're typing a mention
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @ (still typing mention)
      if (!textAfterAt.includes(" ")) {
        mentionStartIndex.current = lastAtIndex;
        setMentionFilter(textAfterAt.toLowerCase());
        setShowMentions(true);

        // Calculate position for popover
        if (inputElement) {
          const rect = inputElement.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
        return;
      }
    }

    setShowMentions(false);
    mentionStartIndex.current = -1;
  }, []);

  const insertMention = useCallback((
    member: TeamMember,
    currentValue: string,
    setInputValue: (value: string) => void
  ) => {
    if (mentionStartIndex.current === -1) return;

    const mentionText = member.display_name || member.email.split("@")[0];
    const beforeMention = currentValue.slice(0, mentionStartIndex.current);
    const afterMention = currentValue.slice(
      mentionStartIndex.current + mentionFilter.length + 1
    );
    
    const newValue = `${beforeMention}@${mentionText} ${afterMention}`;
    setInputValue(newValue);
    setShowMentions(false);
    mentionStartIndex.current = -1;
  }, [mentionFilter]);

  const filteredMembers = teamMembers.filter(member => {
    if (!mentionFilter) return true;
    const emailMatch = member.email.toLowerCase().includes(mentionFilter);
    const nameMatch = member.display_name?.toLowerCase().includes(mentionFilter);
    return emailMatch || nameMatch;
  });

  return {
    showMentions,
    setShowMentions,
    mentionFilter,
    mentionPosition,
    handleInputChange,
    insertMention,
    filteredMembers,
  };
};

interface MentionPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  onSelect: (member: TeamMember) => void;
  position: { top: number; left: number };
  children: React.ReactNode;
}

export const MentionPopover = ({
  open,
  onOpenChange,
  members,
  onSelect,
  children,
}: MentionPopoverProps) => {
  if (!open || members.length === 0) return <>{children}</>;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        side="top"
        sideOffset={4}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No team members found</CommandEmpty>
            <CommandGroup heading="Team Members">
              {members.slice(0, 5).map((member) => (
                <CommandItem
                  key={member.user_id}
                  onSelect={() => onSelect(member)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {member.display_name || member.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
