import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  name: string;
  referral_count: number;
  reward_unlocked: boolean;
  rank: number;
}

interface ReferralLeaderboardProps {
  userEmail?: string;
}

export const ReferralLeaderboard = ({ userEmail }: ReferralLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase.rpc("get_referral_leaderboard", { limit_count: 10 });
        
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          setLeaderboard(data as LeaderboardEntry[]);
          
          // Find user's rank if email provided
          if (userEmail) {
            const { data: userData } = await supabase
              .from("waitlist_signups")
              .select("referral_count")
              .eq("email", userEmail)
              .maybeSingle();
            
            if (userData) {
              const { count } = await supabase
                .from("waitlist_signups")
                .select("*", { count: "exact", head: true })
                .gt("referral_count", userData.referral_count);
              
              setUserRank((count || 0) + 1);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userEmail]);

  const maskName = (name: string) => {
    if (name.length <= 3) return name[0] + "***";
    const parts = name.split(" ");
    return parts.map(part => 
      part.length > 1 ? part[0] + "***" + (part.length > 3 ? part[part.length - 1] : "") : part
    ).join(" ");
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Be the first to climb the leaderboard!</p>
            <p className="text-xs mt-1">Share your code to start referring</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Referrers
          </div>
          {userRank && (
            <span className="text-xs font-normal text-muted-foreground">
              Your rank: #{userRank}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
              entry.rank <= 3 ? "bg-gradient-to-r from-violet-500/5 to-purple-500/5" : "bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <span className="text-sm font-medium">{maskName(entry.name)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-violet-600">{entry.referral_count}</span>
              {entry.reward_unlocked && (
                <span className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">
                  🎁
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
