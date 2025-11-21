/**
 * API Route: Summarize Content with AI
 * POST /api/ai/summarize
 */

import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { decrypt } from "@/lib/crypto/encryption";

export async function POST(request: NextRequest) {
  try {
    const { content, provider, model, encryptedApiKey } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
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
    const summary = await aiProvider.summarize(content);

    return NextResponse.json({ content: summary });
  } catch (error) {
    console.error("AI summarize error:", error);
    return NextResponse.json(
      {
        error: "Failed to summarize",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
