/**
 * AI Configuration for Yuni Life.
 *
 * Configured to always route to NVIDIA Nemotron models on OpenRouter (:free tier),
 * which provide an exceptionally generous 1,000,000 token context window,
 * high reasoning capability for medical/health sciences, and zero token cost.
 */

export const NEMOTRON_CONFIG = {
  // Primary model — 1M context, blazing fast, 0 cost
  primaryModel: (import.meta.env.VITE_OPENROUTER_PRIMARY_MODEL as string) || 'nvidia/nemotron-3.5-lightning:free',

  // Fallback models within the generous Nemotron family (OpenRouter allows max 3 models total)
  fallbackModels: [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
  ],

  // OpenRouter endpoints
  apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  authEndpoint: 'https://openrouter.ai/api/v1/auth/key',

  // App headers for OpenRouter
  siteUrl: (import.meta.env.VITE_SITE_URL as string) || 'https://yuni.muhas.ac.tz',
  siteName: (import.meta.env.VITE_SITE_NAME as string) || 'Yuni Life - MUHAS Student App',

  // Storage key for BYOK (Bring Your Own Key)
  byokStorageKey: 'yuni_openrouter_byok_key',

  // System prompt tailored for MUHAS curriculum and guidelines
  systemPrompt: `You are the Yuni Study Companion, an intelligent academic tutor for students at MUHAS (Muhimbili University of Health and Allied Sciences) in Dar es Salaam, Tanzania.

Key Guidelines:
1. Academic Rigor: Deliver clear, high-yield, structured medical and healthcare science explanations suitable for university students.
2. Clinical Safety Disclaimer: Whenever discussing clinical conditions, pharmacology, or treatment pathways, remind the student to cross-check with official MUHAS lecture notes, departmental protocols, and course instructors.
3. Strict Privacy: Never request, mention, or process patient data or real patient identifiers.
4. Language: Answer fluently in English, but you may incorporate common Tanzanian academic terminology or Swahili medical greetings (e.g., 'Habari', 'Mambo') when appropriate.
5. Tone: Encouraging, concise, respectful, and academically precise. Use bullet points and bold highlights for readability.`,
};
