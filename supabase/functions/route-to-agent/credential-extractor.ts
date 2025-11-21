import { ParsedWorkflow } from './workflow-parser.ts';

export interface CredentialPlaceholder {
  credentialType: string;
  nodeId: string;
  nodeName: string;
}

// Map n8n credential types to our stored credential types
const CREDENTIAL_ALIASES: Record<string, string> = {
  'gmailOAuth2': 'googleOAuth2Api',
  'googleSheetsOAuth2': 'googleOAuth2Api',
  'googleDriveOAuth2': 'googleOAuth2Api',
};

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
    const credData = {
      access_token: cred.access_token,
      refresh_token: cred.refresh_token,
      token_type: cred.token_type,
      expires_at: cred.expires_at,
    };
    
    // Store under actual type
    credentials[cred.credential_type] = credData;
    
    // Also store under any aliases (reverse mapping)
    for (const [alias, actualType] of Object.entries(CREDENTIAL_ALIASES)) {
      if (actualType === cred.credential_type) {
        credentials[alias] = credData;
        console.log(`✓ Mapped credential ${cred.credential_type} → ${alias}`);
      }
    }
  });
  
  console.log('Available credentials:', Object.keys(credentials));
  return credentials;
}

export function hasRequiredCredentials(
  workflow: ParsedWorkflow,
  userCredentials: Record<string, any>
): { hasAll: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const credType of workflow.requiredCredentials) {
    // Special case: OpenAI is handled by Lovable AI
    if (credType === 'openAiApi') {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (lovableApiKey) {
        console.log('✓ OpenAI requests will use Lovable AI (no user credential needed)');
        continue; // Skip this credential - Lovable AI handles it
      }
    }
    
    // Check if credential exists under actual type or alias
    const aliasedType = CREDENTIAL_ALIASES[credType] || credType;
    const hasCredential = 
      (userCredentials[credType]?.access_token) || 
      (userCredentials[aliasedType]?.access_token);
    
    if (!hasCredential) {
      console.log(`✗ Missing credential: ${credType} (checked as ${aliasedType})`);
      missing.push(credType);
    } else {
      console.log(`✓ Found credential: ${credType}`);
    }
  }
  
  return {
    hasAll: missing.length === 0,
    missing
  };
}
