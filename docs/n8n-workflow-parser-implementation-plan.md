# n8n Workflow Parser Implementation Plan

## Overview
Transform n8n workflow JSON into executable Lovable AI tool definitions with OAuth credential injection, enabling agents to have unique capabilities defined by their workflows.

## Architecture

```
User Message → route-to-agent → Parse Workflow → Generate Tools → Inject Credentials → Lovable AI → Execute Tools → Response
```

## Phase 1: Workflow Parser Core

### 1.1 Create Workflow Parser Function
**Location:** `supabase/functions/route-to-agent/workflow-parser.ts`

```typescript
interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

interface ParsedWorkflow {
  nodes: N8nNode[];
  connections: Record<string, any>;
  requiredCredentials: string[];
}

export function parseN8nWorkflow(workflowJson: any): ParsedWorkflow {
  const nodes = workflowJson.nodes || [];
  const connections = workflowJson.connections || {};
  
  // Extract all unique credential requirements
  const requiredCredentials = new Set<string>();
  nodes.forEach(node => {
    if (node.credentials) {
      Object.values(node.credentials).forEach(cred => {
        if (typeof cred === 'string') requiredCredentials.add(cred);
      });
    }
  });
  
  return {
    nodes,
    connections,
    requiredCredentials: Array.from(requiredCredentials)
  };
}
```

### 1.2 Node Type Mapping
**Location:** `supabase/functions/route-to-agent/node-mappings.ts`

```typescript
export const NODE_TO_TOOL_MAP: Record<string, (node: N8nNode) => LovableAITool> = {
  'n8n-nodes-base.httpRequest': (node) => ({
    type: 'function',
    function: {
      name: `http_${node.name.toLowerCase().replace(/\s+/g, '_')}`,
      description: `Make HTTP request to ${node.parameters.url}`,
      parameters: {
        type: 'object',
        properties: {
          // Extract from node.parameters
        }
      }
    }
  }),
  
  'n8n-nodes-base.notion': (node) => ({
    type: 'function',
    function: {
      name: `notion_${node.parameters.operation || 'query'}`,
      description: `Interact with Notion: ${node.parameters.operation}`,
      parameters: {
        type: 'object',
        properties: {
          database_id: { type: 'string' },
          query: { type: 'object' }
        }
      }
    }
  }),
  
  'n8n-nodes-base.slack': (node) => ({
    type: 'function',
    function: {
      name: `slack_${node.parameters.operation || 'send'}`,
      description: `Slack operation: ${node.parameters.operation}`,
      parameters: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }),
  
  // Add more node types as needed
};

export function convertNodeToTool(node: N8nNode): LovableAITool | null {
  const converter = NODE_TO_TOOL_MAP[node.type];
  return converter ? converter(node) : null;
}
```

## Phase 2: Credential Management

### 2.1 Database Schema Update
**Migration:** Add OAuth token storage to `agent_configurations`

```sql
-- agent_configurations.configuration will store:
-- {
--   "credentials": {
--     "notion": {
--       "access_token": "secret_...",
--       "workspace_id": "..."
--     },
--     "slack": {
--       "access_token": "xoxb-...",
--       "team_id": "..."
--     }
--   }
-- }
```

### 2.2 Credential Extraction
**Location:** `supabase/functions/route-to-agent/credential-extractor.ts`

```typescript
interface CredentialPlaceholder {
  credentialType: string; // 'notion', 'slack', etc.
  nodeId: string;
  parameterPath: string; // 'authentication.token'
}

export function extractCredentialPlaceholders(
  workflow: ParsedWorkflow
): CredentialPlaceholder[] {
  const placeholders: CredentialPlaceholder[] = [];
  
  workflow.nodes.forEach(node => {
    if (node.credentials) {
      Object.entries(node.credentials).forEach(([type, credName]) => {
        placeholders.push({
          credentialType: type,
          nodeId: node.id,
          parameterPath: getCredentialPath(node, type)
        });
      });
    }
  });
  
  return placeholders;
}

export async function fetchUserCredentials(
  agentInstallationId: string,
  supabase: any
): Promise<Record<string, any>> {
  const { data } = await supabase
    .from('agent_configurations')
    .select('configuration')
    .eq('agent_installation_id', agentInstallationId)
    .single();
    
  return data?.configuration?.credentials || {};
}
```

## Phase 3: Tool Injection & Execution

### 3.1 Tool Definition Generator
**Location:** `supabase/functions/route-to-agent/tool-generator.ts`

```typescript
export function generateToolDefinitions(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): LovableAITool[] {
  const tools: LovableAITool[] = [];
  
  workflow.nodes.forEach(node => {
    const tool = convertNodeToTool(node);
    if (tool) {
      // Inject credential references
      if (node.credentials) {
        tool.function.credentials = {};
        Object.keys(node.credentials).forEach(credType => {
          tool.function.credentials[credType] = userCredentials[credType];
        });
      }
      tools.push(tool);
    }
  });
  
  return tools;
}
```

