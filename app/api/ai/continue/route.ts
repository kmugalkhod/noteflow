/**
 * API Route: Continue Writing with AI
 * POST /api/ai/continue
 */

import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { decrypt } from "@/lib/crypto/encryption";

export async function POST(request: NextRequest) {
  try {
    const { context, provider, model, encryptedApiKey } = await request.json();

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      );
    }

    if (!provider || !model || !encryptedApiKey) {
      return NextResponse.json(
        { error: "AI not configured", message: "Please configure your AI settings" },
        { status: 400 }
      );
    }

    const apiKey = decrypt(encryptedApiKey);
    const aiProvider = AIService.getProvider({ provider, model, apiKey });
    const content = await aiProvider.continueWriting(context);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI continue writing error:", error);
    return NextResponse.json(
      {
        error: "Failed to continue writing",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
