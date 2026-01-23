import { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessageFeedbackProps {
  messageId: string;
  initialReaction?: "thumbs_up" | "thumbs_down" | null;
  className?: string;
}

export const MessageFeedback = ({
  messageId,
  initialReaction,
  className,
}: MessageFeedbackProps) => {
  const [reaction, setReaction] = useState<"thumbs_up" | "thumbs_down" | null>(
    initialReaction || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = useCallback(async (newReaction: "thumbs_up" | "thumbs_down") => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to provide feedback");
        return;
      }

      // If clicking same reaction, remove it
      if (reaction === newReaction) {
        const { error } = await supabase
          .from("message_feedback")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id);

        if (error) throw error;
        setReaction(null);
      } else {
        // Upsert the reaction
        const { error } = await supabase
          .from("message_feedback")
          .upsert({
            message_id: messageId,
            user_id: user.id,
            reaction: newReaction,
          }, {
            onConflict: "message_id,user_id"
          });

        if (error) throw error;
        setReaction(newReaction);
        
        if (newReaction === "thumbs_up") {
          toast.success("Thanks for the feedback!");
        }
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to save feedback");
    } finally {
      setIsSubmitting(false);
    }
  }, [messageId, reaction, isSubmitting]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 transition-colors",
          reaction === "thumbs_up" && "text-green-500 bg-green-500/10"
        )}
        onClick={() => handleReaction("thumbs_up")}
        disabled={isSubmitting}
        title="Good response"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 transition-colors",
          reaction === "thumbs_down" && "text-red-500 bg-red-500/10"
        )}
        onClick={() => handleReaction("thumbs_down")}
        disabled={isSubmitting}
        title="Poor response"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
};
