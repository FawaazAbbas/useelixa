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
  
  for (const cred of (data || [])) {
    // Check if token is expired or will expire within 5 minutes
    const needsRefresh = cred.expires_at && 
      new Date(cred.expires_at).getTime() < Date.now() + (5 * 60 * 1000);
    
    if (needsRefresh && cred.refresh_token) {
      console.log(`🔄 Token for ${cred.credential_type} expired or expiring soon, refreshing...`);
      
      try {
        // Call refresh token edge function
        const refreshResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/refresh-oauth-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              userId,
              credentialType: cred.credential_type,
            }),
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log(`✅ Token refreshed for ${cred.credential_type}`);
          
          // Use refreshed token
          credentials[cred.credential_type] = {
            access_token: refreshData.access_token,
            refresh_token: cred.refresh_token,
            token_type: cred.token_type,
            expires_at: cred.expires_at,
          };
        } else {
          console.warn(`⚠️ Failed to refresh token for ${cred.credential_type}, using existing token`);
          credentials[cred.credential_type] = {
            access_token: cred.access_token,
            refresh_token: cred.refresh_token,
            token_type: cred.token_type,
            expires_at: cred.expires_at,
          };
        }
      } catch (refreshError) {
        console.error(`Error refreshing token for ${cred.credential_type}:`, refreshError);
        // Fallback to existing token
        credentials[cred.credential_type] = {
          access_token: cred.access_token,
          refresh_token: cred.refresh_token,
          token_type: cred.token_type,
          expires_at: cred.expires_at,
        };
      }
    } else {
      // Token is still valid
      credentials[cred.credential_type] = {
        access_token: cred.access_token,
        refresh_token: cred.refresh_token,
        token_type: cred.token_type,
        expires_at: cred.expires_at,
      };
    }
  }
  
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