### 3.2 Tool Execution Handler
**Location:** `supabase/functions/route-to-agent/tool-executor.ts`

```typescript
export async function executeToolCall(
  toolCall: any,
  toolDefinitions: LovableAITool[]
): Promise<any> {
  const tool = toolDefinitions.find(t => t.function.name === toolCall.function.name);
  if (!tool) throw new Error(`Tool not found: ${toolCall.function.name}`);
  
  const credentials = tool.function.credentials;
  const args = JSON.parse(toolCall.function.arguments);
  
  // Execute based on tool type
  if (toolCall.function.name.startsWith('http_')) {
    return await executeHttpRequest(args, credentials);
  } else if (toolCall.function.name.startsWith('notion_')) {
    return await executeNotionRequest(args, credentials);
  } else if (toolCall.function.name.startsWith('slack_')) {
    return await executeSlackRequest(args, credentials);
  }
  
  throw new Error(`Unknown tool type: ${toolCall.function.name}`);
}

async function executeHttpRequest(args: any, credentials: any): Promise<any> {
  const headers: Record<string, string> = {};
  
  // Inject credentials into headers if available
  if (credentials?.authorization) {
    headers['Authorization'] = credentials.authorization;
  }
  
  const response = await fetch(args.url, {
    method: args.method || 'GET',
    headers: { ...headers, ...args.headers },
    body: args.body ? JSON.stringify(args.body) : undefined
  });
  
  return await response.json();
}

async function executeNotionRequest(args: any, credentials: any): Promise<any> {
  const response = await fetch(`https://api.notion.com/v1/databases/${args.database_id}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.notion.access_token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args.query || {})
  });
  
  return await response.json();
}
```

## Phase 4: Update route-to-agent

### 4.1 Enhanced route-to-agent Function
**Location:** `supabase/functions/route-to-agent/index.ts`

```typescript
serve(async (req) => {
  // ... existing CORS and request parsing ...
  
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agent_id)
    .single();
    
  if (agent.is_workflow_based && agent.workflow_json) {
    // NEW: Workflow-based agent execution
    
    // 1. Parse workflow
    const parsedWorkflow = parseN8nWorkflow(agent.workflow_json);
    
    // 2. Fetch user credentials
    const { data: installation } = await supabase
      .from('agent_installations')
      .select('id')
      .eq('agent_id', agent_id)
      .eq('user_id', user_id)
      .single();
      
    const userCredentials = await fetchUserCredentials(
      installation.id,
      supabase
    );
    
    // 3. Generate tool definitions with injected credentials
    const tools = generateToolDefinitions(parsedWorkflow, userCredentials);
    
    // 4. Build system prompt from workflow description
    const systemPrompt = `You are ${agent.name}. ${agent.description}\n
Available capabilities:\n
${tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}\n
Use these tools to help the user accomplish their tasks.`;
    
    // 5. Call Lovable AI with tools
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...previousMessages,
          { role: 'user', content: message }
        ],
        tools: tools,
        tool_choice: 'auto'
      })
    });
    
    const result = await aiResponse.json();
    
    // 6. Handle tool calls
    if (result.choices[0].message.tool_calls) {
      const toolResults = await Promise.all(
        result.choices[0].message.tool_calls.map(toolCall =>
          executeToolCall(toolCall, tools)
        )
      );
      
      // Send tool results back to AI for final response
      const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...previousMessages,
            { role: 'user', content: message },
            result.choices[0].message,
            ...toolResults.map((result, i) => ({
              role: 'tool',
              tool_call_id: result.choices[0].message.tool_calls[i].id,
              content: JSON.stringify(result)
            }))
          ]
        })
      });
      
      agentResponse = (await finalResponse.json()).choices[0].message.content;
    } else {
      agentResponse = result.choices[0].message.content;
    }
    
    // ... save to database ...
  } else if (agent.webhook_url) {
    // ... existing webhook logic ...
  }
});
```

## Phase 5: OAuth Connection UI

### 5.1 Agent Configuration Component
**Location:** `src/components/AgentOAuthSetup.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface AgentOAuthSetupProps {
  agentId: string;
  installationId: string;
  requiredCredentials: string[];
}

