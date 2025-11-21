/**
 * AI Service - Provider-Agnostic Interface
 * Factory for creating AI provider instances using Vercel AI SDK
 */

import type { AIProvider, AIProviderType, AIConfig } from './types';
import { AIError } from './types';
import { VercelAIProvider } from './providers/vercel-ai-provider';

export class AIService {
  /**
   * Create a provider instance based on config
   * @param config - Provider configuration with API key
   * @returns AIProvider instance
   */
  static createProvider(config: AIConfig): AIProvider {
    // Map old provider names to new ones
    const providerMap: Record<string, 'openai' | 'anthropic' | 'google'> = {
      'openai': 'openai',
      'claude': 'anthropic',
      'anthropic': 'anthropic',
      'gemini': 'google',
      'google': 'google',
    };

    const mappedProvider = providerMap[config.provider];
    if (!mappedProvider) {
      throw new AIError(
        `Unsupported AI provider: ${config.provider}`,
        'UNSUPPORTED_PROVIDER'
      );
    }

    // Default models if not specified
    const defaultModels: Record<string, string> = {
      'openai': 'gpt-4o-mini',
      'anthropic': 'claude-3-5-sonnet-20241022',
      'google': 'gemini-pro',
    };

    const model = config.model || defaultModels[mappedProvider];

    return new VercelAIProvider(mappedProvider, model, config.apiKey);
  }

  /**
   * Get provider instance directly from config
   * Use this for one-off calls with user-specific settings
   */
  static getProvider(config: AIConfig): AIProvider {
    return this.createProvider(config);
  }
}

// Export types and providers for direct use if needed
export { AIProvider, AIProviderType, AIConfig, AIError };
export { VercelAIProvider };
