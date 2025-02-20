export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  llm: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.LLM_MODEL || 'claude-3-sonnet-20240229'
  },
  storage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
}; 