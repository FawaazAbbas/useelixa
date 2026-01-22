import { useState, useEffect, useCallback } from "react";
import { Mail, Send, Inbox, RefreshCw, Loader2, ArrowLeft, Archive, Trash2, MailOpen, MailCheck, Star, StarOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  isStarred: boolean;
  labels: string[];
}

type FolderType = "inbox" | "starred" | "archive" | "trash";

const Email = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [activeFolder, setActiveFolder] = useState<FolderType>("inbox");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<Email | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_credentials")
          .select("id")
          .eq("user_id", user.id)
          .eq("credential_type", "google")
          .maybeSingle();
        
        setIsConnected(!error && !!data);
      } catch {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, [user]);

  const fetchEmails = useCallback(async () => {
    if (!user || !isConnected) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Map folder to Gmail label
      const labelMap: Record<FolderType, string> = {
        inbox: "INBOX",
        starred: "STARRED",
        archive: "",
        trash: "TRASH",
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-integration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ 
            action: "list", 
            params: { 
              maxResults: 30,
              labelIds: labelMap[activeFolder] ? [labelMap[activeFolder]] : undefined,
            } 
          }),
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
          body: email.body,
          date: email.date || new Date().toISOString(),
          isRead: !email.labelIds?.includes("UNREAD"),
          isStarred: email.labelIds?.includes("STARRED") || false,
          labels: email.labelIds || [],
        })));
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [user, isConnected, activeFolder]);

  useEffect(() => {
    if (isConnected) fetchEmails();
  }, [isConnected, fetchEmails]);

  const performEmailAction = async (emailId: string, action: string, addLabels?: string[], removeLabels?: string[]) => {
    setActionLoading(emailId);
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
          body: JSON.stringify({ 
            action: "modify", 
            params: { 
              id: emailId,
              addLabelIds: addLabels,
              removeLabelIds: removeLabels,
            } 
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      return true;
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} email`);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkRead = async (email: Email) => {
    const success = await performEmailAction(
      email.id, 
      email.isRead ? "mark unread" : "mark read",
      email.isRead ? ["UNREAD"] : undefined,
      email.isRead ? undefined : ["UNREAD"]
    );
    
    if (success) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: !e.isRead } : e));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, isRead: !email.isRead });
      }
      toast.success(email.isRead ? "Marked as unread" : "Marked as read");
    }
  };

  const handleStar = async (email: Email) => {
    const success = await performEmailAction(
      email.id,
      email.isStarred ? "unstar" : "star",
      email.isStarred ? undefined : ["STARRED"],
      email.isStarred ? ["STARRED"] : undefined
    );
    
    if (success) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isStarred: !e.isStarred } : e));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, isStarred: !email.isStarred });
      }
      toast.success(email.isStarred ? "Removed from starred" : "Added to starred");
    }
  };

  const handleArchive = async (email: Email) => {
    const success = await performEmailAction(email.id, "archive", undefined, ["INBOX"]);
    
    if (success) {
      setEmails(prev => prev.filter(e => e.id !== email.id));
      if (selectedEmail?.id === email.id) setSelectedEmail(null);
      toast.success("Email archived");
    }
  };

  const handleTrash = async () => {
    if (!emailToDelete) return;
    
    const success = await performEmailAction(emailToDelete.id, "trash", ["TRASH"], ["INBOX"]);
    
    if (success) {
      setEmails(prev => prev.filter(e => e.id !== emailToDelete.id));
      if (selectedEmail?.id === emailToDelete.id) setSelectedEmail(null);
      toast.success("Email moved to trash");
    }
    
    setDeleteDialogOpen(false);
    setEmailToDelete(null);
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const insertData = {
        user_id: user?.id,
        session_id: "email-compose",
        tool_name: "gmail_send_email",
        tool_display_name: "Send Email",
        parameters: { to: composeTo, subject: composeSubject, body: composeBody },
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
      <PageLayout title="Email" icon={Mail}>
        <PageEmptyState
          icon={Mail}
          title="Connect Gmail"
          description="Connect your Gmail account to view and manage your emails directly from Elixa."
          action={
            <Button onClick={() => navigate("/connections")}>
              Go to Connections
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const folderIcons: Record<FolderType, React.ReactNode> = {
    inbox: <Inbox className="h-4 w-4" />,
    starred: <Star className="h-4 w-4" />,
    archive: <Archive className="h-4 w-4" />,
    trash: <Trash2 className="h-4 w-4" />,
  };

  const Sidebar = () => (
    <>
      <div className="p-4 border-b bg-card">
        <Tabs value={activeFolder} onValueChange={(v) => setActiveFolder(v as FolderType)}>
          <TabsList className="grid grid-cols-4 w-full">
            {(["inbox", "starred", "archive", "trash"] as FolderType[]).map((folder) => (
              <TabsTrigger key={folder} value={folder} className="text-xs px-2">
                {folderIcons[folder]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="p-2 border-b flex items-center justify-between">
        <span className="text-sm font-medium capitalize px-2">
          {activeFolder}
          {activeFolder === "inbox" && emails.filter(e => !e.isRead).length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {emails.filter(e => !e.isRead).length}
            </Badge>
          )}
        </span>
        <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading} className="h-8 w-8">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {loading && emails.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No emails in {activeFolder}</p>
          </div>
        ) : (
          <div className="divide-y">
            {emails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors group relative",
                  !email.isRead && "bg-primary/5",
                  selectedEmail?.id === email.id ? "bg-primary/10" : "hover:bg-muted"
                )}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {email.isStarred && <Star className="h-3 w-3 text-warning fill-warning flex-shrink-0" />}
                    <span className={cn("text-sm truncate", !email.isRead && "font-semibold")}>
                      {extractName(email.from)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(email.date)}
                  </span>
                </div>
                <p className={cn("text-sm truncate mt-1", !email.isRead ? "font-medium" : "text-muted-foreground")}>
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">{email.snippet}</p>
                
                {/* Quick actions on hover */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); handleStar(email); }}
                    disabled={actionLoading === email.id}
                  >
                    {email.isStarred ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); handleArchive(email); }}
                    disabled={actionLoading === email.id}
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  return (
    <>
      <PageLayout
        title="Email"
        icon={Mail}
        badge={emails.filter(e => !e.isRead).length || undefined}
        sidebar={<Sidebar />}
        noPadding
        fullWidth
        actions={
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
                <Input placeholder="To" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} />
                <Input placeholder="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
                <Textarea placeholder="Write your message..." value={composeBody} onChange={(e) => setComposeBody(e.target.value)} rows={10} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
                  <Button onClick={handleSendEmail} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Queue for Approval
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)} className="-ml-2 md:hidden">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkRead(selectedEmail)}
                    disabled={actionLoading === selectedEmail.id}
                  >
                    {selectedEmail.isRead ? <MailCheck className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStar(selectedEmail)}
                    disabled={actionLoading === selectedEmail.id}
                  >
                  {selectedEmail.isStarred ? 
                    <Star className="h-4 w-4 text-warning fill-warning" /> : 
                    <Star className="h-4 w-4" />
                  }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArchive(selectedEmail)}
                    disabled={actionLoading === selectedEmail.id}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleMarkRead(selectedEmail)}>
                        {selectedEmail.isRead ? (
                          <>
                            <MailCheck className="h-4 w-4 mr-2" />
                            Mark as unread
                          </>
                        ) : (
                          <>
                            <MailOpen className="h-4 w-4 mr-2" />
                            Mark as read
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setEmailToDelete(selectedEmail);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Move to trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{extractName(selectedEmail.from)}</span>
                <span>•</span>
                <span>{new Date(selectedEmail.date).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">To: {selectedEmail.to || "me"}</p>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedEmail.body || selectedEmail.snippet}</p>
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setComposeTo(selectedEmail.from);
                setComposeSubject(`Re: ${selectedEmail.subject}`);
                setComposeOpen(true);
              }}>
                Reply
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                setComposeBody(`\n\n---------- Forwarded message ----------\nFrom: ${selectedEmail.from}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.snippet}`);
                setComposeOpen(true);
              }}>
                Forward
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center h-full">
            <PageEmptyState
              icon={Mail}
              title="Select an email"
              description="Choose an email from the list to view its contents"
            />
          </div>
        )}
      </PageLayout>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this email to trash? You can restore it from the trash folder later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTrash}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Email;
