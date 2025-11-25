import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, phase, agents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build agent context string
    const agentContext = agents && agents.length > 0 
      ? `\n\nAVAILABLE AGENTS:
${agents.map((a: any) => `- ${a.name}: ${a.description || 'No description'}
  Capabilities: [${(a.capabilities || []).join(', ')}]`).join('\n')}`
      : '';

    const systemPrompt = `You are Brian, a friendly and helpful AI task assistant. Your goal is to help users create tasks with appropriate automations.

PHASE: ${phase}
${agentContext}

If phase is "chat":
- Ask clarifying questions one at a time to understand:
  1. What the task is about
  2. The desired outcome
  3. If it's recurring or one-time
  4. Deadlines or urgency
  5. If they need it ASAP
- Based on their answers, suggest relevant automations
- When suggesting automations, you MUST intelligently assign the best-suited agent for each automation
- Analyze the automation requirements and match them against agent capabilities
- When you have enough information, respond with a JSON object containing the task summary

If phase is "summary":
- The user is reviewing the summary
- Handle modification requests
- Adjust automations based on feedback

When you have gathered sufficient information, respond with this EXACT JSON structure:
{
  "summary": {
    "title": "Task title",
    "description": "Task description",
    "priority": "low|medium|high",
    "due_date": "YYYY-MM-DD" (optional),
    "is_asap": boolean,
    "automations": [
      {
        "name": "Automation name",
        "description": "What it does",
        "instruction": "Specific AI instruction",
        "trigger": "manual|daily|weekly|on_completion",
        "agentId": "agent-uuid",
        "agentName": "Agent Name",
        "assignmentReason": "Brief explanation why this agent is best suited (e.g., 'Specializes in RSS feed extraction and news aggregation')"
      }
    ]
  }
}

Agent Assignment Guidelines:
- Match automation requirements to agent capabilities
- Consider the task type (data extraction, email, analysis, etc.)
- Provide clear, brief reasoning for each agent assignment
- If no agent perfectly matches, choose the closest fit and explain

Guidelines for suggesting automations:
- Data retrieval: web scraping, API calls, document parsing
- Notifications: email alerts, reminders, status updates
- AI analysis: text summarization, sentiment analysis, data insights
- Content generation: reports, summaries, recommendations

Be conversational, friendly, and helpful. Ask one question at a time. Keep responses concise.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Try to parse if it's a summary
    let parsedResponse: any = { response: assistantMessage };
    
    try {
      // Look for JSON in the response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*"summary"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary) {
          parsedResponse = parsed;
        }
      }
    } catch (e) {
      // Not JSON, treat as regular message
      console.log('Response is not JSON, treating as regular message');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in brian-task-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
