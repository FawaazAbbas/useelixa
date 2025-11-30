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
  
  // Slack
  { pattern: /^slack.*oauth2.*/i, baseType: 'slackOAuth2Api', serviceCategory: 'slack' },
  
  // Notion
  { pattern: /^notion.*/i, baseType: 'notionApi', serviceCategory: 'notion' },
  
  // AI
  { pattern: /^openai.*/i, baseType: 'LOVABLE_AI', serviceCategory: 'ai' },
  
  // QuickBooks
  { pattern: /^quickbooks.*/i, baseType: 'quickbooksApi', serviceCategory: 'accounting' },
  
  // Microsoft 365 family
  { pattern: /^microsoft.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  { pattern: /^outlook.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  { pattern: /^onedrive.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  { pattern: /^excel.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  { pattern: /^word.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  { pattern: /^teams.*oauth2.*/i, baseType: 'microsoftOAuth2Api', serviceCategory: 'microsoft' },
  
  // Calendly
  { pattern: /^calendly.*/i, baseType: 'calendlyApi', serviceCategory: 'scheduling' },
  
  // HubSpot
  { pattern: /^hubspot.*/i, baseType: 'hubspotOAuth2Api', serviceCategory: 'crm' },
  
  // Mailchimp
  { pattern: /^mailchimp.*/i, baseType: 'mailchimpOAuth2Api', serviceCategory: 'email' },
  
  // Facebook/Meta
  { pattern: /^facebook.*oauth2.*/i, baseType: 'facebookOAuth2Api', serviceCategory: 'social' },
  { pattern: /^meta.*oauth2.*/i, baseType: 'facebookOAuth2Api', serviceCategory: 'social' },
  
  // Stripe
  { pattern: /^stripe.*/i, baseType: 'stripeApi', serviceCategory: 'payment' },
  
  // Twilio
  { pattern: /^twilio.*/i, baseType: 'twilioApi', serviceCategory: 'sms' },
  
  // Typeform
  { pattern: /^typeform.*/i, baseType: 'typeformApi', serviceCategory: 'forms' },
  
  // Shopify
  { pattern: /^shopify.*/i, baseType: 'shopifyApi', serviceCategory: 'ecommerce' },
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
   * For Google: handles multiple accounts and selects best match based on scopes
   */
  resolveCredential(
    requestedType: string,
    availableCredentials: Record<string, any>,
    requiredScopes?: string[]
  ): ResolvedCredential | null {
    console.log(`🔍 Resolving credential: ${requestedType}`, requiredScopes ? `with scopes: ${requiredScopes.join(', ')}` : '');

    // Strategy 1: Exact match
    const exactCred = availableCredentials[requestedType];
    
    // Handle Google OAuth as array (multiple accounts)
    if (requestedType === 'googleOAuth2Api' && Array.isArray(exactCred)) {
      console.log(`✓ Found ${exactCred.length} Google account(s)`);
      
      // If requiredScopes provided, find best matching account
      if (requiredScopes && requiredScopes.length > 0) {
        for (const cred of exactCred) {
          if (cred.scopes && requiredScopes.every((scope: string) => cred.scopes.includes(scope))) {
            console.log(`✓ Best match found: ${cred.account_email} (has all required scopes)`);
            return { 
              credential: cred, 
              resolvedAs: `${requestedType} (${cred.account_email})`, 
              method: 'exact_match' 
            };
          }
        }
        console.log(`⚠️ No account has all required scopes, using first available`);
      }
      
      // Fallback: use first account if no scope matching needed
      if (exactCred.length > 0 && exactCred[0].access_token) {
        console.log(`✓ Using first Google account: ${exactCred[0].account_email}`);
        return { 
          credential: exactCred[0], 
          resolvedAs: `${requestedType} (${exactCred[0].account_email})`, 
          method: 'exact_match' 
        };
      }
    } else if (exactCred?.access_token) {
      // Non-Google credential (single credential)
      console.log(`✓ Exact match found: ${requestedType}`);
      return { 
        credential: exactCred, 
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
        const baseCred = availableCredentials[mapping.baseType];
        
        // Handle Google as array
        if (mapping.baseType === 'googleOAuth2Api' && Array.isArray(baseCred) && baseCred.length > 0) {
          console.log(`✓ Pattern match: ${requestedType} → ${mapping.baseType} (using first account)`);
          return { 
            credential: baseCred[0], 
            resolvedAs: `${mapping.baseType} (${baseCred[0].account_email})`, 
            method: 'pattern_match' 
          };
        } else if (baseCred?.access_token) {
          console.log(`✓ Pattern match: ${requestedType} → ${mapping.baseType}`);
          return { 
            credential: baseCred, 
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
        ([key, val]) => {
          // Handle Google array
          if (key === 'googleOAuth2Api' && Array.isArray(val) && val.length > 0) {
            return key.toLowerCase().includes(serviceMatch.serviceCategory);
          }
          return key.toLowerCase().includes(serviceMatch.serviceCategory) && val?.access_token;
        }
      );
      
      if (sameServiceCreds) {
        const [key, val] = sameServiceCreds;
        const cred = Array.isArray(val) ? val[0] : val;
        
        if (cred?.access_token) {
          const resolvedName = Array.isArray(val) ? `${key} (${cred.account_email})` : key;
          console.log(`✓ Service fallback: ${requestedType} → ${resolvedName}`);
          return { 
            credential: cred, 
            resolvedAs: resolvedName, 
            method: 'service_fallback' 
          };
        }
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
   * For Google: checks if any account is connected
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

  /**
   * Get summary of available credentials for system prompt
   */
  getCredentialsSummary(availableCredentials: Record<string, any>): string {
    const lines: string[] = [];
    
    for (const [type, cred] of Object.entries(availableCredentials)) {
      if (type === 'googleOAuth2Api' && Array.isArray(cred)) {
        const accounts = cred.map(c => c.account_email || c.account_label).join(', ');
        lines.push(`- Google (${cred.length} account${cred.length > 1 ? 's' : ''}): ${accounts}`);
      } else if (cred?.access_token) {
        lines.push(`- ${type}`);
      }
    }
    
    return lines.length > 0 
      ? `You have access to these connected services:\n${lines.join('\n')}`
      : 'No services connected yet.';
  }
}
