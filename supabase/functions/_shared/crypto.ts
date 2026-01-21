/**
 * Credential Encryption Utilities
 * Uses AES-256-GCM for encrypting OAuth tokens at rest
 */

const ENCRYPTION_KEY_ENV = "CREDENTIAL_ENCRYPTION_KEY";

// Generate a key from the secret (should be 32 bytes for AES-256)
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get(ENCRYPTION_KEY_ENV);
  if (!keyString) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY not configured");
  }
  
  // Use the key string as a password to derive a proper AES key
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyString),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("elixa_credential_salt_v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext token
 * Returns base64-encoded string with format: iv:ciphertext
 */
export async function encryptToken(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate random IV (12 bytes for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    // Combine IV and ciphertext, then base64 encode
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("[Crypto] Encryption failed:", error);
    throw new Error("Failed to encrypt token");
  }
}

/**
 * Decrypt an encrypted token
 * Expects base64-encoded string with format: iv:ciphertext
 */
export async function decryptToken(encrypted: string): Promise<string> {
  if (!encrypted) return "";
  
  try {
    const key = await getEncryptionKey();
    
    // Decode base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("[Crypto] Decryption failed:", error);
    throw new Error("Failed to decrypt token");
  }
}

/**
 * Check if encryption is available (key is configured)
 */
export function isEncryptionAvailable(): boolean {
  return !!Deno.env.get(ENCRYPTION_KEY_ENV);
}
