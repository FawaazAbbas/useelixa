import { Bot, Users, CheckSquare, Upload, Info, FileText, Brain, Activity, PlayCircle, FolderUp, CircleCheck, Target, ClipboardList, MessageCircle, NotebookPen, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon } from "@/components/FileIcon";
import { ChatAutomationsPanel } from "@/components/ChatAutomationsPanel";
import { AgentFilesPanel } from "@/components/AgentFilesPanel";
import { ChatMemoriesPanel } from "@/components/ChatMemoriesPanel";
import { ChatLogsPanel } from "@/components/ChatLogsPanel";
import { AutomationHistoryDashboard } from "@/components/AutomationHistoryDashboard";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { getTeamMemberById, getTeamOnlineCount } from "@/data/mockTeams";
import { getTeamGroupData, formatRelativeTime } from "@/data/mockTeamGroupData";
import { mockDirectorChatData } from "@/data/mockTeamMessages";
import { brianFiles, brianMemories, brianActivity } from "@/data/mockWorkspaceData";
import { TeamMemberAvatar } from "@/components/TeamMemberAvatar";
import { useState } from "react";

interface ChatRightPanelProps {
  showBrian: boolean;
  selectedChat: any;
  selectedTeamMemberId: string | null;
  selectedTeamGroupId: string | null;
  rightSidebarTab: string;
  onTabChange: (tab: string) => void;
  workspaceId: string;
  userId: string;
  onFilePreview: (file: { name: string; type: string; size: number; uploadedBy?: string; uploadedAt?: string }) => void;
  onSelectTeamMember?: (memberId: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ChatRightPanel = ({
  showBrian,
  selectedChat,
  selectedTeamMemberId,
  selectedTeamGroupId,
  rightSidebarTab,
  onTabChange,
  workspaceId,
  userId,
  onFilePreview,
  onSelectTeamMember,
  onClose,
  showCloseButton = false,
}: ChatRightPanelProps) => {
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);

  // Determine which tab layout to use
  const showAboutTab = showBrian || selectedTeamMemberId || selectedTeamGroupId;
  const showAutomationsTab = !showBrian && !selectedTeamMemberId && !selectedTeamGroupId && selectedChat;

  const getActivityIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'file_upload': return <FolderUp className={`${iconClass} text-blue-500`} />;
      case 'decision': return <CircleCheck className={`${iconClass} text-green-500`} />;
      case 'milestone': return <Target className={`${iconClass} text-purple-500`} />;
      case 'task': return <ClipboardList className={`${iconClass} text-orange-500`} />;
      case 'discussion': return <MessageCircle className={`${iconClass} text-purple-500`} />;
      default: return <NotebookPen className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'file_upload': return 'text-blue-600 dark:text-blue-400';
      case 'decision': return 'text-green-600 dark:text-green-400';
      case 'milestone': return 'text-purple-600 dark:text-purple-400';
      case 'task': return 'text-orange-600 dark:text-orange-400';
      case 'discussion': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  // Render About Tab Content
  const renderAboutContent = () => {
    if (showBrian) {
      return (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About Brian</h3>
            <p className="text-muted-foreground">
              Brian is your AI Chief Operating Officer, designed to orchestrate and optimize your entire workspace. Unlike individual agents that specialize in specific tasks, Brian takes a holistic view of your operations, coordinating between agents, managing workflows, and ensuring everything runs smoothly.
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Capabilities</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Coordinate multiple agents and delegate tasks intelligently</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Manage workspace-level automations and workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Monitor agent performance and optimize operations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Provide strategic insights and operational recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Handle complex multi-step workflows and decision-making</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2">How Brian Works</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              Brian operates at the workspace level, maintaining context across all your agents and operations. When you assign a task to Brian, he analyzes the requirements, determines which agents are best suited for each component, and orchestrates the execution. He monitors progress, handles exceptions, and ensures successful completion while keeping you informed throughout the process.
            </p>
          </div>
        </div>
      );
    }

    if (selectedTeamMemberId) {
      const memberInfo = getTeamMemberById(selectedTeamMemberId);
      if (!memberInfo) return null;
      const { member, team } = memberInfo;
      const iconColor = member.isManager ? "text-blue-500" : "text-orange-500";
      const bgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";
      
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <TeamMemberAvatar 
              memberId={selectedTeamMemberId} 
              size="lg" 
            />
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-2">Team</h4>
            <p className="text-muted-foreground">{team.name}</p>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-2">Specialty</h4>
            <p className="text-muted-foreground">{member.specialty}</p>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Capabilities</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Specialized in {member.specialty?.toLowerCase()}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Member of {team.name}</span>
              </li>
              {member.isManager && (
                <li className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Department head with team leadership responsibilities</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-2">Status</h4>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                member.status === 'online' ? 'bg-green-500' : 
                member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-muted-foreground capitalize">{member.status}</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedTeamGroupId) {
      const teamData = getTeamGroupData(selectedTeamGroupId);
      if (!teamData) return null;
      const { team } = teamData;
      const onlineCount = getTeamOnlineCount(team);
      
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center`} style={{ background: team.gradient }}>
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.members.length + 1} members · {onlineCount} online</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{team.description}</p>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Team Members</h4>
            <div className="space-y-2">
              {/* Manager */}
              <button
                onClick={() => onSelectTeamMember?.(team.manager.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <TeamMemberAvatar 
                  memberId={team.manager.id} 
                  size="sm" 
                  className="h-8 w-8"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{team.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{team.manager.role}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${
                  team.manager.status === 'online' ? 'bg-green-500' : 
                  team.manager.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </button>
              
              {/* Workers */}
              {team.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setShowWaitlistDialog(true)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <TeamMemberAvatar 
                    memberId={member.id} 
                    size="sm" 
                    className="h-8 w-8"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${
                    member.status === 'online' ? 'bg-green-500' : 
                    member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Regular agent chat
    if (selectedChat?.agent) {
      return (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About {selectedChat.agent.name}</h3>
            <p className="text-muted-foreground">
              {selectedChat.agent.description || selectedChat.agent.short_description}
            </p>
          </div>
          
          {selectedChat.agent.capabilities && selectedChat.agent.capabilities.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3">Capabilities</h3>
              <ul className="space-y-2">
                {selectedChat.agent.capabilities.map((capability: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedChat.agent.long_description && (
            <div>
              <h3 className="text-base font-semibold mb-2">Full Details</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {selectedChat.agent.long_description}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Select a chat to view details</p>
      </div>
    );
  };

  // Render Files Tab Content
  const renderFilesContent = () => {
    if (showBrian) {
      return (
        <div className="h-full overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Brian's Files</h3>
              <p className="text-sm text-muted-foreground mb-4">Files shared in this conversation</p>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload Files</p>
              <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Shared Files ({brianFiles.length})</h4>
              {brianFiles.length > 0 ? (
                <div className="space-y-2">
                  {[...brianFiles].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map((file) => (
                    <Card 
                      key={file.id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onFilePreview({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        uploadedBy: file.uploadedBy,
                        uploadedAt: file.uploadedAt
                      })}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <FileIcon fileType={file.type} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · {file.uploadedBy}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(file.uploadedAt)}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    No files shared yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedTeamMemberId) {
      const directorData = mockDirectorChatData[selectedTeamMemberId as keyof typeof mockDirectorChatData];
      const memberInfo = getTeamMemberById(selectedTeamMemberId);
      const memberName = memberInfo?.member?.name || 'Team Member';
      const files = directorData?.files || [];
      
      return (
        <div className="h-full overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{memberName} Files</h3>
              <p className="text-sm text-muted-foreground mb-4">Shared files from this chat</p>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload Files</p>
              <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Shared Files ({files.length})</h4>
              {files.length > 0 ? (
                <div className="space-y-2">
                  {[...files].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map((file, idx) => (
                    <Card 
                      key={idx} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        const sizeInBytes = typeof file.size === 'string' 
                          ? parseFloat(file.size) * 1024 
                          : file.size;
                        onFilePreview({
                          name: file.name,
                          type: file.type,
                          size: sizeInBytes,
                          uploadedBy: file.uploadedBy,
                          uploadedAt: file.uploadedAt
                        });
                      }}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <FileIcon fileType={file.type} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} · {file.uploadedBy}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(file.uploadedAt)}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    No files shared yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedTeamGroupId) {
      const teamData = getTeamGroupData(selectedTeamGroupId);
      if (!teamData) return null;
      const { team, files } = teamData;
      
      return (
        <div className="h-full overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{team.name} Files</h3>
              <p className="text-sm text-muted-foreground mb-4">Shared files for the entire team</p>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload Files</p>
              <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Team Files ({files.length})</h4>
              {files.length > 0 ? (
                <div className="space-y-2">
                  {[...files].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map((file) => (
                    <Card 
                      key={file.id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        const sizeInBytes = typeof file.size === 'string' 
                          ? parseFloat(file.size) * 1024 * 1024 
                          : file.size;
                        onFilePreview({
                          name: file.name,
                          type: file.type,
                          size: sizeInBytes,
                          uploadedBy: file.uploadedBy,
                          uploadedAt: file.uploadedAt
                        });
                      }}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <FileIcon fileType={file.type} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} · {file.uploadedBy}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(file.uploadedAt)}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    No files uploaded yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedChat?.type === 'direct') {
      return (
        <AgentFilesPanel
          agentInstallationId={selectedChat.agent_installation_id}
          workspaceId={workspaceId}
        />
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Select a chat to view files</p>
      </div>
    );
  };

  // Render Memories Tab Content
  const renderMemoriesContent = () => {
    if (showBrian) {
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Brian's Memories</h3>
            <p className="text-sm text-muted-foreground mb-4">Key decisions and shared context</p>
          </div>
          
          {brianMemories.length > 0 ? (
            <div className="space-y-3">
              {brianMemories.map((memory) => (
                <Card key={memory.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{memory.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(memory.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium">{memory.key}</p>
                        <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No memories recorded yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedTeamMemberId) {
      const directorData = mockDirectorChatData[selectedTeamMemberId as keyof typeof mockDirectorChatData];
      const memberInfo = getTeamMemberById(selectedTeamMemberId);
      const memberName = memberInfo?.member?.name || 'Team Member';
      const memories = directorData?.memories || [];
      
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{memberName} Memories</h3>
            <p className="text-sm text-muted-foreground mb-4">Key discussion topics and decisions</p>
          </div>
          
          {memories.length > 0 ? (
            <div className="space-y-3">
              {memories.map((memory) => (
                <Card key={memory.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{memory.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(memory.updated_at)}</span>
                        </div>
                        <p className="text-sm font-medium">{memory.key}</p>
                        <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                        <p className="text-xs text-muted-foreground mt-2">Added by {memory.created_by}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No memories yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedTeamGroupId) {
      const teamData = getTeamGroupData(selectedTeamGroupId);
      if (!teamData) return null;
      const { team, memories } = teamData;
      
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{team.name} Memories</h3>
            <p className="text-sm text-muted-foreground mb-4">Team-level preferences and shared context</p>
          </div>
          
          {memories.length > 0 ? (
            <div className="space-y-3">
              {memories.map((memory) => (
                <Card key={memory.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{memory.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(memory.updatedAt)}</span>
                        </div>
                        <p className="text-sm font-medium">{memory.key}</p>
                        <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                        <p className="text-xs text-muted-foreground mt-2">Added by {memory.createdBy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No team memories yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedChat) {
      return (
        <ChatMemoriesPanel
          chatId={selectedChat.id}
          workspaceId={workspaceId}
          agentInstallationId={selectedChat.agent_installation_id}
        />
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Select a chat to view memories</p>
      </div>
    );
  };

  // Render History Tab Content
  const renderHistoryContent = () => {
    if (showBrian) {
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Brian's Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">File uploads and key decisions</p>
          </div>
          
          {brianActivity.length > 0 ? (
            <div className="space-y-3">
              {brianActivity.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(item.action)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${getActivityColor(item.action)}`}>
                            {item.action === 'file_upload' ? 'File Upload' : 'Decision'}
                          </span>
                          <span className="text-xs text-muted-foreground">· {formatRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">by {item.agent}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No activity yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedTeamMemberId) {
      const directorData = mockDirectorChatData[selectedTeamMemberId as keyof typeof mockDirectorChatData];
      const memberInfo = getTeamMemberById(selectedTeamMemberId);
      const memberName = memberInfo?.member?.name || 'Team Member';
      const activity = directorData?.activity || [];
      
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{memberName} Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">File uploads and key decisions</p>
          </div>
          
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${getActivityColor(item.type)}`}>{item.action}</span>
                          <span className="text-xs text-muted-foreground">· {formatRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">by {item.performer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No activity yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedTeamGroupId) {
      const teamData = getTeamGroupData(selectedTeamGroupId);
      if (!teamData) return null;
      const { team, activity } = teamData;
      
      return (
        <div className="h-full overflow-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{team.name} Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">Recent team collaboration and decisions</p>
          </div>
          
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${getActivityColor(item.type)}`}>{item.action}</span>
                          <span className="text-xs text-muted-foreground">· {formatRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">by {item.performedBy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                No team activity yet
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (selectedChat) {
      return (
        <div className="h-full overflow-auto p-4">
          <h3 className="font-semibold mb-4">Automation History</h3>
          <AutomationHistoryDashboard 
            workspaceId={workspaceId} 
            chatId={selectedChat.id}
          />
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Select a chat to view history</p>
      </div>
    );
  };

  // Calculate grid columns for tabs
  const getTabGridCols = () => {
    if (showAboutTab && !showAutomationsTab) return 'grid-cols-4';
    if (!showAboutTab && showAutomationsTab) return 'grid-cols-5';
    if (showAboutTab && showAutomationsTab) return 'grid-cols-5';
    return 'grid-cols-4';
  };

  return (
    <>
      <Tabs value={rightSidebarTab} onValueChange={onTabChange} className="h-full flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          {showCloseButton && (
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <TabsList className={`w-full grid ${getTabGridCols()}`}>
            {showAboutTab && (
              <TabsTrigger value="about" className="text-xs flex items-center justify-center">
                <Info className="h-4 w-4" />
              </TabsTrigger>
            )}
            {showAutomationsTab && (
              <TabsTrigger value="automations" className="text-xs flex items-center justify-center">
                <PlayCircle className="h-4 w-4" />
              </TabsTrigger>
            )}
            <TabsTrigger value="files" className="text-xs flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="memories" className="text-xs flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        {showAboutTab && (
          <TabsContent value="about" className="flex-1 m-0 overflow-auto">
            {renderAboutContent()}
          </TabsContent>
        )}

        {showAutomationsTab && (
          <TabsContent value="automations" className="flex-1 m-0 overflow-hidden">
            <ChatAutomationsPanel
              chatId={selectedChat?.id}
              userId={userId}
              workspaceId={workspaceId}
            />
          </TabsContent>
        )}

        <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
          {renderFilesContent()}
        </TabsContent>

        <TabsContent value="memories" className="flex-1 m-0 overflow-hidden">
          {renderMemoriesContent()}
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
          {renderHistoryContent()}
        </TabsContent>
      </Tabs>

      <WaitlistDialog 
        open={showWaitlistDialog} 
        onOpenChange={setShowWaitlistDialog} 
      />
    </>
  );
};
