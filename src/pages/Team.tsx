import { useState } from "react";
import { Users, Crown, Shield, User, MoreVertical, Trash2, UserPlus, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTeam, type TeamMember } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { PendingInvitationsCard } from "@/components/team/PendingInvitationsCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const InviteMemberDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("invite-member", {
        body: { email, role },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setEmail("");
        setOpen(false);
        onSuccess();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Member
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can manage team members and organization settings.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Team = () => {
  const { user } = useAuth();
  const { organization, members, loading, isAdmin, updateMemberRole, removeMember, refetch } = useTeam();

  if (loading) {
    return (
      <PageLayout title="Team" icon={Users}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Team"
      icon={Users}
      badge={organization?.plan ? `${organization.plan} Plan` : undefined}
      actions={isAdmin ? <InviteMemberDialog onSuccess={refetch} /> : undefined}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Pending Invitations */}
        <PendingInvitationsCard orgId={organization?.id} isAdmin={isAdmin} />
        
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""} in your organization
              {organization && ` • ${organization.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <PageEmptyState
                icon={Users}
                title="No team members yet"
                description={isAdmin ? "Click 'Invite Member' to add someone to your team." : "No team members found."}
              />
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
      </div>
    </PageLayout>
  );
};

export default Team;
