import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Clock, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface Invite {
  email: string;
  status: string;
  created_at: string;
  converted_at?: string;
}

interface ReferredSignup {
  name: string;
  email: string;
  created_at: string;
}

interface InvitedFriendsListProps {
  invites?: Invite[];
  referredSignups?: ReferredSignup[];
}

export const InvitedFriendsList = ({ invites = [], referredSignups = [] }: InvitedFriendsListProps) => {
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) return local[0] + "***@" + domain;
    return local.slice(0, 3) + "***@" + domain;
  };

  const allEntries = [
    ...referredSignups.map(s => ({
      type: "signup" as const,
      email: s.email,
      name: s.name,
      date: s.created_at,
      status: "converted",
    })),
    ...invites.filter(i => !referredSignups.some(s => s.email === i.email)).map(i => ({
      type: "invite" as const,
      email: i.email,
      name: null,
      date: i.created_at,
      status: i.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-violet-500" />
            Invited Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No friends invited yet</p>
            <p className="text-xs mt-1">Share your referral code to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-violet-500" />
          Invited Friends
          <Badge variant="secondary" className="ml-auto text-xs">
            {allEntries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.status === "converted" 
                    ? "bg-green-500/10" 
                    : "bg-muted"
                }`}>
                  {entry.status === "converted" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {entry.name || maskEmail(entry.email)}
                  </p>
                  {entry.name && (
                    <p className="text-xs text-muted-foreground">{maskEmail(entry.email)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(entry.date), "MMM d, yyyy")}
                </span>
                <Badge
                  variant={entry.status === "converted" ? "default" : "secondary"}
                  className={`text-xs ${
                    entry.status === "converted" 
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                      : ""
                  }`}
                >
                  {entry.status === "converted" ? "Joined" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
