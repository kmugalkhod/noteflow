/**
 * AI Service Types
 * Defines interfaces for AI provider implementations
 */

export interface AIGenerateOptions {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  /**
   * Generate content based on a prompt and optional context
   */
  generateContent(options: AIGenerateOptions): Promise<string>;

  /**
   * Generate a concise title from content
   */
  generateTitle(content: string): Promise<string>;

  /**
   * Continue writing based on existing context
   */
  continueWriting(context: string): Promise<string>;

  /**
   * Summarize the given content
   */
  summarize(content: string): Promise<string>;
}

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProviderType;
  apiKey: string;
  model?: string;
}

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}
