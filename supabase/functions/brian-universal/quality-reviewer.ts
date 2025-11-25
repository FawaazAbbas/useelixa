export const DEFAULT_QUALITY_CRITERIA = {
  email: [
    "Professional tone appropriate for recipient",
    "Clear subject line that summarizes content",
    "All required information included",
    "No spelling or grammar errors",
    "Appropriate sign-off"
  ],
  report: [
    "All requested data points included",
    "Data is accurate and up-to-date",
    "Clear structure with sections/headings",
    "Key insights highlighted",
    "Actionable conclusions"
  ],
  analysis: [
    "Methodology is sound",
    "Data sources are cited",
    "Conclusions are supported by data",
    "Limitations are acknowledged",
    "Recommendations are actionable"
  ],
  general: [
    "Fully addresses the user's request",
    "Information is accurate",
    "Response is clear and well-structured",
    "No obvious errors or omissions"
  ]
};

export async function reviewAgentOutput(
  agentName: string,
  originalRequest: string,
  agentOutput: string,
  qualityCriteria: string[] = DEFAULT_QUALITY_CRITERIA.general
): Promise<{ approved: boolean; feedback: string; score: number; improvements_needed: string[] }> {
  
  const reviewPrompt = `You are Brian, the AI COO reviewing work from ${agentName}.

ORIGINAL REQUEST: ${originalRequest}

AGENT OUTPUT:
${agentOutput}

QUALITY CRITERIA:
${qualityCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Review this output as a senior executive would. Consider:
1. Does it fully address the request?
2. Is the information accurate and complete?
3. Is it well-structured and clear?
4. Are there any obvious errors or omissions?
5. Would you be comfortable presenting this to the user?

Respond with JSON:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "Specific feedback if not approved",
  "improvements_needed": ["list", "of", "specific", "fixes"]
}`;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5-mini",
      messages: [
        { role: "system", content: "You are a quality reviewer. Respond only with valid JSON." },
        { role: "user", content: reviewPrompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Review failed: ${response.status}`);
  }

  const result = await response.json();
  const reviewResult = JSON.parse(result.choices[0].message.content);
  
  return reviewResult;
}
