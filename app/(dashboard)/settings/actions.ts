"use server";

import { encrypt } from "@/lib/crypto/encryption";

/**
 * Server action to encrypt API key
 * This ensures encryption happens server-side using Node.js crypto
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  return encrypt(apiKey);
}
