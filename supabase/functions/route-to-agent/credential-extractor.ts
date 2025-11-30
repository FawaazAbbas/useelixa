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
  console.log(`🔐 Fetching credentials for user: ${userId}`);
  
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('❌ Error fetching user credentials:', error);
    return {};
  }
  
  console.log(`✓ Found ${data?.length || 0} credential(s) in database`);
  
  // Transform array of credentials into object keyed by credential_type
  // For Google, store as array to support multiple accounts
  const credentials: Record<string, any> = {};
  
  for (const cred of (data || [])) {
    // Check if token is expired or will expire within 5 minutes
    const needsRefresh = cred.expires_at && 
      new Date(cred.expires_at).getTime() < Date.now() + (5 * 60 * 1000);
    
    const expiryInfo = cred.expires_at 
      ? `expires ${new Date(cred.expires_at).toISOString()}`
      : 'no expiry';
    
    console.log(`  • ${cred.credential_type} (${cred.account_email || 'default'}, ${cred.bundle_type || 'no bundle'}) - ${expiryInfo}`);
    
    if (needsRefresh && cred.refresh_token) {
      console.log(`    🔄 Token expiring soon, attempting refresh...`);
      
      try {
        // Call refresh token edge function with credential ID for precise refresh
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
              credentialId: cred.id,
              bundleType: cred.bundle_type,
              accountEmail: cred.account_email,
            }),
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log(`    ✅ Token refreshed successfully`);
          
          // Use refreshed token
          const tokenData = {
            id: cred.id,
            access_token: refreshData.access_token,
            refresh_token: cred.refresh_token,
            token_type: cred.token_type,
            expires_at: cred.expires_at,
            bundle_type: cred.bundle_type,
            account_email: cred.account_email,
            scopes: cred.scopes,
          };

          // For Google, store as array; for others, single credential
          if (cred.credential_type === 'googleOAuth2Api') {
            if (!credentials[cred.credential_type]) {
              credentials[cred.credential_type] = [];
            }
            credentials[cred.credential_type].push(tokenData);
          } else {
            credentials[cred.credential_type] = tokenData;
          }
        } else {
          const errorText = await refreshResponse.text();
          console.error(`    ❌ Refresh failed (${refreshResponse.status}):`, errorText);
          console.warn(`    ⚠️ Using existing token (may be expired)`);
          
          const tokenData = {
            id: cred.id,
            access_token: cred.access_token,
            refresh_token: cred.refresh_token,
            token_type: cred.token_type,
            expires_at: cred.expires_at,
            bundle_type: cred.bundle_type,
            account_email: cred.account_email,
            scopes: cred.scopes,
          };

          if (cred.credential_type === 'googleOAuth2Api') {
            if (!credentials[cred.credential_type]) {
              credentials[cred.credential_type] = [];
            }
            credentials[cred.credential_type].push(tokenData);
          } else {
            credentials[cred.credential_type] = tokenData;
          }
        }
      } catch (refreshError) {
        console.error(`Error refreshing token for ${cred.credential_type}:`, refreshError);
        // Fallback to existing token
        const tokenData = {
          id: cred.id,
          access_token: cred.access_token,
          refresh_token: cred.refresh_token,
          token_type: cred.token_type,
          expires_at: cred.expires_at,
          bundle_type: cred.bundle_type,
          account_email: cred.account_email,
          scopes: cred.scopes,
        };

        if (cred.credential_type === 'googleOAuth2Api') {
          if (!credentials[cred.credential_type]) {
            credentials[cred.credential_type] = [];
          }
          credentials[cred.credential_type].push(tokenData);
        } else {
          credentials[cred.credential_type] = tokenData;
        }
      }
    } else {
      // Token is still valid
      const tokenData = {
        id: cred.id,
        access_token: cred.access_token,
        refresh_token: cred.refresh_token,
        token_type: cred.token_type,
        expires_at: cred.expires_at,
        bundle_type: cred.bundle_type,
        account_email: cred.account_email,
        scopes: cred.scopes,
      };

      if (cred.credential_type === 'googleOAuth2Api') {
        if (!credentials[cred.credential_type]) {
          credentials[cred.credential_type] = [];
        }
        credentials[cred.credential_type].push(tokenData);
      } else {
        credentials[cred.credential_type] = tokenData;
      }
    }
  }
  
  console.log('\n📋 Credential Summary:');
  console.log(`  Total credential types available: ${Object.keys(credentials).length}`);
  if (credentials['googleOAuth2Api']) {
    console.log(`  - Google accounts: ${credentials['googleOAuth2Api'].length}`);
    credentials['googleOAuth2Api'].forEach((acc: any, idx: number) => {
      console.log(`    ${idx + 1}. ${acc.account_email} (bundle: ${acc.bundle_type || 'legacy'}, scopes: ${acc.scopes?.length || 0})`);
    });
  }
  Object.keys(credentials).filter(k => k !== 'googleOAuth2Api').forEach(credType => {
    console.log(`  - ${credType}: connected`);
  });
  
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
