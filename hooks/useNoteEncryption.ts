"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import { encryptNote, decryptNote, getUserEncryptionSecret } from "@/lib/encryption";

/**
 * Hook for encrypting/decrypting notes client-side
 * Ensures that note content is never readable by the server/database admin
 */
export function useNoteEncryption() {
  const { userId, getToken } = useAuth();

  // Get user's encryption secret (derived from Clerk session)
  const getEncryptionSecret = useCallback(async () => {
    if (!userId) throw new Error("User not authenticated");

    const sessionToken = await getToken();
    if (!sessionToken) throw new Error("No session token");

    return getUserEncryptionSecret(userId, sessionToken);
  }, [userId, getToken]);

  // Encrypt note content before saving
  const encrypt = useCallback(
    async (plaintext: string): Promise<string> => {
      if (!userId) throw new Error("User not authenticated");

      const secret = await getEncryptionSecret();
      return encryptNote(plaintext, userId, secret);
    },
    [userId, getEncryptionSecret]
  );

  // Decrypt note content after fetching
  const decrypt = useCallback(
    async (encrypted: string): Promise<string> => {
      if (!userId) throw new Error("User not authenticated");

      const secret = await getEncryptionSecret();
      return decryptNote(encrypted, userId, secret);
    },
    [userId, getEncryptionSecret]
  );

  return {
    encrypt,
    decrypt,
    isReady: !!userId,
  };
}
