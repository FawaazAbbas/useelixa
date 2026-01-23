import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
}

// Map common language aliases
const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
};

export const CodeBlock = ({ language, children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  
  // Normalize language name
  const normalizedLang = language ? (languageMap[language.toLowerCase()] || language.toLowerCase()) : 'text';
  const displayLang = normalizedLang === 'text' ? 'Plain Text' : normalizedLang;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if we're in dark mode
  const isDark = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <div className={cn("relative group rounded-lg overflow-hidden my-3 border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {displayLang}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1 text-primary" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Code Content */}
      <SyntaxHighlighter
        language={normalizedLang}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          }
        }}
        showLineNumbers={children.split('\n').length > 5}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'hsl(var(--muted-foreground))',
          opacity: 0.5,
        }}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
