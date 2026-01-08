import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Users, Gift, Trophy, TrendingUp, Search, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralCode {
  code: string;
  user_email: string;
  uses_count: number;
  max_uses: number;
  is_redeemed: boolean;
  created_at: string;
}

interface WaitlistWithReferrals {
  id: string;
  name: string;
  email: string;
  referral_code: string | null;
  referral_count: number;
  invites_sent: number;
  reward_unlocked: boolean;
  referred_by_code: string | null;
  created_at: string;
}

interface AdminReferralsTabProps {
  onRefresh?: () => void;
}

export const AdminReferralsTab = ({ onRefresh }: AdminReferralsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [waitlistData, setWaitlistData] = useState<WaitlistWithReferrals[]>([]);
  const [stats, setStats] = useState({
    totalCodes: 0,
    totalReferrals: 0,
    rewardsUnlocked: 0,
    conversionRate: 0,
  });

  const fetchData = async () => {
    try {
      // Fetch referral codes
      const { data: codes } = await supabase
        .from("referral_codes")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch waitlist with referral data
      const { data: waitlist } = await supabase
        .from("waitlist_signups")
        .select("id, name, email, referral_code, referral_count, invites_sent, reward_unlocked, referred_by_code, created_at")
        .order("referral_count", { ascending: false });

      if (codes) setReferralCodes(codes);
      if (waitlist) {
        setWaitlistData(waitlist);
        
        // Calculate stats
        const totalReferrals = waitlist.reduce((sum, w) => sum + (w.referral_count || 0), 0);
        const rewardsUnlocked = waitlist.filter(w => w.reward_unlocked).length;
        const totalInvites = waitlist.reduce((sum, w) => sum + (w.invites_sent || 0), 0);
        
        setStats({
          totalCodes: codes?.length || 0,
          totalReferrals,
          rewardsUnlocked,
          conversionRate: totalInvites > 0 ? Math.round((totalReferrals / totalInvites) * 100) : 0,
        });
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    onRefresh?.();
  };

  const filteredWaitlist = waitlistData.filter(
    w => 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topReferrers = waitlistData.filter(w => w.referral_count > 0).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCodes}</p>
                <p className="text-xs text-muted-foreground">Referral Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Successful Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rewardsUnlocked}</p>
                <p className="text-xs text-muted-foreground">Rewards Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      {topReferrers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {topReferrers.map((referrer, idx) => (
                <div
                  key={referrer.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50"
                >
                  <span className="font-bold text-violet-500">#{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{referrer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {referrer.referral_count} referrals
                    </p>
                  </div>
                  {referrer.reward_unlocked && (
                    <Badge className="bg-green-500/10 text-green-600 text-xs">🎁</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Users with Referral Codes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaitlist.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {user.referral_code || "N/A"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-violet-600">{user.referral_count}</span>
                        <span className="text-xs text-muted-foreground">/3</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.referred_by_code ? (
                        <Badge variant="outline" className="text-xs">
                          {user.referred_by_code}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.reward_unlocked ? (
                        <Badge className="bg-green-500/10 text-green-600 text-xs">
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Locked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => window.open(`/referral?email=${encodeURIComponent(user.email)}`, "_blank")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredWaitlist.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
