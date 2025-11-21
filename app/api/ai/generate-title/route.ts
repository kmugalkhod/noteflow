/**
 * API Route: Generate Title from Content
 * POST /api/ai/generate-title
 */

import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai/ai-service";
import { decrypt } from "@/lib/crypto/encryption";

export async function POST(request: NextRequest) {
  try {
    const { content, provider, model, encryptedApiKey } = await request.json();

    if (!content || content.length < 10) {
      return NextResponse.json({ title: "Untitled Note" });
    }

    if (!provider || !model || !encryptedApiKey) {
      // Return default title if AI not configured
      return NextResponse.json({ title: "Untitled Note" });
    }

    const apiKey = decrypt(encryptedApiKey);
    const aiProvider = AIService.getProvider({ provider, model, apiKey });
    const title = await aiProvider.generateTitle(content);

    return NextResponse.json({ title });
  } catch (error) {
    console.error("AI generate title error:", error);
    return NextResponse.json({ title: "Untitled Note" });
  }
}
