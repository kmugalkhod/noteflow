/**
 * Client-side encryption for user notes
 * This ensures that even the database admin cannot read user data
 */

// Use Web Crypto API (built into browsers)
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Derive encryption key from user's password/auth token
 * Uses PBKDF2 to create a strong key from user credentials
 */
async function deriveKey(
  userId: string,
  userSecret: string // From Clerk JWT or user-provided password
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userSecret),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = encoder.encode(userId); // Use userId as salt

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext data
 * @returns Base64 encoded encrypted data with IV prepended
 */
export async function encryptNote(
  plaintext: string,
  userId: string,
  userSecret: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive encryption key
    const key = await deriveKey(userId, userSecret);

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv },
      key,
      data
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt note');
  }
}

/**
 * Decrypt encrypted data
 * @param encrypted Base64 encoded encrypted data with IV prepended
 * @returns Plaintext string
 */
export async function decryptNote(
  encrypted: string,
  userId: string,
  userSecret: string
): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encrypted)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    // Derive encryption key
    const key = await deriveKey(userId, userSecret);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      data
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt note - invalid key or corrupted data');
  }
}

/**
 * Generate a user-specific encryption secret from Clerk session
 * This secret is derived from the user's authentication but never stored
 */
export function getUserEncryptionSecret(clerkUserId: string, sessionToken: string): string {
  // Combine clerk user ID and session token to create a unique secret
  // This secret exists only in the user's browser session
  return `${clerkUserId}:${sessionToken}`;
}

/**
 * Check if content is encrypted
 */
export function isEncrypted(content: string): boolean {
  // Encrypted content is base64 and has specific length pattern
  try {
    const decoded = atob(content);
    return decoded.length > IV_LENGTH;
  } catch {
    return false;
  }
}
