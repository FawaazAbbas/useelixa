import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, MessageSquare, User, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/chat/CodeBlock";
import ElixaResponded from "@/assets/Elixa-Responded.png";

interface SharedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface SharedChatData {
  session_title: string;
  messages: SharedMessage[];
  created_at: string;
}

const SharedChat = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatData, setChatData] = useState<SharedChatData | null>(null);

  useEffect(() => {
    const loadSharedChat = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        // Get the shared chat info
        const { data: sharedChat, error: shareError } = await supabase
          .from("shared_chats")
          .select("session_id, is_public, expires_at, view_count")
          .eq("share_token", shareToken)
          .single();

        if (shareError || !sharedChat) {
          setError("This shared chat doesn't exist or has been deleted");
          setIsLoading(false);
          return;
        }

        if (!sharedChat.is_public) {
          setError("This chat is no longer public");
          setIsLoading(false);
          return;
        }

        if (sharedChat.expires_at && new Date(sharedChat.expires_at) < new Date()) {
          setError("This share link has expired");
          setIsLoading(false);
          return;
        }

        // Get the session title
        const { data: session } = await supabase
          .from("chat_sessions_v2")
          .select("title, created_at")
          .eq("id", sharedChat.session_id)
          .single();

        // Get the messages
        const { data: messages, error: msgError } = await supabase
          .from("chat_messages_v2")
          .select("id, role, content, created_at")
          .eq("session_id", sharedChat.session_id)
          .order("created_at", { ascending: true });

        if (msgError) {
          setError("Failed to load chat messages");
          setIsLoading(false);
          return;
        }

        setChatData({
          session_title: session?.title || "Shared Chat",
          messages: (messages || []) as SharedMessage[],
          created_at: session?.created_at || new Date().toISOString(),
        });

        // Increment view count
        await supabase
          .from("shared_chats")
          .update({ view_count: (sharedChat.view_count || 0) + 1 })
          .eq("share_token", shareToken);

      } catch (err) {
        console.error("Error loading shared chat:", err);
        setError("An error occurred while loading the chat");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedChat();
  }, [shareToken]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      const isBlock = match || codeContent.includes('\n');
      
      if (isBlock) {
        return (
          <CodeBlock language={match?.[1] || 'text'}>
            {codeContent}
          </CodeBlock>
        );
      }
      
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Unable to Load Chat</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">{chatData.session_title}</h1>
              <p className="text-xs text-muted-foreground">
                Shared chat • {new Date(chatData.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {chatData.messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  isUser && "flex-row-reverse"
                )}
              >
                {isUser ? (
                  <div className="h-9 w-9 rounded-full bg-muted border-2 border-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={ElixaResponded}
                    alt="Elixa"
                    className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-muted bg-muted"
                  />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    isUser ? "bg-muted text-foreground" : "bg-muted"
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:p-0 [&_pre]:m-0 [&_pre]:bg-transparent">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {message.content || " "}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            This is a read-only view of a shared conversation with{" "}
            <a href="/" className="text-primary hover:underline">
              Elixa AI
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedChat;
