import { useState } from "react";
import { Users, Crown, Shield, User, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeam, type TeamMember } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleColors = {
  owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  member: "bg-muted text-muted-foreground border-border",
};

const MemberCard = ({
  member,
  currentUserId,
  isAdmin,
  onUpdateRole,
  onRemove,
}: {
  member: TeamMember;
  currentUserId: string | undefined;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: "admin" | "member") => void;
  onRemove: (userId: string) => void;
}) => {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const RoleIcon = roleIcons[member.role];
  const isCurrentUser = member.user_id === currentUserId;
  const canModify = isAdmin && member.role !== "owner" && !isCurrentUser;

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback>
              {member.display_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.display_name}</span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Joined {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={roleColors[member.role]}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>

          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdateRole(member.user_id, "admin")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateRole(member.user_id, "member")}>
                  <User className="h-4 w-4 mr-2" />
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmRemove(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.display_name} from the team? 
              They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRemove(member.user_id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Team = () => {
  const { user } = useAuth();
  const { organization, members, loading, isAdmin, updateMemberRole, removeMember } = useTeam();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Team</h1>
              {organization && (
                <p className="text-sm text-muted-foreground">{organization.name}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {organization?.plan || "Free"} Plan
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""} in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3" />
                <p>No team members yet</p>
              </div>
            ) : (
              members
                .sort((a, b) => {
                  const roleOrder = { owner: 0, admin: 1, member: 2 };
                  return roleOrder[a.role] - roleOrder[b.role];
                })
                .map((member) => (
                  <MemberCard
                    key={member.user_id}
                    member={member}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    onUpdateRole={updateMemberRole}
                    onRemove={removeMember}
                  />
                ))
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
              <CardDescription>
                Invite new team members by sharing your organization link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Member invitation feature coming soon. For now, new users can be added 
                directly to your organization by an administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Team;
