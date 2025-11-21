/**
 * API Route: Test AI Connection
 * POST /api/ai/test
 * Tests the AI provider connection with a simple request
 */

import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto/encryption";
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { provider, model, encryptedApiKey } = await request.json();

    if (!provider || !model || !encryptedApiKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Decrypt the API key
    let apiKey: string;
    try {
      apiKey = decrypt(encryptedApiKey);
      console.log('[TEST] Decrypted API key:', {
        length: apiKey.length,
        prefix: apiKey.substring(0, 7),
        suffix: apiKey.substring(apiKey.length - 4),
      });
    } catch (error) {
      console.error("Failed to decrypt API key:", error);
      return NextResponse.json(
        { error: "Invalid API configuration", message: "Failed to decrypt API key" },
        { status: 500 }
      );
    }

    // Test with a very simple prompt
    console.log('[TEST] Testing connection to:', provider, model);

    if (provider === 'openai') {
      const openai = createOpenAI({ apiKey });
      // Use stable Chat Completions API (.chat) instead of experimental Responses API
      const modelInstance = openai.chat(model);

      console.log('[TEST] Making test request...');

      const { text } = await generateText({
        model: modelInstance,
        prompt: 'Say "Hello, I am working!" in exactly those words.',
        temperature: 0,
        maxTokens: 20,
      });

      console.log('[TEST] Success! Response:', text);

      return NextResponse.json({
        success: true,
        response: text,
        message: "AI connection is working correctly!"
      });
    }

    return NextResponse.json(
      { error: "Only OpenAI is supported in test mode" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[TEST] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Unknown";

    return NextResponse.json(
      {
        error: "Test failed",
        message: errorMessage,
        errorType: errorName,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
