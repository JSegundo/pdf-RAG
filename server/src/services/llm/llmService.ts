export interface LLMService {
  summarize(text: string): Promise<string>;
  analyze(text: string, prompt: string): Promise<string>;
}

export class AnthropicService implements LLMService {
  async summarize(text: string): Promise<string> {
    // Anthropic implementation
    throw new Error('Not implemented');
  }

  async analyze(text: string, prompt: string): Promise<string> {
    // Anthropic implementation
    throw new Error('Not implemented');
  }
} 