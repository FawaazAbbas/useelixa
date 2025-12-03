import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeams } from "@/data/mockTeams";
import { TeamSection } from "./TeamSection";

interface TeamsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  collapseAll?: boolean;
}

interface TeamMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  isManager?: boolean;
}

const mockTeamChatResponses: Record<string, TeamMessage[]> = {
  "marketing": [
    { id: "1", sender: "Maya Chen", content: "Good morning team! Let's sync on the Q4 campaign.", timestamp: "9:00 AM", isUser: false, isManager: true },
    { id: "2", sender: "Jordan Rivera", content: "I've got the social media analytics ready to share.", timestamp: "9:02 AM", isUser: false },
    { id: "3", sender: "Alex Kim", content: "The email templates are done. Ready for review!", timestamp: "9:05 AM", isUser: false },
  ],
  "product": [
    { id: "1", sender: "David Park", content: "Sprint planning starts in 30 minutes.", timestamp: "10:00 AM", isUser: false, isManager: true },
    { id: "2", sender: "Lisa Wong", content: "I'll have the product roadmap updated by then.", timestamp: "10:02 AM", isUser: false },
  ],
  "customer-service": [
    { id: "1", sender: "Rachel Kim", content: "Team, we have a VIP escalation that needs attention.", timestamp: "11:00 AM", isUser: false, isManager: true },
    { id: "2", sender: "Carlos Mendez", content: "I can take it. Sending response now.", timestamp: "11:01 AM", isUser: false },
  ],
  "finance": [
    { id: "1", sender: "Michael Foster", content: "Monthly reports are due Friday. Status check?", timestamp: "2:00 PM", isUser: false, isManager: true },
    { id: "2", sender: "Jennifer Walsh", content: "Accounts receivable is ready.", timestamp: "2:03 AM", isUser: false },
  ],
  "development": [
    { id: "1", sender: "Kevin O'Brien", content: "Code review meeting at 3pm. Everyone available?", timestamp: "1:00 PM", isUser: false, isManager: true },
    { id: "2", sender: "Nina Patel", content: "I'll be there. Got the PR ready.", timestamp: "1:02 PM", isUser: false },
    { id: "3", sender: "Sam Torres", content: "Same here, reviewing the API changes now.", timestamp: "1:05 PM", isUser: false },
  ],
  "creative": [
    { id: "1", sender: "Amanda Torres", content: "New brand assets are ready for review.", timestamp: "4:00 PM", isUser: false, isManager: true },
    { id: "2", sender: "Chris Lee", content: "Love the new color palette!", timestamp: "4:05 PM", isUser: false },
  ],
  "legal": [
    { id: "1", sender: "Victoria Sterling", content: "Contract review needed for the Henderson deal.", timestamp: "3:00 PM", isUser: false, isManager: true },
    { id: "2", sender: "Marcus Chen", content: "On it. ETA 2 hours for initial review.", timestamp: "3:02 PM", isUser: false },
  ],
};

export const TeamsSidebar = ({ selectedMemberId, onSelectMember, collapseAll }: TeamsSidebarProps) => {
  const [openTeamIds, setOpenTeamIds] = useState<Set<string>>(new Set([mockTeams[0]?.id]));
  const [activeTeamChatId, setActiveTeamChatId] = useState<string | null>(null);
  const [teamMessages, setTeamMessages] = useState<Record<string, TeamMessage[]>>({});
  const [teamChatInputs, setTeamChatInputs] = useState<Record<string, string>>({});

  // Collapse all teams when collapseAll becomes true
  useEffect(() => {
    if (collapseAll) {
      setOpenTeamIds(new Set());
      setActiveTeamChatId(null);
    }
  }, [collapseAll]);

  const handleToggleTeam = (teamId: string, isOpen: boolean) => {
    setOpenTeamIds(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(teamId);
      } else {
        newSet.delete(teamId);
      }
      return newSet;
    });
  };

  const handleChatWithTeam = (teamId: string) => {
    if (activeTeamChatId === teamId) {
      setActiveTeamChatId(null);
    } else {
      setActiveTeamChatId(teamId);
      // Initialize messages for this team if not already loaded
      if (!teamMessages[teamId]) {
        const baseId = teamId.split('-')[0];
        setTeamMessages(prev => ({
          ...prev,
          [teamId]: mockTeamChatResponses[baseId] || mockTeamChatResponses["marketing"]
        }));
      }
    }
  };

  const handleSendTeamMessage = (teamId: string) => {
    const input = teamChatInputs[teamId]?.trim();
    if (!input) return;
    
    const team = mockTeams.find(t => t.id === teamId);
    if (!team) return;
    
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender: "You",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    
    setTeamMessages(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), newMessage]
    }));
    setTeamChatInputs(prev => ({ ...prev, [teamId]: "" }));

    // Simulate team response
    setTimeout(() => {
      const responder = team.manager;
      const response: TeamMessage = {
        id: (Date.now() + 1).toString(),
        sender: responder.name,
        content: "Thanks for the update! I'll coordinate with the team on this.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        isManager: true,
      };
      setTeamMessages(prev => ({
        ...prev,
        [teamId]: [...(prev[teamId] || []), response]
      }));
    }, 1000);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {mockTeams.map((team) => (
          <TeamSection
            key={team.id}
            team={team}
            selectedMemberId={selectedMemberId}
            onSelectMember={onSelectMember}
            onChatWithTeam={handleChatWithTeam}
            isOpen={openTeamIds.has(team.id)}
            onOpenChange={(isOpen) => handleToggleTeam(team.id, isOpen)}
            showGroupChat={activeTeamChatId === team.id}
            groupChatMessages={teamMessages[team.id] || []}
            groupChatInput={teamChatInputs[team.id] || ""}
            onGroupChatInputChange={(value) => setTeamChatInputs(prev => ({ ...prev, [team.id]: value }))}
            onSendGroupMessage={() => handleSendTeamMessage(team.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
