import { useState, useEffect } from "react";
import { Clock, Mail, MoreVertical, RefreshCw, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface PendingInvitationsCardProps {
  orgId: string | undefined;
  isAdmin: boolean;
}

export const PendingInvitationsCard = ({ orgId, isAdmin }: PendingInvitationsCardProps) => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<PendingInvitation | null>(null);

  const fetchInvitations = async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pending_invitations")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [orgId]);

  const handleResendInvite = async (invite: PendingInvitation) => {
    setActionLoading(invite.id);
    try {
      const { data, error } = await supabase.functions.invoke("invite-member", {
        body: { email: invite.email, role: invite.role, resend: true },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Invitation resent to ${invite.email}`);
        // Update expires_at locally
        setInvitations(prev =>
          prev.map(i =>
            i.id === invite.id
              ? { ...i, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
              : i
          )
        );
      } else {
        toast.error(data.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Error resending invite:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelInvite = async () => {
    if (!selectedInvite) return;
    
    setActionLoading(selectedInvite.id);
    try {
      const { error } = await supabase
        .from("pending_invitations")
        .delete()
        .eq("id", selectedInvite.id);

      if (error) throw error;

      setInvitations(prev => prev.filter(i => i.id !== selectedInvite.id));
      toast.success(`Invitation to ${selectedInvite.email} cancelled`);
    } catch (error) {
      console.error("Error cancelling invite:", error);
      toast.error("Failed to cancel invitation");
    } finally {
      setActionLoading(null);
      setCancelDialogOpen(false);
      setSelectedInvite(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            {invitations.length} pending invite{invitations.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitations.map((invite) => {
            const expired = isExpired(invite.expires_at);
            
            return (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {invite.role}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Sent {formatDate(invite.created_at)}
                      {expired ? (
                        <span className="text-destructive ml-2">• Expired</span>
                      ) : (
                        <span className="ml-2">• Expires {formatDate(invite.expires_at)}</span>
                      )}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={actionLoading === invite.id}
                      >
                        {actionLoading === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleResendInvite(invite)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedInvite(invite);
                          setCancelDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to {selectedInvite?.email}?
              They will no longer be able to join using the invitation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
