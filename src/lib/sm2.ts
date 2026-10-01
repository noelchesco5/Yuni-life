/**
 * SM-2 spaced repetition algorithm — pure TypeScript, no AI needed.
 *
 * Based on the SuperMemo-2 algorithm by Piotr Wozniak.
 * Returns the next review date and updated card difficulty.
 */

export interface SM2Result {
  interval: number;      // days until next review
  easeFactor: number;    // updated ease factor (min 1.3)
  repetitions: number;   // number of consecutive correct responses
  nextReview: Date;      // the exact next review date
}

/**
 * Calculate next review interval using SM-2.
 *
 * @param quality - Quality of response (0-5). 0-2 = fail, 3 = hard, 4 = good, 5 = easy.
 * @param repetitions - Number of consecutive correct reviews.
 * @param easeFactor - Current ease factor (default 2.5).
 * @param interval - Current interval in days (default 0).
 */
export function sm2(
  quality: number,
  repetitions: number = 0,
  easeFactor: number = 2.5,
  interval: number = 0,
): SM2Result {
  // Clamp quality to [0, 5]
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  let newInterval: number;
  let newReps: number;
  let newEF: number;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newReps = repetitions + 1;
  } else {
    // Incorrect — reset
    newInterval = 1;
    newReps = 0;
  }

  // Update ease factor
  newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEF,
    repetitions: newReps,
    nextReview,
  };
}
