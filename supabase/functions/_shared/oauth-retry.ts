/**
 * OAuth Retry Utility
 * Automatically retries API calls on 401/403 errors after refreshing tokens
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials } from "./credentials.ts";

interface RetryConfig {
  userId: string;
  credentialType: string;
  bundleType?: string | null;
  maxRetries?: number;
}

interface ApiCallResult<T> {
  data: T | null;
  error: string | null;
  tokenRefreshed: boolean;
}

/**
 * Refreshes an OAuth token by calling the refresh-oauth-token edge function
 */
async function refreshToken(
  userId: string,
  credentialType: string,
  bundleType?: string | null
): Promise<string | null> {
  try {
    console.log(`[OAuth Retry] Attempting token refresh for ${credentialType}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/refresh-oauth-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        userId,
        credentialType,
        bundleType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OAuth Retry] Token refresh failed: ${errorText}`);
      return null;
    }

    const result = await response.json();
    if (result.success && result.access_token) {
      console.log(`[OAuth Retry] Token refreshed successfully for ${credentialType}`);
      return result.access_token;
    }

    return null;
  } catch (error) {
    console.error("[OAuth Retry] Error refreshing token:", error);
    return null;
  }
}

/**
 * Wraps an API call with automatic token refresh on auth failures
 */
export async function withTokenRefresh<T>(
  config: RetryConfig,
  getToken: () => Promise<string | null>,
  apiCall: (token: string) => Promise<Response>
): Promise<ApiCallResult<T>> {
  const { userId, credentialType, bundleType, maxRetries = 1 } = config;
  
  let currentToken = await getToken();
  if (!currentToken) {
    return { data: null, error: "No token available", tokenRefreshed: false };
  }

  let attempts = 0;
  let tokenRefreshed = false;

  while (attempts <= maxRetries) {
    try {
      const response = await apiCall(currentToken);
      
      // If successful, return the data
      if (response.ok) {
        const data = await response.json();
        return { data, error: null, tokenRefreshed };
      }

      // Check if it's an auth error that warrants a token refresh
      if ((response.status === 401 || response.status === 403) && attempts < maxRetries) {
        console.log(`[OAuth Retry] Auth error (${response.status}), attempting token refresh...`);
        
        const newToken = await refreshToken(userId, credentialType, bundleType);
        if (newToken) {
          currentToken = newToken;
          tokenRefreshed = true;
          attempts++;
          continue;
        } else {
          // Token refresh failed, return the error
          const errorText = await response.text();
          return { 
            data: null, 
            error: `Authentication failed and token refresh unsuccessful. Please reconnect your account.`,
            tokenRefreshed 
          };
        }
      }

      // For other errors, return immediately
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      return { 
        data: null, 
        error: errorData.error?.message || errorData.message || `API error: ${response.status}`,
        tokenRefreshed 
      };

    } catch (error) {
      console.error("[OAuth Retry] API call error:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error",
        tokenRefreshed 
      };
    }
  }

  return { data: null, error: "Max retries exceeded", tokenRefreshed };
}

/**
 * Helper to get a fresh token from credentials, refreshing if expired
 */
export async function getFreshToken(
  supabase: any,
  userId: string,
  credentialType: string,
  bundleType?: string | null
): Promise<string | null> {
  const credential = await getDecryptedCredentials(supabase, userId, credentialType, bundleType);
  
  if (!credential) {
    console.log(`[OAuth] No credentials found for ${credentialType}`);
    return null;
  }

  // Check if token is expired
  if (credential.expires_at) {
    const expiresAt = new Date(credential.expires_at);
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    if (expiresAt.getTime() - bufferTime <= Date.now()) {
      console.log(`[OAuth] Token expired or expiring soon, refreshing...`);
      const newToken = await refreshToken(userId, credentialType, bundleType);
      if (newToken) {
        return newToken;
      }
      // If refresh failed but we still have a token, try using it anyway
      console.log(`[OAuth] Refresh failed, attempting with existing token`);
    }
  }

  return credential.access_token;
}
