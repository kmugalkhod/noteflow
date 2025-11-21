/**
 * Encryption Utility for API Keys
 * Uses AES-256-GCM for encrypting user API keys
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment
 * Generates a new one if not found (development only)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // In development, generate a temporary key
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Encryption] No ENCRYPTION_KEY found. Using temporary key. Add ENCRYPTION_KEY to .env.local for production.');
      // Generate a consistent key for the session
      return crypto.scryptSync('noteflow-dev-encryption-key', 'salt', KEY_LENGTH);
    }
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // Convert hex string to buffer
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string (API key)
 * @param plaintext - The API key to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData (all hex)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  // Trim whitespace from plaintext before encrypting
  const trimmedPlaintext = plaintext.trim();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(trimmedPlaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encryptedData (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string (API key)
 * @param encryptedData - The encrypted data from encrypt()
 * @returns Decrypted API key
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();

  // Parse the encrypted data
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Trim any whitespace that might have been added
  return decrypted.trim();
}

/**
 * Generate a new encryption key (for setup)
 * Returns a 256-bit key as hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validate that an API key can be encrypted and decrypted
 * Used for testing encryption setup
 */
export function testEncryption(): boolean {
  try {
    const testKey = 'test-api-key-12345';
    const encrypted = encrypt(testKey);
    const decrypted = decrypt(encrypted);
    return testKey === decrypted;
  } catch (error) {
    console.error('[Encryption Test] Failed:', error);
    return false;
  }
}
