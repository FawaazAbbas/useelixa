import { useState, useCallback } from 'react';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  session_id: string;
  session_title: string;
  message_id: string;
  content: string;
  role: string;
  created_at: string;
}

interface ChatSearchProps {
  userId: string;
  onSelectSession: (sessionId: string) => void;
  onClose: () => void;
  className?: string;
}

export const ChatSearch = ({ userId, onSelectSession, onClose, className }: ChatSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search messages with session info
      const { data, error } = await supabase
        .from('chat_messages_v2')
        .select(`
          id,
          content,
          role,
          created_at,
          session_id,
          chat_sessions_v2!inner(id, title, user_id)
        `)
        .eq('chat_sessions_v2.user_id', userId)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const searchResults: SearchResult[] = (data || []).map((item: any) => ({
        session_id: item.session_id,
        session_title: item.chat_sessions_v2?.title || 'Untitled',
        message_id: item.id,
        content: item.content,
        role: item.role,
        created_at: item.created_at,
      }));

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [userId]);

  // Trigger search when debounced query changes
  useState(() => {
    performSearch(debouncedQuery);
  });

  // Also search immediately for better UX
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2) {
      performSearch(value);
    } else {
      setResults([]);
    }
  };

  const handleSelectResult = (sessionId: string) => {
    onSelectSession(sessionId);
    onClose();
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() 
        ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
        : part
    );
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    
    // Try to find the search query and show context around it
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);
    
    if (matchIndex > -1) {
      const start = Math.max(0, matchIndex - 40);
      const end = Math.min(content.length, matchIndex + query.length + 100);
      return (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
    }
    
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className={cn("flex flex-col bg-card border-b", className)}>
      {/* Search Input */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleInputChange}
            placeholder="Search messages..."
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 max-h-80">
        <div className="p-2">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={result.message_id}
                  onClick={() => handleSelectResult(result.session_id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">
                      {result.session_title}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    <span className="text-xs font-medium text-foreground mr-1">
                      {result.role === 'user' ? 'You:' : 'Elixa:'}
                    </span>
                    {highlightMatch(truncateContent(result.content), query)}
                  </p>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages found matching "{query}"
            </p>
          ) : query.length > 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Type at least 2 characters to search
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Search across all your conversations
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSearch;
