// Intelligent credential resolution system with pattern-based matching

interface CredentialMapping {
  pattern: RegExp;
  baseType: string;
  serviceCategory: string;
}

const CREDENTIAL_MAPPINGS: CredentialMapping[] = [
  // Google Workspace family - all variants map to googleOAuth2Api
  { pattern: /^gmail.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*sheets.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*drive.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*docs.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*calendar.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*forms.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*contacts.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  { pattern: /^google.*oauth2.*/i, baseType: 'googleOAuth2Api', serviceCategory: 'google' },
  
  // Other services
  { pattern: /^slack.*oauth2.*/i, baseType: 'slackOAuth2Api', serviceCategory: 'slack' },
  { pattern: /^notion.*/i, baseType: 'notionApi', serviceCategory: 'notion' },
  { pattern: /^openai.*/i, baseType: 'LOVABLE_AI', serviceCategory: 'ai' },
];

export interface ResolvedCredential {
  credential: any;
  resolvedAs: string;
  method: 'exact_match' | 'pattern_match' | 'service_fallback' | 'lovable_ai_proxy';
}

export class CredentialResolver {
  /**
   * Resolves a requested credential type against available user credentials
   * Uses multiple strategies: exact match, pattern matching, service fallback
   */
  resolveCredential(
    requestedType: string,
    availableCredentials: Record<string, any>
  ): ResolvedCredential | null {
    console.log(`🔍 Resolving credential: ${requestedType}`);

    // Strategy 1: Exact match (fastest)
    if (availableCredentials[requestedType]?.access_token) {
      console.log(`✓ Exact match found: ${requestedType}`);
      return { 
        credential: availableCredentials[requestedType], 
        resolvedAs: requestedType, 
        method: 'exact_match' 
      };
    }

    // Strategy 2: Pattern matching (Google Workspace, Slack, etc.)
    for (const mapping of CREDENTIAL_MAPPINGS) {
      if (mapping.pattern.test(requestedType)) {
        // Special case: OpenAI uses Lovable AI
        if (mapping.baseType === 'LOVABLE_AI') {
          if (Deno.env.get('LOVABLE_API_KEY')) {
            console.log(`✓ Using Lovable AI proxy for ${requestedType}`);
            return { 
              credential: { type: 'LOVABLE_AI' }, 
              resolvedAs: 'LOVABLE_AI', 
              method: 'lovable_ai_proxy' 
            };
          }
        }
        
        // Check if base type exists
        if (availableCredentials[mapping.baseType]?.access_token) {
          console.log(`✓ Pattern match: ${requestedType} → ${mapping.baseType}`);
          return { 
            credential: availableCredentials[mapping.baseType], 
            resolvedAs: mapping.baseType, 
            method: 'pattern_match' 
          };
        }
      }
    }

    // Strategy 3: Service category fallback (last resort)
    const serviceMatch = CREDENTIAL_MAPPINGS.find(m => 
      m.pattern.test(requestedType)
    );
    
    if (serviceMatch) {
      const sameServiceCreds = Object.entries(availableCredentials).find(
        ([key, _]) => key.toLowerCase().includes(serviceMatch.serviceCategory)
      );
      
      if (sameServiceCreds && sameServiceCreds[1]?.access_token) {
        console.log(`✓ Service fallback: ${requestedType} → ${sameServiceCreds[0]}`);
        return { 
          credential: sameServiceCreds[1], 
          resolvedAs: sameServiceCreds[0], 
          method: 'service_fallback' 
        };
      }
    }

    console.log(`✗ No credential found for ${requestedType}`);
    return null;
  }

  /**
   * Get all possible aliases for a given base credential type
   */
  getAllAliases(baseType: string): string[] {
    const mapping = CREDENTIAL_MAPPINGS.find(m => m.baseType === baseType);
    if (!mapping) return [baseType];
    
    // Generate common variations
    const variations = new Set([
      baseType,
      baseType.replace('OAuth2', ''),
      baseType.replace('Api', ''),
      baseType.replace('oauth2', ''),
      baseType.replace('api', ''),
    ]);
    
    return Array.from(variations);
  }

  /**
   * Check if all required credentials are available
   */
  validateCredentials(
    requiredTypes: string[],
    availableCredentials: Record<string, any>
  ): { hasAll: boolean; missing: string[]; resolutions: Record<string, ResolvedCredential> } {
    const missing: string[] = [];
    const resolutions: Record<string, ResolvedCredential> = {};

    for (const credType of requiredTypes) {
      const resolved = this.resolveCredential(credType, availableCredentials);
      
      if (!resolved) {
        missing.push(credType);
      } else {
        resolutions[credType] = resolved;
      }
    }

    return {
      hasAll: missing.length === 0,
      missing,
      resolutions
    };
  }
}
