import { useState, useEffect } from "react";
import { Mail, Search, RefreshCw, PenSquare, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useEmail } from "@/hooks/useEmail";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EmailFolders, EmailList, EmailDetail, EmailCompose } from "@/components/email";
import { useIsMobile } from "@/hooks/use-mobile";

type EmailFolder = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "TRASH" | "SPAM" | "IMPORTANT";

const Email = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    messages,
    selectedMessage,
    accounts,
    currentAccount,
    currentFolder,
    isLoading,
    isLoadingMessage,
    searchQuery,
    setSelectedMessage,
    fetchEmails,
    readEmail,
    sendEmail,
    replyToEmail,
    toggleStar,
    trashEmail,
    archiveEmail,
    searchEmails,
    changeFolder,
    changeAccount,
  } = useEmail();

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"compose" | "reply" | "forward">("compose");
  const [composeInitialData, setComposeInitialData] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [localSearch, setLocalSearch] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Handle email selection
  const handleSelectEmail = async (message: typeof messages[0]) => {
    setSelectedMessage(message);
    await readEmail(message.id);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  // Handle compose
  const handleCompose = () => {
    setComposeMode("compose");
    setComposeInitialData({ to: "", subject: "", body: "" });
    setComposeOpen(true);
  };

  // Handle reply
  const handleReply = () => {
    if (!selectedMessage) return;
    const senderEmail = selectedMessage.from.match(/<(.+?)>/)?.[1] || selectedMessage.from;
    setComposeMode("reply");
    setComposeInitialData({
      to: senderEmail,
      subject: selectedMessage.subject.startsWith("Re:") 
        ? selectedMessage.subject 
        : `Re: ${selectedMessage.subject}`,
      body: `\n\n\n---\nOn ${selectedMessage.date}, ${selectedMessage.from} wrote:\n\n${selectedMessage.body || selectedMessage.snippet}`,
    });
    setComposeOpen(true);
  };

  // Handle reply all
  const handleReplyAll = () => {
    if (!selectedMessage) return;
    const senderEmail = selectedMessage.from.match(/<(.+?)>/)?.[1] || selectedMessage.from;
    const toAddresses = selectedMessage.to 
      ? [senderEmail, ...selectedMessage.to.split(",").map(e => e.trim())].join(", ")
      : senderEmail;
    setComposeMode("reply");
    setComposeInitialData({
      to: toAddresses,
      subject: selectedMessage.subject.startsWith("Re:") 
        ? selectedMessage.subject 
        : `Re: ${selectedMessage.subject}`,
      body: `\n\n\n---\nOn ${selectedMessage.date}, ${selectedMessage.from} wrote:\n\n${selectedMessage.body || selectedMessage.snippet}`,
    });
    setComposeOpen(true);
  };

  // Handle forward
  const handleForward = () => {
    if (!selectedMessage) return;
    setComposeMode("forward");
    setComposeInitialData({
      to: "",
      subject: selectedMessage.subject.startsWith("Fwd:") 
        ? selectedMessage.subject 
        : `Fwd: ${selectedMessage.subject}`,
      body: `\n\n\n---------- Forwarded message ----------\nFrom: ${selectedMessage.from}\nDate: ${selectedMessage.date}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.body || selectedMessage.snippet}`,
    });
    setComposeOpen(true);
  };

  // Handle send email
  const handleSendEmail = async (to: string, subject: string, body: string, cc?: string, bcc?: string) => {
    if (composeMode === "reply" && selectedMessage) {
      await replyToEmail(selectedMessage.id, body);
    } else {
      await sendEmail(to, subject, body, cc, bcc);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEmails(localSearch);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchEmails();
  };

  // Handle trash
  const handleTrash = async () => {
    if (!selectedMessage) return;
    await trashEmail(selectedMessage.id);
    setShowMobileDetail(false);
  };

  // Handle archive
  const handleArchive = async () => {
    if (!selectedMessage) return;
    await archiveEmail(selectedMessage.id);
    setShowMobileDetail(false);
  };

  // Handle star toggle
  const handleToggleStar = async (messageId?: string) => {
    const id = messageId || selectedMessage?.id;
    if (!id) return;
    const message = messages.find(m => m.id === id) || selectedMessage;
    if (!message) return;
    const isStarred = message.labelIds.includes("STARRED");
    await toggleStar(id, !isStarred);
  };

  // Handle back on mobile
  const handleMobileBack = () => {
    setShowMobileDetail(false);
    setSelectedMessage(null);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // No Gmail accounts connected
  if (accounts.length === 0 && !isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <MainNavSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Link2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Gmail</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Connect your Google account to view and manage your emails directly in Elixa.
          </p>
          <Button onClick={() => navigate("/connections")}>
            Go to Connections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <MainNavSidebar />

      {/* Folder Sidebar */}
      <div className={cn(
        "w-64 border-r flex-shrink-0 flex flex-col bg-card/50",
        isMobile && "hidden"
      )}>
        <div className="p-4 border-b">
          <Button onClick={handleCompose} className="w-full">
            <PenSquare className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        <EmailFolders
          currentFolder={currentFolder}
          onFolderChange={changeFolder}
          accounts={accounts}
          currentAccount={currentAccount}
          onAccountChange={changeAccount}
        />
      </div>

      {/* Email List */}
      <div className={cn(
        "w-96 border-r flex-shrink-0 flex flex-col bg-background",
        isMobile && showMobileDetail && "hidden",
        isMobile && !showMobileDetail && "flex-1 w-full"
      )}>
        {/* Search & Refresh */}
        <div className="p-3 border-b flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          {isMobile && (
            <Button onClick={handleCompose} size="icon">
              <PenSquare className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile account/folder selector */}
        {isMobile && (
          <div className="p-2 border-b">
            <EmailFolders
              currentFolder={currentFolder}
              onFolderChange={changeFolder}
              accounts={accounts}
              currentAccount={currentAccount}
              onAccountChange={changeAccount}
            />
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-auto">
          <EmailList
            messages={messages}
            selectedId={selectedMessage?.id || null}
            onSelect={handleSelectEmail}
            onToggleStar={(id, starred) => toggleStar(id, starred)}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Email Detail */}
      <div className={cn(
        "flex-1 flex flex-col bg-background",
        isMobile && !showMobileDetail && "hidden"
      )}>
        <EmailDetail
          message={selectedMessage}
          isLoading={isLoadingMessage}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
          onTrash={handleTrash}
          onArchive={handleArchive}
          onToggleStar={() => handleToggleStar()}
          onBack={isMobile ? handleMobileBack : undefined}
          isMobile={isMobile}
        />
      </div>

      {/* Compose Dialog */}
      <EmailCompose
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSend={handleSendEmail}
        initialTo={composeInitialData.to}
        initialSubject={composeInitialData.subject}
        initialBody={composeInitialData.body}
        mode={composeMode}
      />
    </div>
  );
};

export default Email;
