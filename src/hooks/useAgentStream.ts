/**
 * useAgentStream
 *
 * Subscribes to Supabase Realtime for a given conversation_id and
 * builds a live picture of what the agent is doing:
 * thinking → tool calls → streaming text → done
 *
 * Drop this file into: src/hooks/useAgentStream.ts
 * Import supabase from wherever your project initialises it.
 */

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type AgentEventType =
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'streaming'
  | 'done'
  | 'error'

export interface AgentEvent {
  id: string
  event_type: AgentEventType
  payload: Record<string, unknown>
  created_at: string
}

export interface ToolCallStatus {
  name: string
  status: 'calling' | 'done' | 'error'
}

export interface AgentStreamState {
  /** Is the agent currently processing? */
  isStreaming: boolean
  /** Accumulated streamed text so far */
  streamedText: string
  /** Tool currently being executed, null if none */
  activeToolCall: string | null
  /** History of all tool calls this turn */
  toolCallHistory: ToolCallStatus[]
  /** Raw events in order */
  events: AgentEvent[]
  /** True once a 'done' event arrives */
  isDone: boolean
  /** Set if an 'error' event arrives */
  error: string | null
}

const INITIAL_STATE: AgentStreamState = {
  isStreaming: false,
  streamedText: '',
  activeToolCall: null,
  toolCallHistory: [],
  events: [],
  isDone: false,
  error: null,
}

export function useAgentStream(conversationId: string | null): AgentStreamState {
  const [state, setState] = useState<AgentStreamState>(INITIAL_STATE)
  // Use a ref to hold mutable state for tool call tracking inside the callback
  const toolCallsRef = useRef<ToolCallStatus[]>([])

  useEffect(() => {
    if (!conversationId) return

    // Reset on new conversation
    setState(INITIAL_STATE)
    toolCallsRef.current = []

    const channel = supabase
      .channel(`agent-stream:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_events',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const event = payload.new as AgentEvent

          setState((prev) => {
            const events = [...prev.events, event]

            switch (event.event_type) {
              case 'thinking':
                return {
                  ...prev,
                  events,
                  isStreaming: true,
                  isDone: false,
                  error: null,
                }

              case 'tool_call': {
                const toolName = (event.payload.tool_name as string) ?? 'unknown tool'
                const newCall: ToolCallStatus = { name: toolName, status: 'calling' }
                toolCallsRef.current = [...toolCallsRef.current, newCall]
                return {
                  ...prev,
                  events,
                  activeToolCall: toolName,
                  toolCallHistory: [...toolCallsRef.current],
                }
              }

              case 'tool_result': {
                const toolName = (event.payload.tool_name as string) ?? ''
                const success = event.payload.success as boolean
                toolCallsRef.current = toolCallsRef.current.map((t) =>
                  t.name === toolName ? { ...t, status: success ? 'done' : 'error' } : t
                )
                return {
                  ...prev,
                  events,
                  activeToolCall: null,
                  toolCallHistory: [...toolCallsRef.current],
                }
              }

              case 'streaming':
                return {
                  ...prev,
                  events,
                  streamedText: prev.streamedText + ((event.payload.chunk as string) ?? ''),
                }

              case 'done':
                return {
                  ...prev,
                  events,
                  isStreaming: false,
                  activeToolCall: null,
                  isDone: true,
                }

              case 'error':
                return {
                  ...prev,
                  events,
                  isStreaming: false,
                  activeToolCall: null,
                  error: (event.payload.message as string) ?? 'An error occurred',
                }

              default:
                return { ...prev, events }
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return state
}
