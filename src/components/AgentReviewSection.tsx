import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

interface AgentReviewSectionProps {
  agentId: string;
}

export const AgentReviewSection = ({ agentId }: AgentReviewSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [agentId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("agent_reviews")
      .select(`
        id,
        rating,
        review_text,
        created_at,
        user_id,
        profiles (display_name)
      `)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as any);
      if (user) {
        const myReview = data.find((r: any) => r.user_id === user.id);
        if (myReview) {
          setUserReview(myReview as any);
          setRating(myReview.rating);
          setReviewText(myReview.review_text || "");
        }
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to leave a review",
      });
      return;
    }

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a rating before submitting",
      });
      return;
    }

    setSubmitting(true);

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from("agent_reviews")
          .update({ rating, review_text: reviewText })
          .eq("id", userReview.id);

        if (error) throw error;
        toast({ title: "Review updated successfully" });
      } else {
        // Create new review
        const { error } = await supabase
          .from("agent_reviews")
          .insert({ agent_id: agentId, user_id: user.id, rating, review_text: reviewText });

        if (error) throw error;
        toast({ title: "Review submitted successfully" });
      }

      await fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? (hoveredRating || rating) : currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              {renderStars(rating, true)}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
              <Textarea
                placeholder="Share your experience with this agent..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userReview ? "Update Review" : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this agent!
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.profiles?.display_name || "Anonymous"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-muted-foreground mt-3">{review.review_text}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};