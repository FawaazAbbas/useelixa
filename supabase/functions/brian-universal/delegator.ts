import { reviewAgentOutput, DEFAULT_QUALITY_CRITERIA } from "./quality-reviewer.ts";

export async function delegateToAgent(
  agentId: string,
  taskDescription: string,
  userId: string,
  workspaceId: string,
  chatId: string,
  supabase: any,
  previousAgentData?: any // PHASE 6: Inter-agent data passing
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

  // PHASE 6: Store execution context for data passing
  const executionContext: any = {
    task_description: taskDescription,
    agent_id: agentId,
    agent_name: agent.name,
    started_at: new Date().toISOString()
  };

  // Delegation and revision loop
  while (revisionCount <= maxRevisions) {
    console.log(`Attempt ${revisionCount + 1}/${maxRevisions + 1}`);

    // PHASE 6: Build message with context from previous agent if available
    let messageToAgent = revisionCount === 0 
      ? `[DELEGATED_BY_BRIAN]\n\n${taskDescription}` 
      : `[DELEGATED_BY_BRIAN] - REVISION REQUEST:\n${reviewResult.feedback}\n\nImprovements needed:\n${reviewResult.improvements_needed.join("\n")}\n\nOriginal request: ${taskDescription}`;
    
    // PHASE 6: Inject previous agent's data if available
    if (previousAgentData && revisionCount === 0) {
      messageToAgent += `\n\n[DATA FROM PREVIOUS AGENT]:\n${JSON.stringify(previousAgentData, null, 2)}`;
    }

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
          message: messageToAgent,
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

    // PHASE 6: Store agent output in execution context
    executionContext.output = agentOutput;
    executionContext.completed_at = new Date().toISOString();
    executionContext.processing_time_ms = agentResult.processingTime;

    // Find or create direct chat between user and target agent
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('agent_id', agentId)
      .eq('type', 'direct')
      .maybeSingle();

    let directChatId = existingChat?.id;

    // Create chat if it doesn't exist
    if (!directChatId) {
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          workspace_id: workspaceId,
          agent_id: agentId,
          type: 'direct',
          created_by: userId
        })
        .select('id')
        .single();

      if (chatError) {
        console.error('Error creating direct chat:', chatError);
      } else {
        directChatId = newChat.id;

        // Add user as participant
        await supabase.from('chat_participants').insert({
          chat_id: directChatId,
          user_id: userId
        });
      }
    }

    // Save delegation request and agent response to the direct chat
    if (directChatId) {
      // Save user's delegation request
      await supabase.from('messages').insert({
        chat_id: directChatId,
        content: `[Delegated by Brian]: ${taskDescription}`,
        user_id: userId
      });

      // Save agent's response
      await supabase.from('messages').insert({
        chat_id: directChatId,
        agent_id: agentId,
        content: agentOutput
      });
    }

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
      // PHASE 6: Return both output and execution context for chaining
      return JSON.stringify({
        approved: true,
        agent_output: agentOutput,
        execution_context: executionContext,
        message: `I've reviewed ${agent.name}'s work and it looks good. Here's what they delivered:\n\n${agentOutput}`
      });
    }

    revisionCount++;

    if (revisionCount > maxRevisions) {
      console.log("❌ Max revisions reached");
      return JSON.stringify({
        approved: false,
        agent_output: agentOutput,
        execution_context: executionContext,
        message: `I asked ${agent.name} to handle this, but after ${maxRevisions} attempts, the output still doesn't meet my quality standards. Here's what we have:\n\n${agentOutput}\n\n**My concerns:**\n${reviewResult.feedback}\n\nWould you like me to try a different agent, or would you like to provide more specific guidance?`
      });
    }
  }

  return JSON.stringify({
    approved: false,
    agent_output: agentOutput,
    execution_context: executionContext,
    message: agentOutput
  });
}