export function AgentOAuthSetup({ 
  agentId, 
  installationId, 
  requiredCredentials 
}: AgentOAuthSetupProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const handleConnect = async (credentialType: string) => {
    setConnecting(credentialType);
    
    // Trigger OAuth flow
    const redirectUrl = `${window.location.origin}/oauth/callback`;
    const authUrl = getOAuthUrl(credentialType, redirectUrl, installationId);
    
    window.location.href = authUrl;
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Connect Your Accounts</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This agent needs access to the following services:
      </p>
      
      <div className="space-y-2">
        {requiredCredentials.map(cred => (
          <div key={cred} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-3">
              <CredentialIcon type={cred} />
              <span className="capitalize">{cred}</span>
            </div>
            <Button
              onClick={() => handleConnect(cred)}
              disabled={connecting !== null}
            >
              {connecting === cred ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### 5.2 OAuth Callback Handler
**Location:** `src/pages/OAuthCallback.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // Contains installationId
      const credentialType = searchParams.get('type');
      
      if (!code || !state || !credentialType) {
        console.error('Missing OAuth parameters');
        return;
      }
      
      // Exchange code for token via edge function
      const { data, error } = await supabase.functions.invoke('exchange-oauth-token', {
        body: { code, credentialType, installationId: state }
      });
      
      if (error) {
        console.error('OAuth exchange failed:', error);
        return;
      }
      
      // Redirect back to agent detail
      navigate(`/agents/${data.agentId}`);
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  return <div>Completing authentication...</div>;
}
```

### 5.3 OAuth Token Exchange Function
**Location:** `supabase/functions/exchange-oauth-token/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { code, credentialType, installationId } = await req.json();
  
  // Exchange code for access token
  const tokenResponse = await fetch(getTokenUrl(credentialType), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_ID`),
      client_secret: Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_SECRET`),
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code'
    })
  });
  
  const tokens = await tokenResponse.json();
  
  // Store in agent_configurations
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: existingConfig } = await supabase
    .from('agent_configurations')
    .select('configuration')
    .eq('agent_installation_id', installationId)
    .single();
    
  const newConfig = {
    ...existingConfig?.configuration,
    credentials: {
      ...existingConfig?.configuration?.credentials,
      [credentialType]: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000
      }
    }
  };
  
  await supabase
    .from('agent_configurations')
    .upsert({
      agent_installation_id: installationId,
      configuration: newConfig
    });
    
  return new Response(JSON.stringify({ success: true }));
});
```

## Phase 6: Multi-Agent Support

### 6.1 Update for Multiple Agents
Once multi-agent chats are supported, modify `route-to-agent` to:

```typescript
// Fetch all agents in chat
const { data: chatAgents } = await supabase
  .from('chat_agents')
  .select(`
    agent_id,
    agents:agent_id (*)
  `)
  .eq('chat_id', chat_id);

// Generate combined tool set from all workflow-based agents
const allTools = [];
for (const { agents: agent } of chatAgents) {
  if (agent.is_workflow_based && agent.workflow_json) {
    const tools = await generateToolsForAgent(agent, user_id);
    allTools.push(...tools);
  }
}

// Call Lovable AI with combined tool set
// AI will intelligently choose which agent's tools to use
```

## Implementation Order

### Sprint 1: Foundation (Week 1)
- [ ] Create workflow parser (`parseN8nWorkflow`)
- [ ] Build node type mappings (`node-mappings.ts`)
- [ ] Create tool generator (`generateToolDefinitions`)
- [ ] Update `process-workflow` to extract `requiredCredentials`

### Sprint 2: Execution (Week 2)
- [ ] Build tool executor (`executeToolCall`)
- [ ] Implement HTTP request execution
- [ ] Add Notion API execution
- [ ] Add Slack API execution
- [ ] Update `route-to-agent` with workflow parsing

### Sprint 3: OAuth (Week 3)
- [ ] Create `AgentOAuthSetup` component
- [ ] Build OAuth callback page
- [ ] Create `exchange-oauth-token` edge function
- [ ] Add OAuth secrets (Notion, Slack client IDs/secrets)
- [ ] Test end-to-end OAuth flow

### Sprint 4: Polish (Week 4)
- [ ] Add error handling and validation
- [ ] Create credential management UI
- [ ] Add token refresh logic
- [ ] Write tests
- [ ] Documentation

## Testing Strategy

### Unit Tests
- Workflow parser with various n8n JSON formats
- Node type conversion accuracy
- Credential extraction logic
- Tool execution with mocked APIs

### Integration Tests
- End-to-end OAuth flow
- Workflow execution with real credentials
- Multi-node workflow execution
- Error handling (missing credentials, API failures)

### Manual Tests
- Install agent with workflow
- Connect OAuth accounts
- Send messages that trigger tools
- Verify tool execution and responses
- Test multi-agent chats with combined tools

## Success Metrics
- [ ] Workflow JSON successfully parsed into tool definitions
- [ ] OAuth credentials securely stored and injected
- [ ] Tools execute successfully with user credentials
- [ ] Lovable AI correctly chooses and uses tools
- [ ] Multi-agent chats work with combined tool sets
- [ ] Zero credential leakage in responses

## Known Limitations & Future Work
- **Token Refresh**: Need to implement automatic refresh for expired OAuth tokens
- **Rate Limiting**: No rate limiting on tool execution yet
- **Workflow Complexity**: Only supports linear workflows initially, complex branching later
- **Error Recovery**: Limited retry logic for failed tool calls
- **Security**: Need to audit credential storage encryption
