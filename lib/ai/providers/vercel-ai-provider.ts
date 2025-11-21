/**
 * Vercel AI SDK Provider
 * Universal provider supporting OpenAI, Anthropic, and Google
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AIProvider, AIGenerateOptions, AIError } from '../types';

type ProviderType = 'openai' | 'anthropic' | 'google';

export class VercelAIProvider implements AIProvider {
  private provider: ProviderType;
  private model: string;
  private apiKey: string;

  constructor(provider: ProviderType, model: string, apiKey: string) {
    if (!apiKey) {
      throw new AIError(`API key is required for ${provider}`, 'MISSING_API_KEY', provider);
    }

    // Validate API key format
    const trimmedKey = apiKey.trim();
    if (trimmedKey !== apiKey) {
      console.warn(`[${provider}] API key has whitespace, trimming...`);
    }

    // Validate key format based on provider
    if (provider === 'openai' && !trimmedKey.startsWith('sk-')) {
      throw new AIError(
        `Invalid OpenAI API key format. Should start with 'sk-'`,
        'INVALID_API_KEY',
        provider
      );
    }
    if (provider === 'anthropic' && !trimmedKey.startsWith('sk-ant-')) {
      throw new AIError(
        `Invalid Anthropic API key format. Should start with 'sk-ant-'`,
        'INVALID_API_KEY',
        provider
      );
    }

    this.provider = provider;
    this.model = model;
    this.apiKey = trimmedKey;

    console.log(`[${provider}] Initialized with model: ${model}, key length: ${trimmedKey.length}`);
  }

  /**
   * Get the configured AI model based on provider
   */
  private getModel() {
    switch (this.provider) {
      case 'openai': {
        // Use stable Chat Completions API instead of experimental Responses API
        // AI SDK 5+ defaults to Responses API, we explicitly use .chat() for stability
        const openai = createOpenAI({ apiKey: this.apiKey });
        return openai.chat(this.model); // Use .chat() for /v1/chat/completions endpoint
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey: this.apiKey });
        return anthropic(this.model);
      }
      case 'google': {
        const google = createGoogleGenerativeAI({ apiKey: this.apiKey });
        return google(this.model);
      }
      default:
        throw new AIError(`Unsupported provider: ${this.provider}`, 'UNSUPPORTED_PROVIDER');
    }
  }

  /**
   * Call AI with system instruction and prompt
   */
  private async callAI(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      console.log(`[${this.provider}] Calling AI with model: ${this.model}`);
      console.log(`[${this.provider}] Prompt length: ${prompt.length} chars`);
      console.log(`[${this.provider}] System instruction: ${systemInstruction ? 'Yes' : 'No'}`);

      const model = this.getModel();

      const requestParams = {
        model,
        prompt,
        ...(systemInstruction && { system: systemInstruction }),
        temperature: 0.7,
      };

      console.log(`[${this.provider}] Making request with params:`, {
        modelName: this.model,
        temperature: 0.7,
        hasSystem: !!systemInstruction,
      });

      const { text } = await generateText(requestParams);

      console.log(`[${this.provider}] Response received, length: ${text?.length || 0} chars`);

      if (!text || text.trim().length === 0) {
        throw new AIError('No content generated', 'NO_CONTENT', this.provider);
      }

      return text.trim();
    } catch (error) {
      console.error(`[${this.provider}] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof AIError) throw error;

      // Parse provider-specific errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Check for API key errors
      if (errorMessage.toLowerCase().includes('api key') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('authentication')) {
        throw new AIError(
          'Invalid API key. Please check your AI settings.',
          'INVALID_API_KEY',
          this.provider
        );
      }

      // Check for rate limit errors
      if (errorMessage.toLowerCase().includes('rate limit') ||
          errorMessage.toLowerCase().includes('too many requests')) {
        throw new AIError(
          'Rate limit exceeded. Please try again later.',
          'RATE_LIMIT',
          this.provider
        );
      }

      // Check for model errors
      if (errorMessage.toLowerCase().includes('model')) {
        throw new AIError(
          'Invalid model or model not found. Please update your AI settings.',
          'INVALID_MODEL',
          this.provider
        );
      }

      throw new AIError(errorMessage, 'UNKNOWN_ERROR', this.provider);
    }
  }

  async generateContent(options: AIGenerateOptions): Promise<string> {
    const systemInstruction = `You are a helpful AI writing assistant within a note-taking app.
Output only the text to be added or replaced. Do not include conversational filler.`;

    const prompt = options.context
      ? `User Request: ${options.prompt}\n\nCurrent Note Context:\n"${options.context}"`
      : options.prompt;

    return this.callAI(prompt, systemInstruction);
  }

  async generateTitle(content: string): Promise<string> {
    if (!content || content.length < 10) return 'Untitled Note';

    const prompt = `Generate a short, concise (max 5 words) title for this note content. Do not use quotes. Content: ${content.substring(0, 500)}`;

    try {
      const title = await this.callAI(prompt);
      return title || 'Untitled Note';
    } catch (error) {
      console.error('Failed to generate title:', error);
      return 'Untitled Note';
    }
  }

  async continueWriting(context: string): Promise<string> {
    const systemInstruction = `You are a helpful AI writing assistant. Continue the thought flow naturally based on the context provided. Output only the continuation text.`;

    const prompt = `Continue writing the next paragraph based on this context:\n\n"${context}"`;

    return this.callAI(prompt, systemInstruction);
  }

  async summarize(content: string): Promise<string> {
    const systemInstruction = `You are a helpful AI assistant. Summarize the content in bullet points. Be concise and clear.`;

    const prompt = `Summarize the following content:\n\n"${content}"`;

    return this.callAI(prompt, systemInstruction);
  }
}
