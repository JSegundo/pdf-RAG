export interface LLMResponse {
    content: string;
    error?: string;
}

export interface LLMRequest {
    messages: LLMMessage[];
    temperature?: number;
    maxTokens?: number;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMProvider {
    generateResponse(request: LLMRequest): Promise<LLMResponse>;
} 