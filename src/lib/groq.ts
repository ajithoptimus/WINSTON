import Groq from 'groq-sdk';

export const CHAT_MODEL = 'openai/gpt-oss-120b';
export const FALLBACK_CHAT_MODEL = 'qwen/qwen3.8-27b';
export const VISION_MODEL = 'qwen/qwen3.8-27b';

// Lazy client instantiation to prevent build-time crashes when GROQ_API_KEY is not yet loaded
let clientInstance: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY || 'dummy_key_for_build_step';

  if (!clientInstance) {
    clientInstance = new Groq({ apiKey });
  }
  return clientInstance;
}

// Proxy for backward compatibility with imports of `groqClient`
const groqClient = new Proxy({} as Groq, {
  get(_target, prop) {
    const client = getGroqClient();
    const val = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export default groqClient;
