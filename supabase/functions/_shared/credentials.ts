/**
 * Shared credential utilities for decrypting and refreshing OAuth tokens
 */

import { decryptToken, isEncryptionAvailable } from "./crypto.ts";

export interface DecryptedCredential {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  is_encrypted: boolean;
}

/**
 * Retrieves and decrypts credentials from the user_credentials table
 */
export async function getDecryptedCredentials(
  supabase: any,
  userId: string,
  credentialType: string,
  bundleType?: string | null
): Promise<DecryptedCredential | null> {
  let query = supabase
    .from("user_credentials")
    .select("access_token, refresh_token, encrypted_access_token, encrypted_refresh_token, is_encrypted, expires_at")
    .eq("user_id", userId)
    .eq("credential_type", credentialType);

  if (bundleType) {
    query = query.eq("bundle_type", bundleType);
  }

  const { data: credential, error } = await query.single();

  if (error || !credential) {
    console.log(`[Credentials] No ${credentialType} credentials found for user`);
    return null;
  }

  // If encrypted, decrypt the tokens
  if (credential.is_encrypted && isEncryptionAvailable()) {
    try {
      const accessToken = credential.encrypted_access_token 
        ? await decryptToken(credential.encrypted_access_token)
        : null;
      const refreshToken = credential.encrypted_refresh_token
        ? await decryptToken(credential.encrypted_refresh_token)
        : null;

      if (!accessToken) {
        console.error(`[Credentials] Failed to decrypt access token`);
        return null;
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: credential.expires_at,
        is_encrypted: true,
      };
    } catch (decryptError) {
      console.error(`[Credentials] Decryption error:`, decryptError);
      return null;
    }
  }

  // Fall back to plaintext tokens
  if (!credential.access_token) {
    console.error(`[Credentials] No access token available (encrypted=${credential.is_encrypted})`);
    return null;
  }

  return {
    access_token: credential.access_token,
    refresh_token: credential.refresh_token,
    expires_at: credential.expires_at,
    is_encrypted: false,
  };
}

/**
 * Updates credentials after a token refresh, encrypting if possible
 */
export async function updateRefreshedToken(
  supabase: any,
  userId: string,
  credentialType: string,
  newAccessToken: string,
  expiresIn: number,
  bundleType?: string | null
): Promise<boolean> {
  const { encryptToken, isEncryptionAvailable } = await import("./crypto.ts");

  let updateData: Record<string, any> = {
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };

  if (isEncryptionAvailable()) {
    try {
      const encryptedToken = await encryptToken(newAccessToken);
      updateData.encrypted_access_token = encryptedToken;
      updateData.access_token = null;
      updateData.is_encrypted = true;
    } catch (e) {
      console.error("[Credentials] Failed to encrypt refreshed token:", e);
      updateData.access_token = newAccessToken;
      updateData.is_encrypted = false;
    }
  } else {
    updateData.access_token = newAccessToken;
    updateData.is_encrypted = false;
  }

  let query = supabase
    .from("user_credentials")
    .update(updateData)
    .eq("user_id", userId)
    .eq("credential_type", credentialType);

  if (bundleType) {
    query = query.eq("bundle_type", bundleType);
  }

  const { error } = await query;

  if (error) {
    console.error("[Credentials] Failed to update refreshed token:", error);
    return false;
  }

  return true;
}
