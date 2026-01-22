import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  user_id: string;
  email: string;
  display_name: string | null;
}

// Parse @mentions from message content and return user IDs
export const parseMentions = (content: string, teamMembers: TeamMember[]): string[] => {
  const mentionPattern = /@(\S+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    const mentionText = match[1].toLowerCase();
    
    // Find matching team member by email prefix or display name
    const matchedMember = teamMembers.find(member => {
      const emailPrefix = member.email.split("@")[0].toLowerCase();
      const displayName = member.display_name?.toLowerCase() || "";
      return emailPrefix === mentionText || displayName === mentionText;
    });

    if (matchedMember && !mentions.includes(matchedMember.user_id)) {
      mentions.push(matchedMember.user_id);
    }
  }

  return mentions;
};

// Highlight mentions in message content
export const highlightMentions = (content: string): string => {
  return content.replace(/@(\S+)/g, '**@$1**');
};

// Create notifications for mentioned users
export const notifyMentionedUsers = async (
  mentionedUserIds: string[],
  messageContent: string,
  senderEmail: string,
  sessionId: string
): Promise<void> => {
  if (mentionedUserIds.length === 0) return;

  const notifications = mentionedUserIds.map(userId => ({
    user_id: userId,
    title: "You were mentioned",
    message: `${senderEmail} mentioned you: "${messageContent.slice(0, 100)}${messageContent.length > 100 ? "..." : ""}"`,
    type: "mention",
    data: { session_id: sessionId },
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  
  if (error) {
    console.error("Failed to create mention notifications:", error);
  }
};

// Fetch team members for mention autocomplete
export const fetchTeamMembers = async (userId: string): Promise<TeamMember[]> => {
  // Get user's organization
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .single();

  if (!membership?.org_id) return [];

  // Get all members of the organization
  const { data: members } = await supabase
    .from("org_members")
    .select(`
      user_id,
      profiles:user_id (
        email,
        display_name
      )
    `)
    .eq("org_id", membership.org_id);

  if (!members) return [];

  return members.map((m: any) => ({
    user_id: m.user_id,
    email: m.profiles?.email || "",
    display_name: m.profiles?.display_name || null,
  })).filter((m: TeamMember) => m.email);
};
