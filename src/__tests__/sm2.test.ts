import { describe, it, expect } from 'vitest';
import { sm2 } from '../lib/sm2';

describe('SM-2 spaced repetition', () => {
  it('should return interval of 1 day on first correct answer', () => {
    const result = sm2(4, 0, 2.5, 0);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('should return interval of 6 days on second correct answer', () => {
    const result = sm2(4, 1, 2.5, 1);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('should multiply by ease factor on subsequent correct answers', () => {
    const result = sm2(4, 2, 2.5, 6);
    expect(result.interval).toBe(15); // 6 * 2.5 = 15
    expect(result.repetitions).toBe(3);
  });

  it('should reset on incorrect answer (quality < 3)', () => {
    const result = sm2(1, 5, 2.5, 30);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('should never let ease factor go below 1.3', () => {
    // Repeatedly bad scores
    let ef = 2.5;
    for (let i = 0; i < 20; i++) {
      const result = sm2(0, 0, ef, 1);
      ef = result.easeFactor;
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  it('should increase ease factor for easy answers', () => {
    const result = sm2(5, 0, 2.5, 0);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('should clamp quality to [0, 5]', () => {
    const low = sm2(-1, 0, 2.5, 0);
    expect(low.interval).toBe(1); // treated as 0 (fail)
    expect(low.repetitions).toBe(0);

    const high = sm2(10, 0, 2.5, 0);
    expect(high.interval).toBe(1); // treated as 5 (pass)
    expect(high.repetitions).toBe(1);
  });

  it('should return a future date for nextReview', () => {
    const result = sm2(4, 0, 2.5, 0);
    expect(result.nextReview.getTime()).toBeGreaterThan(Date.now());
  });
});
