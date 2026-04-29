import axios from 'axios';

// Pool of Zhipu AI (Z.ai) API Keys from .env
const ZHIPU_API_KEYS = [
  process.env.ZHIPU_API_KEY,
  process.env.ZHIPU_API_KEY_1,
  process.env.ZHIPU_API_KEY_2,
  process.env.ZHIPU_API_KEY_3,
  process.env.ZHIPU_API_KEY_4,
  process.env.ZHIPU_API_KEY_5,
  process.env.ZHIPU_API_KEY_6,
  process.env.ZHIPU_API_KEY_7,
  process.env.ZHIPU_API_KEY_8,
  process.env.ZHIPU_API_KEY_9,
  process.env.ZHIPU_API_KEY_10,
].filter(key => !!key && key !== 'your_key_here') as string[];

const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * Calls Zhipu AI API with fallback logic across multiple API keys.
 * @param payload The request body for the Zhipu AI API
 * @returns The successful response from axios
 */
export const callZhipuAI = async (payload: any) => {
  let lastError = null;

  if (ZHIPU_API_KEYS.length === 0) {
    throw new Error('No valid Zhipu AI API keys found in environment variables.');
  }

  for (let i = 0; i < ZHIPU_API_KEYS.length; i++) {
    const key = ZHIPU_API_KEYS[i];
    try {
      console.log(`Attempting Z.ai request with key pool index ${i} (ending in ...${key.slice(-4)})`);
      
      const response = await axios.post(ZHIPU_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        timeout: 60000 // 60 seconds timeout
      });

      if (response.status === 200) {
        return response;
      }
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      
      console.warn(`Z.ai Key pool index ${i} failed. Status: ${status}. Error: ${message}. Rotating to next key...`);
      
      // If it's a 401 (Unauthorized) or 429 (Rate Limit), we definitely want to try the next key.
      // For other errors, we also try the next key as per fallback requirement.
      continue;
    }
  }

  console.error('All Zhipu AI API keys in the pool have failed.');
  throw lastError || new Error('All API Keys failed');
};
