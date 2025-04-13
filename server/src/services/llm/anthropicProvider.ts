import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMRequest, LLMResponse } from './types';

export class AnthropicLLMProvider implements LLMProvider {
    private client: Anthropic;

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }
        this.client = new Anthropic({ apiKey });
    }

    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-opus-20240229',
                max_tokens: request.maxTokens || 1000,
                temperature: request.temperature || 0.7,
                messages: request.messages.map(msg => {
                    if (msg.role === 'system') {
                        return {
                            role: 'user',
                            content: msg.content
                        };
                    }
                    return {
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content
                    };
                })
            });

            return {
                content: response.content[0].text
            };
        } catch (error) {
            console.error('Error generating response with Anthropic:', error);
            return {
                content: 'Sorry, there was an error generating the response.',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
} 