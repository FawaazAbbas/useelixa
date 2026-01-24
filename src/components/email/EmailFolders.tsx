import { Inbox, Send, FileEdit, Star, Trash2, AlertCircle, Flag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { GmailAccount } from "@/hooks/useEmail";

type EmailFolder = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "TRASH" | "SPAM" | "IMPORTANT";

interface FolderItem {
  id: EmailFolder;
  label: string;
  icon: React.ReactNode;
}

const folders: FolderItem[] = [
  { id: "INBOX", label: "Inbox", icon: <Inbox className="h-4 w-4" /> },
  { id: "STARRED", label: "Starred", icon: <Star className="h-4 w-4" /> },
  { id: "SENT", label: "Sent", icon: <Send className="h-4 w-4" /> },
  { id: "DRAFT", label: "Drafts", icon: <FileEdit className="h-4 w-4" /> },
  { id: "IMPORTANT", label: "Important", icon: <Flag className="h-4 w-4" /> },
  { id: "SPAM", label: "Spam", icon: <AlertCircle className="h-4 w-4" /> },
  { id: "TRASH", label: "Trash", icon: <Trash2 className="h-4 w-4" /> },
];

interface EmailFoldersProps {
  currentFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  accounts: GmailAccount[];
  currentAccount: string | null;
  onAccountChange: (accountEmail: string) => void;
}

export const EmailFolders = ({
  currentFolder,
  onFolderChange,
  accounts,
  currentAccount,
  onAccountChange,
}: EmailFoldersProps) => {
  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Account Switcher */}
      {accounts.length > 0 && (
        <div className="p-4 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {currentAccount ? getInitials(currentAccount) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">
                    {currentAccount || "Select account"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.credential_id}
                  onClick={() => onAccountChange(account.account_email)}
                  className={cn(
                    "cursor-pointer",
                    currentAccount === account.account_email && "bg-accent"
                  )}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">
                      {getInitials(account.account_email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{account.account_email}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Folders */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                currentFolder === folder.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {folder.icon}
              <span>{folder.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
