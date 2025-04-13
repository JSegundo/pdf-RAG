import axios from 'axios';
import { ChatRequest, ChatResponse, VectorSearchResult, ChatContext, ChatMessage } from '../../types/chat';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../llm/llmService';
import { LLMMessage } from '../llm/types';

export class ChatManager {
    private processingServiceUrl: string;
    private conversationContexts: Map<string, ChatContext>;
    private messageHistory: Map<string, ChatMessage[]>;
    private llmService: LLMService;

    constructor() {
        this.processingServiceUrl = process.env.PROCESSING_SERVICE_URL || 'http://localhost:8000';
        this.conversationContexts = new Map();
        this.messageHistory = new Map();
        this.llmService = new LLMService('anthropic'); // Default to Anthropic
    }

    private async getVectorSearchResults(query: string): Promise<VectorSearchResult[]> {
        try {
            const response = await axios.post(`${this.processingServiceUrl}/api/search`, {
                query,
                top_k: 5,
                min_score: 0.6
            });
            return response.data.results;
        } catch (error) {
            console.error('Error getting vector search results:', error);
            return [];
        }
    }

    private buildContext(searchResults: VectorSearchResult[], conversationId: string): string {
        if (searchResults.length === 0) {
            return 'No relevant context found.';
        }

        // Get previous messages for context
        const previousMessages = this.messageHistory.get(conversationId) || [];
        const recentMessages = previousMessages.slice(-3); // Get last 3 messages

        // Get previous search results from context
        const previousContext = this.conversationContexts.get(conversationId);
        const previousSearchResults = previousContext?.searchResults || [];

        // Combine current and previous search results, removing duplicates
        const allSearchResults = [...new Set([...searchResults, ...previousSearchResults])]
            .sort((a, b) => b.score - a.score) // Sort by score
            .slice(0, 5); // Take top 5 most relevant

        // Build context from search results and conversation history
        const searchContext = allSearchResults
            .map(result => result.text)
            .join('\n\n');

        const conversationContext = recentMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        return `Previous conversation:\n${conversationContext}\n\nRelevant information:\n${searchContext}`;
    }

    private async generateResponse(context: string, userMessage: string): Promise<string> {
        const messages: LLMMessage[] = [
            {
                role: 'system',
                content: `You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.
                
                Context:
                ${context}`
            },
            {
                role: 'user',
                content: userMessage
            }
        ];

        const response = await this.llmService.generateResponse({ messages });
        return response.content;
    }

    private updateMessageHistory(conversationId: string, message: ChatMessage) {
        const history = this.messageHistory.get(conversationId) || [];
        history.push(message);
        this.messageHistory.set(conversationId, history);
    }

    public async handleMessage(request: ChatRequest): Promise<ChatResponse> {
        // Generate or use existing conversation ID
        const conversationId = request.conversationId || uuidv4();

        // Store user message in history
        this.updateMessageHistory(conversationId, {
            role: 'user',
            content: request.message,
            timestamp: Date.now()
        });

        // Get vector search results
        const searchResults = await this.getVectorSearchResults(request.message);

        // Build context from search results and conversation history
        const context = this.buildContext(searchResults, conversationId);

        // Generate response
        const responseMessage = await this.generateResponse(context, request.message);

        // Store assistant message in history
        this.updateMessageHistory(conversationId, {
            role: 'assistant',
            content: responseMessage,
            timestamp: Date.now()
        });

        // Update conversation context with new search results
        this.conversationContexts.set(conversationId, {
            searchResults,
            conversationId
        });

        return {
            message: responseMessage,
            conversationId,
            timestamp: Date.now()
        };
    }

    public getConversationHistory(conversationId: string): ChatMessage[] {
        return this.messageHistory.get(conversationId) || [];
    }

    public setLLMProvider(provider: 'anthropic' | 'openai') {
        this.llmService.setProvider(provider);
    }
} 