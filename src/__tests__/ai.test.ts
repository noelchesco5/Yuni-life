import { describe, it, expect } from 'vitest';
import { NEMOTRON_CONFIG } from '../lib/ai/config';
import { getEffectiveApiKey, hasApiKey } from '../lib/ai/openrouter';

describe('Nemotron AI Routing Configuration', () => {
  it('should have primary model set to NVIDIA Nemotron free tier', () => {
    expect(NEMOTRON_CONFIG.primaryModel).toBe('nvidia/nemotron-3.5-lightning:free');
  });

  it('should include Nemotron 3 super and ultra in fallback models', () => {
    expect(NEMOTRON_CONFIG.fallbackModels).toContain('nvidia/nemotron-3-super-120b-a12b:free');
    expect(NEMOTRON_CONFIG.fallbackModels).toContain('nvidia/nemotron-3-ultra-550b-a55b:free');
  });

  it('should enforce safety and privacy guidelines in system prompt', () => {
    expect(NEMOTRON_CONFIG.systemPrompt).toContain('MUHAS');
    expect(NEMOTRON_CONFIG.systemPrompt).toContain('Never request, mention, or process patient data');
    expect(NEMOTRON_CONFIG.systemPrompt).toContain('Clinical Safety Disclaimer');
  });

  it('should recognize available API key', () => {
    expect(hasApiKey()).toBe(true);
    expect(getEffectiveApiKey()).toBeTruthy();
  });
});
