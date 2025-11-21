/**
 * API Route: Generate AI Content
 * POST /api/ai/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { decrypt } from "@/lib/crypto/encryption";

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, provider, model, encryptedApiKey } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!provider || !model || !encryptedApiKey) {
      return NextResponse.json(
        {
          error: "AI not configured",
          message: "Please configure your AI settings in the Settings page"
        },
        { status: 400 }
      );
    }

    // Decrypt the API key
    let apiKey: string;
    try {
      apiKey = decrypt(encryptedApiKey);
    } catch (error) {
      console.error("Failed to decrypt API key:", error);
      return NextResponse.json(
        { error: "Invalid AI configuration", message: "Failed to decrypt API key" },
        { status: 500 }
      );
    }

    // Create AI provider instance
    const aiProvider = AIService.getProvider({
      provider,
      model,
      apiKey,
    });

    // Generate content
    const content = await aiProvider.generateContent({
      prompt,
      context,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
