export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ChatRequest {
    message: string;
    conversationId?: string;
}

export interface ChatResponse {
    message: string;
    conversationId: string;
    timestamp: number;
}

export interface VectorSearchResult {
    text: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface ChatContext {
    searchResults: VectorSearchResult[];
    conversationId: string;
} 