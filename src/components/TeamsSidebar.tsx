import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeams, Team } from "@/data/mockTeams";
import { TeamSection } from "./TeamSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
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

export const TeamsSidebar = ({ selectedMemberId, onSelectMember }: TeamsSidebarProps) => {
  const [teamChatOpen, setTeamChatOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [teamChatInput, setTeamChatInput] = useState("");

  const handleChatWithTeam = (teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      // Get mock messages based on team id
      const baseId = teamId.split('-')[0];
      setTeamMessages(mockTeamChatResponses[baseId] || mockTeamChatResponses["marketing"]);
      setTeamChatOpen(true);
    }
  };

  const handleSendTeamMessage = () => {
    if (!teamChatInput.trim() || !selectedTeam) return;
    
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender: "You",
      content: teamChatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    
    setTeamMessages(prev => [...prev, newMessage]);
    setTeamChatInput("");

    // Simulate team response
    setTimeout(() => {
      const responder = selectedTeam.manager;
      const response: TeamMessage = {
        id: (Date.now() + 1).toString(),
        sender: responder.name,
        content: "Thanks for the update! I'll coordinate with the team on this.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        isManager: true,
      };
      setTeamMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {mockTeams.map((team, index) => (
            <TeamSection
              key={team.id}
              team={team}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              onChatWithTeam={handleChatWithTeam}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Team Group Chat Dialog */}
      <Dialog open={teamChatOpen} onOpenChange={setTeamChatOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedTeam?.name}
              <span className="text-xs text-muted-foreground font-normal">
                ({(selectedTeam?.members.length || 0) + 1} members)
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {teamMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.isUser && "flex-row-reverse"
                )}
              >
                {!msg.isUser && (
                  <div className="flex-shrink-0">
                    <Bot className={cn(
                      "h-6 w-6",
                      msg.isManager ? "text-blue-500" : "text-orange-500"
                    )} />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  msg.isUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  {!msg.isUser && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {msg.sender}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={teamChatInput}
                onChange={(e) => setTeamChatInput(e.target.value)}
                placeholder={`Message ${selectedTeam?.name}...`}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTeamMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendTeamMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
