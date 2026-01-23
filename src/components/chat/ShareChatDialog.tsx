import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Link2, Globe, Lock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
}

interface ShareData {
  id: string;
  share_token: string;
  is_public: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

export const ShareChatDialog = ({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
}: ShareChatDialogProps) => {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing share data
  useEffect(() => {
    if (open && sessionId) {
      loadShareData();
    }
  }, [open, sessionId]);

  const loadShareData = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_chats")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;
      setShareData(data as ShareData | null);
    } catch (error) {
      console.error("Error loading share data:", error);
    }
  };

  const createShareLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("shared_chats")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setShareData(data as ShareData);
      toast.success("Share link created!");
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const togglePublic = useCallback(async () => {
    if (!shareData) return;

    try {
      const newPublicState = !shareData.is_public;
      const { error } = await supabase
        .from("shared_chats")
        .update({ is_public: newPublicState })
        .eq("id", shareData.id);

      if (error) throw error;
      
      setShareData({ ...shareData, is_public: newPublicState });
      toast.success(newPublicState ? "Link is now public" : "Link is now private");
    } catch (error) {
      console.error("Error updating share:", error);
      toast.error("Failed to update share settings");
    }
  }, [shareData]);

  const deleteShareLink = useCallback(async () => {
    if (!shareData) return;

    try {
      const { error } = await supabase
        .from("shared_chats")
        .delete()
        .eq("id", shareData.id);

      if (error) throw error;
      
      setShareData(null);
      toast.success("Share link deleted");
    } catch (error) {
      console.error("Error deleting share:", error);
      toast.error("Failed to delete share link");
    }
  }, [shareData]);

  const shareUrl = shareData
    ? `${window.location.origin}/shared/${shareData.share_token}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Chat
          </DialogTitle>
          <DialogDescription>
            Share "{sessionTitle}" with others via a link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shareData ? (
            <>
              {/* Share link input */}
              <div className="flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  asChild
                >
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Public/Private toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {shareData.is_public ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="public-toggle">
                    {shareData.is_public ? "Anyone with link can view" : "Link is private"}
                  </Label>
                </div>
                <Switch
                  id="public-toggle"
                  checked={shareData.is_public}
                  onCheckedChange={togglePublic}
                />
              </div>

              {/* Stats */}
              <div className="text-sm text-muted-foreground">
                Viewed {shareData.view_count} {shareData.view_count === 1 ? "time" : "times"} • 
                Created {new Date(shareData.created_at).toLocaleDateString()}
              </div>

              {/* Delete button */}
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={deleteShareLink}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Share Link
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Create a shareable link for this conversation
              </p>
              <Button onClick={createShareLink} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Share Link"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
