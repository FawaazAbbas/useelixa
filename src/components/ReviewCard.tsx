import { useState } from "react";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export const ReviewCard = ({
  userName,
  userAvatar,
  rating,
  title,
  content,
  date,
  helpful,
  verified
}: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const shouldTruncate = content.length > 200;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.slice(0, 200) + "...";

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userAvatar}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{userName}</span>
                  {verified && (
                    <Badge variant="secondary" className="gap-1 text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayContent}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpful}
                disabled={hasVoted}
                className={`gap-2 ${hasVoted ? 'text-primary' : ''}`}
              >
                <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-primary' : ''}`} />
                <span className="text-xs">Helpful ({helpfulCount})</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
