import { ParsedWorkflow } from './workflow-parser.ts';

export interface CredentialPlaceholder {
  credentialType: string;
  nodeId: string;
  nodeName: string;
}

export function extractCredentialPlaceholders(
  workflow: ParsedWorkflow
): CredentialPlaceholder[] {
  const placeholders: CredentialPlaceholder[] = [];
  
  workflow.nodes.forEach(node => {
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        placeholders.push({
          credentialType: credType,
          nodeId: node.id,
          nodeName: node.name
        });
      });
    }
  });
  
  return placeholders;
}

export async function fetchUserCredentials(
  userId: string,
  supabase: any
): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching user credentials:', error);
    return {};
  }
  
  // Transform array of credentials into an object keyed by credential_type
  const credentials: Record<string, any> = {};
  data?.forEach((cred: any) => {
    credentials[cred.credential_type] = {
      access_token: cred.access_token,
      refresh_token: cred.refresh_token,
      token_type: cred.token_type,
      expires_at: cred.expires_at,
    };
  });
  
  return credentials;
}

export function hasRequiredCredentials(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): { hasAll: boolean; missing: string[] } {
  const missing: string[] = [];
  
  workflow.requiredCredentials.forEach(credType => {
    if (!userCredentials[credType] || !userCredentials[credType].access_token) {
      missing.push(credType);
    }
  });
  
  return {
    hasAll: missing.length === 0,
    missing
  };
}
