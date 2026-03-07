/**
 * StreamingMessage
 *
 * Renders a live agent message bubble while the agent is working.
 * Shows: thinking state → tool call labels → streaming text → final state.
 *
 * Drop this file into: src/components/ai-employees/StreamingMessage.tsx
 */

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { ToolCallStatus } from '@/hooks/useAgentStream'

interface StreamingMessageProps {
  agentName: string
  agentAvatarColor?: string
  streamedText: string
  isStreaming: boolean
  activeToolCall: string | null
  toolCallHistory: ToolCallStatus[]
  error: string | null
}

const TOOL_LABELS: Record<string, string> = {
  send_email: 'Sending email',
  list_emails: 'Checking inbox',
  get_email: 'Reading email',
  create_task: 'Creating task',
  list_tasks: 'Checking tasks',
  create_note: 'Saving note',
  search_knowledge_base: 'Searching knowledge base',
}

function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? `Using ${name.replace(/_/g, ' ')}`
}

export function StreamingMessage({
  agentName,
  agentAvatarColor = 'bg-violet-500',
  streamedText,
  isStreaming,
  activeToolCall,
  toolCallHistory,
  error,
}: StreamingMessageProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll as text streams in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [streamedText])

  const initial = agentName.charAt(0).toUpperCase()

  return (
    <div className="flex items-start gap-3 px-4 py-3 group">
      {/* Agent avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
          agentAvatarColor
        )}
      >
        {initial}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 max-w-2xl">
        {/* Agent name */}
        <span className="text-xs font-semibold text-foreground">{agentName}</span>

        {/* Tool call history */}
        {toolCallHistory.length > 0 && (
          <div className="flex flex-col gap-1">
            {toolCallHistory.map((tool, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 text-xs px-2.5 py-1 rounded-md w-fit',
                  tool.status === 'calling' && 'bg-muted text-muted-foreground',
                  tool.status === 'done' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                  tool.status === 'error' && 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                )}
              >
                {tool.status === 'calling' && <SpinnerIcon />}
                {tool.status === 'done' && <CheckIcon />}
                {tool.status === 'error' && <XIcon />}
                <span>{toolLabel(tool.name)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Streaming text or thinking indicator */}
        <div className="rounded-xl rounded-tl-none bg-muted px-4 py-2.5 text-sm text-foreground">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : streamedText ? (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedText}</ReactMarkdown>
              {isStreaming && <BlinkingCursor />}
            </>
          ) : (
            <ThinkingDots agentName={agentName} activeToolCall={activeToolCall} />
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function BlinkingCursor() {
  return (
    <span className="ml-0.5 inline-block h-4 w-0.5 animate-blink bg-foreground align-middle" />
  )
}

function ThinkingDots({ agentName, activeToolCall }: { agentName: string; activeToolCall: string | null }) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      </span>
      <span className="text-xs">
        {activeToolCall ? toolLabel(activeToolCall) : `${agentName} is thinking`}
      </span>
    </span>
  )
}

function SpinnerIcon() {
  return (
    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
