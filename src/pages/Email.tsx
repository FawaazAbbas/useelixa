import { useState, useEffect } from "react";
import { Mail, Send, Inbox, RefreshCw, Loader2, ArrowLeft, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  snippet: string;
  body?: string;
  date: string;
  isRead: boolean;
  labels: string[];
}

const Email = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);

  // Check Gmail connection
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        // Use raw query to avoid type recursion issues
        const result = await (supabase as any)
          .from("user_credentials")
          .select("id")
          .eq("user_id", user.id)
          .eq("provider", "google");
        
        setIsConnected(!result.error && result.data && result.data.length > 0);
      } catch {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, [user]);

  // Fetch emails
  const fetchEmails = async () => {
    if (!user || !isConnected) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-integration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: "list", params: { maxResults: 20 } }),
        }
      );

      const data = await response.json();
      
      if (data.emails) {
        setEmails(data.emails.map((email: any) => ({
          id: email.id,
          threadId: email.threadId,
          subject: email.subject || "(No Subject)",
          from: email.from || "Unknown",
          to: email.to || "",
          snippet: email.snippet || "",
          date: email.date || new Date().toISOString(),
          isRead: !email.labelIds?.includes("UNREAD"),
          labels: email.labelIds || [],
        })));
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchEmails();
    }
  }, [isConnected]);

  // Send email (requires HITL confirmation via chat)
  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      // Create a pending action for HITL approval
      const { data: { session } } = await supabase.auth.getSession();
      
      const insertData = {
        user_id: user?.id,
        session_id: "email-compose",
        tool_name: "gmail_send_email",
        tool_display_name: "Send Email",
        parameters: {
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
        },
        status: "pending",
      };
      
      const { error } = await supabase.from("pending_actions").insert(insertData as any);

      if (error) throw error;

      toast.success("Email queued for approval. Please approve it in Chat to send.");
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
    } catch (error) {
      console.error("Error queuing email:", error);
      toast.error("Failed to queue email");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  const extractName = (from: string) => {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].trim() : from.split("@")[0];
  };

  if (!isConnected) {
    return (
      <div className="flex h-screen bg-background">
        <MainNavSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Connect Gmail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Connect your Gmail account to view and manage your emails directly from Elixa.
              </p>
              <Button 
                className="w-full"
                onClick={() => window.location.href = "/connections"}
              >
                Go to Connections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedEmail && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Mail className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchEmails} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>New Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Input
                      placeholder="To"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Subject"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Write your message..."
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      rows={10}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendEmail} disabled={sending}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Queue for Approval
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className={cn(
            "w-full md:w-96 border-r flex-shrink-0 flex flex-col",
            selectedEmail && "hidden md:flex"
          )}>
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Inbox</span>
                <Badge variant="secondary" className="ml-auto">
                  {emails.filter(e => !e.isRead).length}
                </Badge>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {loading && emails.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No emails found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-accent transition-colors",
                        !email.isRead && "bg-primary/5",
                        selectedEmail?.id === email.id && "bg-accent"
                      )}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                          "text-sm truncate flex-1",
                          !email.isRead && "font-semibold"
                        )}>
                          {extractName(email.from)}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm truncate mt-1",
                        !email.isRead ? "font-medium" : "text-muted-foreground"
                      )}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {email.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Email Detail */}
          <div className={cn(
            "flex-1 flex flex-col",
            !selectedEmail && "hidden md:flex items-center justify-center"
          )}>
            {selectedEmail ? (
              <>
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{extractName(selectedEmail.from)}</span>
                    <span>•</span>
                    <span>{new Date(selectedEmail.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    To: {selectedEmail.to || "me"}
                  </p>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedEmail.body || selectedEmail.snippet}</p>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setComposeTo(selectedEmail.from);
                      setComposeSubject(`Re: ${selectedEmail.subject}`);
                      setComposeOpen(true);
                    }}
                  >
                    Reply
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                      setComposeBody(`\n\n---------- Forwarded message ----------\nFrom: ${selectedEmail.from}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.snippet}`);
                      setComposeOpen(true);
                    }}
                  >
                    Forward
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Email;
