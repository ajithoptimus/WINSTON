import Groq from 'groq-sdk';

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const CHAT_MODEL = 'llama-3.3-70b-versatile';
export const VISION_MODEL = 'llama-3.2-90b-vision-preview';

export default groqClient;
