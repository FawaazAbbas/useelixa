export interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface ParsedWorkflow {
  nodes: N8nNode[];
  connections: Record<string, any>;
  requiredCredentials: string[];
}

export function parseN8nWorkflow(workflowJson: any): ParsedWorkflow {
  if (!workflowJson || typeof workflowJson !== 'object') {
    throw new Error('Invalid workflow JSON');
  }

  const nodes = workflowJson.nodes || [];
  const connections = workflowJson.connections || {};
  
  // Extract all unique credential requirements
  const requiredCredentials = new Set<string>();
  
  nodes.forEach((node: N8nNode) => {
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        requiredCredentials.add(credType);
      });
    }
  });
  
  return {
    nodes,
    connections,
    requiredCredentials: Array.from(requiredCredentials)
  };
}

export function getWorkflowDescription(workflow: ParsedWorkflow): string {
  const nodeTypes = workflow.nodes.map(n => n.type.split('.').pop()).join(', ');
  return `This workflow contains ${workflow.nodes.length} nodes: ${nodeTypes}`;
}
