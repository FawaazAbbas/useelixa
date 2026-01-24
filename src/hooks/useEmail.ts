import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to?: string;
  subject: string;
  snippet: string;
  date: string;
  body?: string;
  labelIds: string[];
  isUnread?: boolean;
}

export interface EmailLabel {
  id: string;
  name: string;
  type: string;
}

export interface EmailAccount {
  credential_id: string;
  account_email: string;
  provider: "gmail" | "outlook";
}

// Keep for backward compat
export type GmailAccount = EmailAccount;

export type EmailFolder = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "TRASH" | "SPAM" | "IMPORTANT";

// Folder name mapping for different providers
const OUTLOOK_FOLDER_MAP: Record<EmailFolder, string> = {
  INBOX: "Inbox",
  SENT: "SentItems", 
  DRAFT: "Drafts",
  STARRED: "Inbox", // Outlook uses flags, not folders for starred
  TRASH: "DeletedItems",
  SPAM: "JunkEmail",
  IMPORTANT: "Inbox", // Outlook doesn't have Important folder
};

interface UseEmailOptions {
  accountEmail?: string;
}

export const useEmail = (options: UseEmailOptions = {}) => {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [labels, setLabels] = useState<EmailLabel[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(options.accountEmail || null);
  const [currentProvider, setCurrentProvider] = useState<"gmail" | "outlook">("gmail");
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>("INBOX");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Load connected email accounts (Gmail and Outlook)
  const loadAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Gmail accounts
      const { data: gmailCredentials } = await supabase
        .from("user_credentials")
        .select("id, account_email")
        .eq("user_id", user.id)
        .eq("credential_type", "googleOAuth2Api");

      // Fetch Outlook accounts
      const { data: outlookCredentials } = await supabase
        .from("user_credentials")
        .select("id, account_email")
        .eq("user_id", user.id)
        .eq("credential_type", "microsoftOAuth2Api");

      const allAccounts: EmailAccount[] = [
        ...(gmailCredentials || [])
          .filter((c): c is { id: string; account_email: string } => !!c.account_email)
          .map((c) => ({
            credential_id: c.id,
            account_email: c.account_email,
            provider: "gmail" as const,
          })),
        ...(outlookCredentials || [])
          .filter((c): c is { id: string; account_email: string } => !!c.account_email)
          .map((c) => ({
            credential_id: c.id,
            account_email: c.account_email,
            provider: "outlook" as const,
          })),
      ];

      setAccounts(allAccounts);
      
      // Set default account if not set
      if (!currentAccount && allAccounts.length > 0) {
        setCurrentAccount(allAccounts[0].account_email);
        setCurrentProvider(allAccounts[0].provider);
      }
    } catch (error) {
      console.error("[useEmail] Failed to load accounts:", error);
    }
  }, [currentAccount]);

  // Fetch emails from the integration (Gmail or Outlook)
  const fetchEmails = useCallback(async (folder: EmailFolder = currentFolder, query?: string) => {
    if (!currentAccount) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      // Determine which function to call based on provider
      const functionName = currentProvider === "outlook" ? "microsoft-integration" : "gmail-integration";
      
      if (currentProvider === "outlook") {
        // Outlook API call
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            action: "list_emails",
            params: {
              folder: OUTLOOK_FOLDER_MAP[folder],
              top: 25,
              filter: query ? `contains(subject,'${query}') or contains(from/emailAddress/address,'${query}')` : undefined,
              accountEmail: currentAccount,
            },
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const emailMessages: EmailMessage[] = (data?.messages || []).map((msg: any) => ({
          id: msg.id,
          threadId: msg.conversationId || msg.id,
          from: msg.from?.emailAddress?.address || "",
          subject: msg.subject || "(No Subject)",
          snippet: msg.bodyPreview || "",
          date: msg.receivedDateTime || "",
          labelIds: msg.isRead ? [] : ["UNREAD"],
          isUnread: !msg.isRead,
        }));

        setMessages(emailMessages);
      } else {
        // Gmail API call
        const labelIds = folder === "STARRED" ? ["STARRED"] : 
                         folder === "TRASH" ? ["TRASH"] :
                         folder === "SPAM" ? ["SPAM"] :
                         folder === "IMPORTANT" ? ["IMPORTANT"] :
                         folder === "SENT" ? ["SENT"] :
                         folder === "DRAFT" ? ["DRAFT"] :
                         ["INBOX"];

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            action: "list",
            params: {
              labelIds,
              maxResults: 25,
              query: query || searchQuery,
              accountEmail: currentAccount,
            },
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const emailMessages: EmailMessage[] = (data?.messages || []).map((msg: any) => ({
          id: msg.id,
          threadId: msg.threadId,
          from: msg.from || "",
          subject: msg.subject || "(No Subject)",
          snippet: msg.snippet || "",
          date: msg.date || "",
          labelIds: msg.labelIds || [],
          isUnread: msg.labelIds?.includes("UNREAD"),
        }));

        setMessages(emailMessages);
        setNextPageToken(data?.nextPageToken || null);
      }
    } catch (error) {
      console.error("[useEmail] Fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load emails");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, currentFolder, currentProvider, searchQuery]);

  // Read a specific email
  const readEmail = useCallback(async (messageId: string) => {
    setIsLoadingMessage(true);
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "read",
          params: { messageId, accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const email: EmailMessage = {
        id: data.id,
        threadId: data.threadId,
        from: data.from,
        to: data.to,
        subject: data.subject || "(No Subject)",
        snippet: "",
        date: data.date,
        body: data.body,
        labelIds: data.labelIds || [],
        isUnread: data.labelIds?.includes("UNREAD"),
      };

      setSelectedMessage(email);

      // Mark as read if unread
      if (email.isUnread) {
        await markAsRead(messageId, true);
        // Update local state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isUnread: false, labelIds: m.labelIds.filter((l) => l !== "UNREAD") }
              : m
          )
        );
      }

      return email;
    } catch (error) {
      console.error("[useEmail] Read error:", error);
      toast.error("Failed to load email");
      return null;
    } finally {
      setIsLoadingMessage(false);
    }
  }, [currentAccount]);

  // Send email
  const sendEmail = useCallback(async (to: string, subject: string, body: string, cc?: string, bcc?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "send",
          params: { to, subject, body, cc, bcc, accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Email sent successfully");
      return data;
    } catch (error) {
      console.error("[useEmail] Send error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send email");
      throw error;
    }
  }, [currentAccount]);

  // Reply to email
  const replyToEmail = useCallback(async (messageId: string, body: string, replyAll?: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "reply",
          params: { messageId, body, replyAll, accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Reply sent successfully");
      return data;
    } catch (error) {
      console.error("[useEmail] Reply error:", error);
      toast.error("Failed to send reply");
      throw error;
    }
  }, [currentAccount]);

  // Mark as read/unread
  const markAsRead = useCallback(async (messageId: string, read: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "markRead",
          params: { messageId, read, accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                isUnread: !read,
                labelIds: read
                  ? m.labelIds.filter((l) => l !== "UNREAD")
                  : [...m.labelIds, "UNREAD"],
              }
            : m
        )
      );

      return data;
    } catch (error) {
      console.error("[useEmail] Mark read error:", error);
      throw error;
    }
  }, [currentAccount]);

  // Star/unstar email
  const toggleStar = useCallback(async (messageId: string, starred: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "modifyLabels",
          params: {
            messageId,
            addLabels: starred ? ["STARRED"] : [],
            removeLabels: starred ? [] : ["STARRED"],
            accountEmail: currentAccount,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                labelIds: starred
                  ? [...m.labelIds, "STARRED"]
                  : m.labelIds.filter((l) => l !== "STARRED"),
              }
            : m
        )
      );

      toast.success(starred ? "Email starred" : "Star removed");
      return data;
    } catch (error) {
      console.error("[useEmail] Star error:", error);
      toast.error("Failed to update star");
      throw error;
    }
  }, [currentAccount]);

  // Move to trash
  const trashEmail = useCallback(async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "trash",
          params: { messageId, accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Remove from local state
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }

      toast.success("Email moved to trash");
      return data;
    } catch (error) {
      console.error("[useEmail] Trash error:", error);
      toast.error("Failed to delete email");
      throw error;
    }
  }, [currentAccount, selectedMessage]);

  // Archive email
  const archiveEmail = useCallback(async (messageId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "modifyLabels",
          params: {
            messageId,
            removeLabels: ["INBOX"],
            accountEmail: currentAccount,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Remove from inbox view
      if (currentFolder === "INBOX") {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      }

      toast.success("Email archived");
      return data;
    } catch (error) {
      console.error("[useEmail] Archive error:", error);
      toast.error("Failed to archive email");
      throw error;
    }
  }, [currentAccount, currentFolder, selectedMessage]);

  // Fetch labels
  const fetchLabels = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-integration", {
        body: {
          action: "labels",
          params: { accountEmail: currentAccount },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLabels(data?.labels || []);
    } catch (error) {
      console.error("[useEmail] Labels error:", error);
    }
  }, [currentAccount]);

  // Search emails
  const searchEmails = useCallback(async (query: string) => {
    setSearchQuery(query);
    await fetchEmails(currentFolder, query);
  }, [currentFolder, fetchEmails]);

  // Change folder
  const changeFolder = useCallback((folder: EmailFolder) => {
    setCurrentFolder(folder);
    setSelectedMessage(null);
    fetchEmails(folder, searchQuery);
  }, [fetchEmails, searchQuery]);

  // Change account
  const changeAccount = useCallback((accountEmail: string) => {
    const account = accounts.find(a => a.account_email === accountEmail);
    setCurrentAccount(accountEmail);
    if (account) {
      setCurrentProvider(account.provider);
    }
    setSelectedMessage(null);
    setMessages([]);
  }, [accounts]);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Refresh emails when account or folder changes
  useEffect(() => {
    if (currentAccount) {
      fetchEmails();
    }
  }, [currentAccount, currentFolder]);

  return {
    // State
    messages,
    selectedMessage,
    labels,
    accounts,
    currentAccount,
    currentProvider,
    currentFolder,
    isLoading,
    isLoadingMessage,
    searchQuery,
    nextPageToken,

    // Setters
    setSelectedMessage,

    // Actions
    fetchEmails,
    readEmail,
    sendEmail,
    replyToEmail,
    markAsRead,
    toggleStar,
    trashEmail,
    archiveEmail,
    fetchLabels,
    searchEmails,
    changeFolder,
    changeAccount,
    loadAccounts,
  };
};
