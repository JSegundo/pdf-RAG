import { LLMProvider, LLMRequest, LLMResponse } from './types';
import { AnthropicLLMProvider } from './anthropicProvider';
import { OpenAILLMProvider } from './openaiProvider';

export class LLMService {
    private provider: LLMProvider;
    private defaultConfig: Partial<LLMRequest> = {
        temperature: 0.7,
        maxTokens: 1000
    };

    constructor(provider: 'anthropic' | 'openai' = 'anthropic') {
        this.provider = this.createProvider(provider);
    }

    private createProvider(provider: 'anthropic' | 'openai'): LLMProvider {
        switch (provider) {
            case 'anthropic':
                return new AnthropicLLMProvider();
            case 'openai':
                return new OpenAILLMProvider();
            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }
    }

    public async generateResponse(request: LLMRequest): Promise<LLMResponse> {
        const fullRequest = {
            ...this.defaultConfig,
            ...request
        };

        return this.provider.generateResponse(fullRequest);
    }

    public setProvider(provider: 'anthropic' | 'openai') {
        this.provider = this.createProvider(provider);
    }

    public updateDefaultConfig(config: Partial<LLMRequest>) {
        this.defaultConfig = {
            ...this.defaultConfig,
            ...config
        };
    }
} 