import OpenAI from 'openai';
import { LLMProvider, LLMRequest, LLMResponse } from './types';

export class OpenAILLMProvider implements LLMProvider {
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        this.client = new OpenAI({ apiKey });
    }

    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: request.messages,
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 500
            });

            return {
                content: completion.choices[0].message.content || 'Sorry, I could not generate a response.'
            };
        } catch (error) {
            console.error('Error generating response with OpenAI:', error);
            return {
                content: 'Sorry, there was an error generating the response.',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
} 