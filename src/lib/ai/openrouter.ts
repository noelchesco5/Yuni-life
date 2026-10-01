import { NEMOTRON_CONFIG } from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface KeyQuotaInfo {
  label: string;
  isFreeTier: boolean;
  dailyRequestsLimit: number;
  dailyRequestsRemaining: number;
  dailyRequestsUsed: number;
}

// In-memory cache for repeated queries within the session
const responseCache = new Map<string, string>();

/**
 * Get active API key (BYOK in localStorage overrides default env key)
 */
export function getEffectiveApiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(NEMOTRON_CONFIG.byokStorageKey);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  }
  return (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '';
}

/**
 * Set custom BYOK key
 */
export function setCustomApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(NEMOTRON_CONFIG.byokStorageKey);
  } else {
    localStorage.setItem(NEMOTRON_CONFIG.byokStorageKey, key.trim());
  }
}

/**
 * Check if an API key is available
 */
export function hasApiKey(): boolean {
  return Boolean(getEffectiveApiKey());
}

/**
 * Inspect API Key info and remaining daily free quota
 */
export async function getKeyQuota(): Promise<KeyQuotaInfo | null> {
  const apiKey = getEffectiveApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(NEMOTRON_CONFIG.authEndpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const d = data.data;

    return {
      label: d.label || 'OpenRouter Key',
      isFreeTier: d.is_free_tier ?? false,
      dailyRequestsLimit: d.free_model_daily_requests?.limit ?? 1000,
      dailyRequestsRemaining: d.free_model_daily_requests?.remaining ?? 1000,
      dailyRequestsUsed: d.free_model_daily_requests?.used ?? 0,
    };
  } catch (err) {
    console.warn('Failed to fetch key quota:', err);
    return null;
  }
}

/**
 * Send chat completion to OpenRouter, strictly routed to Nemotron models.
 */
export async function askNemotron(
  messages: ChatMessage[],
  options?: {
    course?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const apiKey = getEffectiveApiKey();
  if (!apiKey) {
    throw new Error('No OpenRouter API key found. Please configure an API key in Me settings.');
  }

  // Prepend system prompt if not present
  const fullMessages: ChatMessage[] = [];
  if (!messages.some((m) => m.role === 'system')) {
    let sys = NEMOTRON_CONFIG.systemPrompt;
    if (options?.course) {
      sys += `\n\nCurrent Course Context: ${options.course}`;
    }
    fullMessages.push({ role: 'system', content: sys });
  }
  fullMessages.push(...messages);

  // Cache check for last user prompt
  const cacheKey = JSON.stringify(fullMessages);
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  // Multi-tier Nemotron fallback list
  const modelsToTry = [NEMOTRON_CONFIG.primaryModel, ...NEMOTRON_CONFIG.fallbackModels];

  let lastError: Error | null = null;

  // Try routing through Nemotron models
  for (const model of modelsToTry) {
    try {
      const response = await fetch(NEMOTRON_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': NEMOTRON_CONFIG.siteUrl,
          'X-Title': NEMOTRON_CONFIG.siteName,
        },
        body: JSON.stringify({
          model,
          // OpenRouter fallback support
          models: modelsToTry,
          route: 'fallback',
          messages: fullMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter (${model}) error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(`Empty response from ${model}`);
      }

      // Cache result
      responseCache.set(cacheKey, content);
      return content;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Nemotron model ${model} failed, trying fallback...`, err);
      // Loop continues to next model
    }
  }

  throw lastError || new Error('All Nemotron model endpoints failed. Please check network or rate limits.');
}

/**
 * Generate spaced-repetition flashcards using Nemotron
 */
export async function generateFlashcardsWithNemotron(
  topicOrNotes: string,
  count = 5
): Promise<Array<{ front: string; back: string }>> {
  const prompt = `Generate exactly ${count} high-yield medical/study flashcards based on the following topic or notes:
"""
${topicOrNotes}
"""

Format your response as a valid JSON array only, with no markdown code fences and no extra conversational text, using this exact format:
[
  { "front": "Question or term here", "back": "Clear, concise high-yield answer or definition here" }
]`;

  const raw = await askNemotron([
    {
      role: 'user',
      content: prompt,
    },
  ]);

  try {
    // Extract JSON block if surrounded by markdown code fences
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        front: String(item.front || ''),
        back: String(item.back || ''),
      }));
    }
  } catch (e) {
    console.error('Failed to parse flashcard JSON from Nemotron response:', raw, e);
  }

  // Fallback parsing if JSON wasn't returned cleanly
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const cards: Array<{ front: string; back: string }> = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    cards.push({
      front: lines[i].replace(/^[0-9]+[.:)]\s*/, '').replace(/^(Q|Front):\s*/i, ''),
      back: lines[i + 1].replace(/^(A|Back):\s*/i, ''),
    });
  }

  return cards;
}
