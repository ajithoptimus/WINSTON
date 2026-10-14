import Groq from 'groq-sdk';

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const CHAT_MODEL = 'openai/gpt-oss-120b';
export const FALLBACK_CHAT_MODEL = 'qwen/qwen3.8-27b';
export const VISION_MODEL = 'qwen/qwen3.8-27b';

export default groqClient;
