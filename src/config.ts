import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ALLOWED_USER_IDS',
  'GROQ_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
  allowedIds: process.env.TELEGRAM_ALLOWED_USER_IDS!.split(',').map(id => parseInt(id.trim())),
  groqKey: process.env.GROQ_API_KEY!,
  dbPath: process.env.DB_PATH || './memory.db',
  elevenLabsKey: process.env.ELEVENLABS_API_KEY,
  model: "llama-3.3-70b-specdec"
};