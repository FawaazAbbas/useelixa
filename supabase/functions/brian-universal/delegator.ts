import { reviewAgentOutput, DEFAULT_QUALITY_CRITERIA } from "./quality-reviewer.ts";

export async function delegateToAgent(
  agentId: string,
  taskDescription: string,
  userId: string,
  workspaceId: string,
  chatId: string,
  supabase: any
): Promise<string> {
  console.log(`Brian delegating to agent ${agentId}: ${taskDescription}`);

  // Get agent details
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single();

  if (!agent) {
    return "Agent not found";
  }

  // Determine quality criteria based on task type
  let qualityCriteria = DEFAULT_QUALITY_CRITERIA.general;
  const taskLower = taskDescription.toLowerCase();
  if (taskLower.includes("email") || taskLower.includes("send")) {
    qualityCriteria = DEFAULT_QUALITY_CRITERIA.email;
  } else if (taskLower.includes("report") || taskLower.includes("data")) {
    qualityCriteria = DEFAULT_QUALITY_CRITERIA.report;
  } else if (taskLower.includes("analysis") || taskLower.includes("analyze")) {
    qualityCriteria = DEFAULT_QUALITY_CRITERIA.analysis;
  }

  let agentOutput = "";
  let reviewResult: any = null;
  let revisionCount = 0;
  const maxRevisions = 3;

  // Delegation and revision loop
  while (revisionCount <= maxRevisions) {
    console.log(`Attempt ${revisionCount + 1}/${maxRevisions + 1}`);

    // Call the agent via route-to-agent
    const routeResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/route-to-agent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          message: revisionCount === 0 
            ? `[DELEGATED_BY_BRIAN]\n\n${taskDescription}` 
            : `[DELEGATED_BY_BRIAN] - REVISION REQUEST:\n${reviewResult.feedback}\n\nImprovements needed:\n${reviewResult.improvements_needed.join("\n")}\n\nOriginal request: ${taskDescription}`,
          agent_id: agentId,
          chat_id: chatId,
          user_id: userId,
          workspace_id: workspaceId,
          chat_type: "direct",
        }),
      }
    );

    if (!routeResponse.ok) {
      throw new Error(`Agent execution failed: ${routeResponse.status}`);
    }

    const agentResult = await routeResponse.json();
    agentOutput = agentResult.response || agentResult.content || "No response from agent";

    // Brian reviews the output
    reviewResult = await reviewAgentOutput(
      agent.name,
      taskDescription,
      agentOutput,
      qualityCriteria
    );

    console.log(`Review result - Approved: ${reviewResult.approved}, Score: ${reviewResult.score}`);

    if (reviewResult.approved) {
      console.log("✅ Output approved by Brian");
      return `I've reviewed ${agent.name}'s work and it looks good. Here's what they delivered:\n\n${agentOutput}`;
    }

    revisionCount++;

    if (revisionCount > maxRevisions) {
      console.log("❌ Max revisions reached");
      return `I asked ${agent.name} to handle this, but after ${maxRevisions} attempts, the output still doesn't meet my quality standards. Here's what we have:\n\n${agentOutput}\n\n**My concerns:**\n${reviewResult.feedback}\n\nWould you like me to try a different agent, or would you like to provide more specific guidance?`;
    }
  }

  return agentOutput;
}
