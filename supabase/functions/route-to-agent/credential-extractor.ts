import { ParsedWorkflow } from './workflow-parser.ts';
import { CredentialResolver } from './credential-resolver.ts';

export interface CredentialPlaceholder {
  credentialType: string;
  nodeId: string;
  nodeName: string;
}

// Initialize credential resolver
const credentialResolver = new CredentialResolver();

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
  
  // Transform array of credentials into object keyed by credential_type
  const credentials: Record<string, any> = {};
  data?.forEach((cred: any) => {
    const credData = {
      access_token: cred.access_token,
      refresh_token: cred.refresh_token,
      token_type: cred.token_type,
      expires_at: cred.expires_at,
    };
    
    // Store under actual type
    credentials[cred.credential_type] = credData;
  });
  
  console.log('Available credentials:', Object.keys(credentials));
  return credentials;
}

export function hasRequiredCredentials(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): { hasAll: boolean; missing: string[] } {
  // Use the credential resolver for intelligent credential matching
  const validation = credentialResolver.validateCredentials(
    workflow.requiredCredentials,
    userCredentials
  );
  
  // Log results
  if (validation.hasAll) {
    console.log('✓ All required credentials available');
  } else {
    console.log(`✗ Missing credentials: ${validation.missing.join(', ')}`);
  }
  
  // Log resolutions
  Object.entries(validation.resolutions).forEach(([requested, resolution]) => {
    console.log(`✓ ${requested} → ${resolution.resolvedAs} (${resolution.method})`);
  });
  
  return {
    hasAll: validation.hasAll,
    missing: validation.missing
  };
}
