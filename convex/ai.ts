/**
 * AI-powered content generation actions
 * These are Convex actions that call external AI APIs
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Helper to get user's AI settings
 * Throws error if user not authenticated or AI not configured
 */
async function getUserAISettings(ctx: any): Promise<any> {
  const settings = await ctx.runQuery(internal.aiSettings.getAISettings);

  if (!settings) {
    throw new Error("AI not configured. Please configure your AI settings.");
  }

  return settings;
}

// AI action to generate content based on prompt and context
export const generateContent = action({
  args: {
    prompt: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { prompt, context } = args;

    try {
      // Get user's AI settings
      const settings = await getUserAISettings(ctx);

      // Call the AI API route with user's settings
      // Use Convex env var (set via `npx convex env set SITE_URL https://your-app.vercel.app`)
      // For local Docker-based Convex, use host.docker.internal instead of localhost
      const siteUrl = process.env.SITE_URL || "http://host.docker.internal:3000";
      console.log('[AI] Calling API:', `${siteUrl}/api/ai/generate`);

      const response = await fetch(
        `${siteUrl}/api/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            context,
            provider: settings.provider,
            model: settings.model,
            encryptedApiKey: settings.encryptedApiKey,
          }),
        }
      );

      console.log('[AI] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI] Error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new Error(error.message || `API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AI] Success! Content length:', data.content?.length || 0);
      return data.content;
    } catch (error) {
      console.error("[AI] Generation error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate content"
      );
    }
  },
});

// AI action to generate a title from content
export const generateTitle = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { content } = args;

    if (!content || content.length < 10) {
      return "Untitled Note";
    }

    try {
      // Get user's AI settings
      const settings = await getUserAISettings(ctx);

      const siteUrl = process.env.SITE_URL || "http://host.docker.internal:3000";
      const response = await fetch(
        `${siteUrl}/api/ai/generate-title`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.substring(0, 500), // Limit content length
            provider: settings.provider,
            model: settings.model,
            encryptedApiKey: settings.encryptedApiKey,
          }),
        }
      );

      if (!response.ok) {
        return "Untitled Note";
      }

      const data = await response.json();
      return data.title || "Untitled Note";
    } catch (error) {
      console.error("Title generation error:", error);
      return "Untitled Note";
    }
  },
});

// AI action to continue writing based on context
export const continueWriting = action({
  args: {
    context: v.string(),
  },
  handler: async (ctx, args) => {
    const { context } = args;

    try {
      // Get user's AI settings
      const settings = await getUserAISettings(ctx);

      const siteUrl = process.env.SITE_URL || "http://host.docker.internal:3000";
      const response = await fetch(
        `${siteUrl}/api/ai/continue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context,
            provider: settings.provider,
            model: settings.model,
            encryptedApiKey: settings.encryptedApiKey,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to continue writing");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Continue writing error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to continue writing"
      );
    }
  },
});

// AI action to summarize content
export const summarize = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { content } = args;

    try {
      // Get user's AI settings
      const settings = await getUserAISettings(ctx);

      const siteUrl = process.env.SITE_URL || "http://host.docker.internal:3000";
      const response = await fetch(
        `${siteUrl}/api/ai/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            provider: settings.provider,
            model: settings.model,
            encryptedApiKey: settings.encryptedApiKey,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to summarize");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Summarize error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to summarize content"
      );
    }
  },
});
