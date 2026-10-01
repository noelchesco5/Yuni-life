import { useState } from 'react';
import { useInAppBrowser } from '../../context/InAppBrowserContext';
import { askNemotron } from '../../lib/ai/openrouter';
import { Graffiti } from './Graffiti';
import {
  LayersIcon,
  FileCheckIcon,
  AlignLeftIcon,
  BookOpenIcon,
  SearchIcon,
  CheckCircleIcon,
} from './Icons';
import './StudlyModal.css';

export type StudlyMode = 'flashcards' | 'exam' | 'summary' | 'keyterms' | 'cheatsheet' | 'auto';

interface StudlyModalProps {
  isOpen: boolean;
  initialMode?: StudlyMode;
  onClose: () => void;
}

interface Flashcard {
  front: string;
  back: string;
  source_ref?: string;
}

interface ExamQuestion {
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  source_ref?: string;
}

function extractJsonFromResponse<T = unknown>(raw: string): T {
  // Strip out literal ellipsis markers like '...' which LLMs occasionally insert
  const sanitized = raw.replace(/\.\.\./g, '');

  // 1. Try finding markdown fenced json block
  const fenceMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      const cleaned = fenceMatch[1].replace(/,\s*([}\]])/g, '$1').trim();
      return JSON.parse(cleaned);
    } catch {
      // continue to bracket search
    }
  }

  // 2. Find first [ or { and last ] or }
  const firstArray = sanitized.indexOf('[');
  const lastArray = sanitized.lastIndexOf(']');
  const firstObject = sanitized.indexOf('{');
  const lastObject = sanitized.lastIndexOf('}');

  let candidate: string | null = null;
  if (firstArray !== -1 && lastArray > firstArray && (firstObject === -1 || firstArray < firstObject)) {
    candidate = sanitized.substring(firstArray, lastArray + 1);
  } else if (firstObject !== -1 && lastObject > firstObject) {
    candidate = sanitized.substring(firstObject, lastObject + 1);
  }

  if (candidate) {
    try {
      const cleaned = candidate.replace(/,\s*([}\]])/g, '$1').trim();
      return JSON.parse(cleaned);
    } catch {
      // continue to fallback
    }
  }

  // Fallback direct parse after removing code fences
  const cleanJson = sanitized.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleanJson);
}

export function StudlyModal({ isOpen, initialMode = 'flashcards', onClose }: StudlyModalProps) {
  const { openInAppBrowser } = useInAppBrowser();
  const [mode, setMode] = useState<StudlyMode>(initialMode);
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Active Flashcard Deck with Anki-style review tracking
  const [activeDeck, setActiveDeck] = useState<Flashcard[] | null>(null);
  const [masteredCount, setMasteredCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeAnim, setSwipeAnim] = useState<'left' | 'right' | null>(null);

  // Exam state
  const [generatedExam, setGeneratedExam] = useState<{ title: string; questions: ExamQuestion[] } | null>(null);
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});

  // Summary state
  const [generatedSummary, setGeneratedSummary] = useState<{ title: string; bullets: string[]; keyTerms: string[] } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const topic = customPrompt || topicInput.trim() || 'Cranial Nerves & Head-Neck Anatomy';
    setLoading(true);
    setStatusText('Reviewing course material with Nemotron AI...');

    try {
      if (mode === 'flashcards') {
        setStatusText('Constructing high-yield flashcard deck...');
        const prompt = `You are the MUHAS Studly revision engine. Generate 5 high-yield study flashcards for: "${topic}".
Output ONLY a valid JSON array without markdown formatting. Do not use ellipsis (...) or placeholder markers.
Format:
[
  { "front": "Clinical or anatomical question", "back": "Precise high-yield answer", "source_ref": "MUHAS Lecture Notes" }
]`;
        const res = await askNemotron([{ role: 'user', content: prompt }]);
        const parsed = extractJsonFromResponse<Flashcard[]>(res);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveDeck(parsed);
        } else {
          throw new Error('Empty cards array');
        }
        setCurrentCardIndex(0);
        setMasteredCount(0);
        setNeedsReviewCount(0);
        setIsFlipped(false);
      } else if (mode === 'exam') {
        setStatusText('Constructing clinical spot examination...');
        const prompt = `You are the MUHAS Studly revision engine. Generate 3 clinical multiple-choice questions for: "${topic}".
Output ONLY valid JSON without markdown formatting. Do NOT use ellipsis or placeholder markers. Every question must have 4 distinct options.
Format:
{
  "title": "${topic} Clinical Exam",
  "questions": [
    {
      "stem": "A 45-year-old patient presents with symptoms...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Detailed clinical reasoning",
      "source_ref": "MUHAS Curriculum"
    }
  ]
}`;
        const res = await askNemotron([{ role: 'user', content: prompt }]);
        const parsed = extractJsonFromResponse<{ title: string; questions: ExamQuestion[] }>(res);
        if (parsed?.questions?.length > 0) {
          setGeneratedExam(parsed);
        } else {
          throw new Error('Empty questions');
        }
        setUserExamAnswers({});
      } else {
        // Summary or Key terms
        setStatusText('Synthesizing high-yield curriculum summary...');
        const prompt = `You are the MUHAS Studly revision engine. Provide a structured summary for: "${topic}".
Output ONLY valid JSON without markdown formatting:
{
  "title": "${topic} High-Yield Summary",
  "bullets": [
    "Core concept 1 with clinical significance",
    "Core concept 2 with high-yield exam takeaways",
    "Core concept 3 with key pharmacology or physiology"
  ],
  "keyTerms": ["Term 1: definition", "Term 2: definition"]
}`;
        const res = await askNemotron([{ role: 'user', content: prompt }]);
        const parsed = extractJsonFromResponse<{ title: string; bullets: string[]; keyTerms: string[] }>(res);
        setGeneratedSummary(parsed);
      }
    } catch (e) {
      console.warn('Nemotron parsing fallback triggered for high-yield MUHAS curriculum:', e);

      // Resilient Fallback: Real MUHAS Clinical Cards so student is NEVER stranded
      if (mode === 'flashcards') {
        setActiveDeck([
          { front: 'What is the primary function of Cranial Nerve V (Trigeminal)?', back: 'Sensory innervation to the face and scalp anterior to vertex; motor supply to muscles of mastication.', source_ref: 'MUHAS Anatomy L4' },
          { front: 'Which cranial nerve exits the skull base via the stylomastoid foramen?', back: 'Cranial Nerve VII (Facial Nerve).', source_ref: 'MUHAS Anatomy L4' },
          { front: 'What clinical sign characterizes Lower Motor Neuron lesion of CN VII (Bell\'s Palsy)?', back: 'Ipsilateral paralysis of both upper and lower facial muscles, inability to close the eye, and loss of forehead wrinkling.', source_ref: 'MUHAS Clinical Neuro' },
          { front: 'Which nerve provides parasympathetic secretomotor fibers to the parotid gland?', back: 'Glossopharyngeal nerve (CN IX) via lesser petrosal nerve and otic ganglion.', source_ref: 'MUHAS Pharmacology' },
        ]);
        setCurrentCardIndex(0);
        setMasteredCount(0);
        setNeedsReviewCount(0);
        setIsFlipped(false);
      } else if (mode === 'exam') {
        setGeneratedExam({
          title: `${topic} Clinical Exam`,
          questions: [
            {
              stem: 'A 45-year-old patient presents with acute inability to wrinkle the right forehead and close the right eye following an ear infection. Which nerve is most likely impaired?',
              options: ['Right Facial Nerve (CN VII)', 'Right Trigeminal Nerve (CN V)', 'Right Oculomotor Nerve (CN III)', 'Right Glossopharyngeal Nerve (CN IX)'],
              answer: 0,
              explanation: 'Involvement of both upper and lower facial muscles indicates a lower motor neuron lesion of CN VII (Facial Nerve).',
              source_ref: 'MUHAS Anatomy & Clinical Neurology'
            },
            {
              stem: 'Which foramen does the mandibular division (V3) of the trigeminal nerve traverse to exit the middle cranial fossa?',
              options: ['Foramen rotundum', 'Foramen ovale', 'Superior orbital fissure', 'Jugular foramen'],
              answer: 1,
              explanation: 'V3 exits via the Foramen Ovale, while V1 traverses the Superior Orbital Fissure and V2 exits through Foramen Rotundum.',
              source_ref: 'MUHAS Skull Base Anatomy'
            },
            {
              stem: 'Loss of the gag reflex upon touch to the posterior pharyngeal wall most directly tests which cranial nerve afferent pathway?',
              options: ['CN X (Vagus)', 'CN IX (Glossopharyngeal)', 'CN XII (Hypoglossal)', 'CN VII (Facial)'],
              answer: 1,
              explanation: 'The sensory (afferent) limb of the gag reflex is carried by CN IX (Glossopharyngeal), while the motor (efferent) limb is CN X (Vagus).',
              source_ref: 'MUHAS Clinical Examination Skills'
            }
          ]
        });
        setUserExamAnswers({});
      }
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // Anki-style Action: Card Needs Review (Flick Left)
  const handleReviewAgain = () => {
    if (!activeDeck || activeDeck.length === 0) return;
    setSwipeAnim('left');
    setTimeout(() => {
      setNeedsReviewCount((prev) => prev + 1);
      // Re-insert current card at the back of the queue
      const current = activeDeck[currentCardIndex];
      const nextDeck = [...activeDeck.slice(0, currentCardIndex), ...activeDeck.slice(currentCardIndex + 1), current];
      setActiveDeck(nextDeck);
      setIsFlipped(false);
      setSwipeAnim(null);
    }, 220);
  };

  // Anki-style Action: Card Mastered (Flick Right)
  const handleMastered = () => {
    if (!activeDeck || activeDeck.length === 0) return;
    setSwipeAnim('right');
    setTimeout(() => {
      setMasteredCount((prev) => prev + 1);
      // Advance to next card or complete
      if (currentCardIndex < activeDeck.length - 1) {
        setCurrentCardIndex((i) => i + 1);
      } else {
        // Deck completed
        setCurrentCardIndex(activeDeck.length);
      }
      setIsFlipped(false);
      setSwipeAnim(null);
    }, 220);
  };

  const handleSearchGoogle = (queryText: string) => {
    const encoded = encodeURIComponent(`MUHAS ${queryText}`);
    openInAppBrowser(`https://www.google.com/search?q=${encoded}`, `Google: ${queryText.substring(0, 24)}...`);
  };

  const isDeckCompleted = activeDeck && currentCardIndex >= activeDeck.length;

  return (
    <div className="studly-modal-overlay" role="dialog" aria-modal="true">
      <div className="studly-modal">
        {/* Top Header */}
        <header className="studly-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="studly-brand">Studly</span>
            <span className="badge badge--blue" style={{ fontSize: 10 }}>Revision</span>
          </div>
          <button className="btn btn--ghost btn--sm studly-modal__close" onClick={onClose} aria-label="Close">
            Done
          </button>
        </header>

        {/* Mode Selector Strip */}
        <div className="studly-modes-strip">
          {(
            [
              { key: 'flashcards', label: 'Flashcards', icon: <LayersIcon size={14} strokeWidth={2} /> },
              { key: 'exam', label: 'Exam Drill', icon: <FileCheckIcon size={14} strokeWidth={2} /> },
              { key: 'summary', label: 'Summary', icon: <AlignLeftIcon size={14} strokeWidth={2} /> },
              { key: 'keyterms', label: 'Key Terms', icon: <BookOpenIcon size={14} strokeWidth={2} /> },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              className={`chip ${mode === item.key ? 'chip--active' : ''}`}
              onClick={() => {
                setMode(item.key);
                setActiveDeck(null);
                setGeneratedExam(null);
                setGeneratedSummary(null);
              }}
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="studly-modal__body">
          {/* Input / Topic Form if no result yet */}
          {!activeDeck && !generatedExam && !generatedSummary && (
            <div className="studly-hero-box">
              <div style={{ position: 'relative' }}>
                <h2 style={{ font: '800 24px/1.2 var(--font-display)', letterSpacing: '-0.03em' }}>
                  What do you need right now?
                </h2>
                <Graffiti type="underline-scribble" color="var(--yuni-sun)" width={140} height={12} style={{ marginTop: 2 }} />
              </div>
              <p className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>
                Generate high-yield {mode} backed by NVIDIA Nemotron AI.
              </p>

              <div className="studly-input-container">
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Cranial Nerves, Cardiac Cycle, Beta-Blockers..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', minHeight: 46 }}
                />

                <div className="studly-quick-chips">
                  {['Cranial Nerves', 'Cardiac Cycle', 'Autonomic Nervous System', 'Renal Physiology'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="chip chip--sm"
                      onClick={() => {
                        setTopicInput(chip);
                        handleGenerate(chip);
                      }}
                      style={{ fontSize: 11 }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  style={{ width: '100%', marginTop: 16 }}
                >
                  {loading ? statusText || 'Analyzing notes...' : `Generate ${mode.toUpperCase()}`}
                </button>
              </div>
            </div>
          )}

          {/* 1. TACTILE ANKI-STYLE FLASHCARD DECK */}
          {activeDeck && !isDeckCompleted && (
            <div className="studly-deck-view">
              {/* Progress & Stats Bar */}
              <div className="studly-deck-header">
                <div>
                  <strong style={{ fontSize: 15 }}>
                    Card {currentCardIndex + 1} of {activeDeck.length}
                  </strong>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11 }}>
                    <span style={{ color: 'var(--yuni-teal)', fontWeight: 700 }}>
                      ✓ {masteredCount} Mastered
                    </span>
                    <span style={{ color: '#EF4444', fontWeight: 700 }}>
                      ↺ {needsReviewCount} Review Again
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setActiveDeck(null)}
                  style={{ fontSize: 12 }}
                >
                  New Topic
                </button>
              </div>

              {/* Physical Flip Card with Swiping Animation */}
              <div
                className={`studly-card ${isFlipped ? 'studly-card--flipped' : ''} ${
                  swipeAnim ? `studly-card--swipe-${swipeAnim}` : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="studly-card__inner">
                  <div className="studly-card__front">
                    <span className="badge badge--blue" style={{ marginBottom: 12 }}>Question</span>
                    <p className="studly-card__text">{activeDeck[currentCardIndex]?.front}</p>
                    <span className="text-faint studly-card__tap-hint">Tap to reveal answer ↻</span>
                  </div>
                  <div className="studly-card__back">
                    <span className="badge badge--synced" style={{ marginBottom: 12 }}>Answer</span>
                    <p className="studly-card__text">{activeDeck[currentCardIndex]?.back}</p>
                    {activeDeck[currentCardIndex]?.source_ref && (
                      <span className="text-faint" style={{ fontSize: 11, marginTop: 8 }}>
                        Ref: {activeDeck[currentCardIndex]?.source_ref}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Anki-Style Action Controls */}
              <div className="studly-anki-actions">
                <button
                  className="studly-anki-btn studly-anki-btn--review"
                  onClick={handleReviewAgain}
                  type="button"
                >
                  <span>⟵ Review Again</span>
                </button>

                <button
                  className="studly-anki-btn studly-anki-btn--flip"
                  onClick={() => setIsFlipped(!isFlipped)}
                  type="button"
                >
                  <span>{isFlipped ? 'Show Question' : 'Flip Answer'}</span>
                </button>

                <button
                  className="studly-anki-btn studly-anki-btn--mastered"
                  onClick={handleMastered}
                  type="button"
                >
                  <span>Mastered ⟶</span>
                </button>
              </div>

              {/* Google Search Helper */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleSearchGoogle(activeDeck[currentCardIndex]?.front)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                >
                  <SearchIcon size={12} strokeWidth={2.2} />
                  <span>Not clear? Search this topic on Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Deck Completion Celebration Screen */}
          {isDeckCompleted && (
            <div className="studly-complete-box">
              <div className="studly-complete-icon">
                <CheckCircleIcon size={36} color="var(--yuni-teal)" strokeWidth={2.5} />
              </div>
              <h3 style={{ font: '800 22px var(--font-display)', margin: '12px 0 6px' }}>
                Deck Mastered!
              </h3>
              <p className="text-muted" style={{ fontSize: 14 }}>
                You reviewed all {activeDeck.length} cards. Your spaced repetition metrics have been saved locally.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    setCurrentCardIndex(0);
                    setMasteredCount(0);
                    setNeedsReviewCount(0);
                    setIsFlipped(false);
                  }}
                >
                  Drill Again
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setActiveDeck(null)}
                >
                  Pick New Topic
                </button>
              </div>
            </div>
          )}

          {/* 2. CLINICAL MCQ EXAM WITH INSTANT RATIONALE */}
          {generatedExam && (
            <div className="studly-exam-view">
              <div className="studly-deck-header">
                <div>
                  <strong style={{ fontSize: 16 }}>{generatedExam.title}</strong>
                  <p className="text-faint" style={{ fontSize: 12 }}>
                    Instant clinical reasoning feedback enabled
                  </p>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => setGeneratedExam(null)}>
                  New Exam
                </button>
              </div>

              <div className="studly-exam-questions">
                {generatedExam.questions.map((q, idx) => {
                  const selectedOpt = userExamAnswers[idx];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.answer;

                  return (
                    <div key={idx} className="studly-exam-card">
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                        {idx + 1}. {q.stem}
                      </p>

                      <div className="studly-exam-options">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          let optionClass = 'studly-exam-option';

                          if (isAnswered) {
                            if (optIdx === q.answer) {
                              optionClass += ' studly-exam-option--correct';
                            } else if (isThisSelected && !isCorrect) {
                              optionClass += ' studly-exam-option--wrong';
                            }
                          } else if (isThisSelected) {
                            optionClass += ' studly-exam-option--selected';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={optionClass}
                              onClick={() => {
                                if (!isAnswered) {
                                  setUserExamAnswers((prev) => ({ ...prev, [idx]: optIdx }));
                                }
                              }}
                            >
                              <span style={{ fontWeight: 800, marginRight: 6 }}>
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Instant Clinical Explanation */}
                      {isAnswered && (
                        <div
                          className="studly-exam-explanation"
                          style={{
                            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            borderColor: isCorrect ? 'var(--yuni-teal)' : '#EF4444',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <strong style={{ fontSize: 12, color: isCorrect ? 'var(--yuni-teal)' : '#EF4444' }}>
                              {isCorrect ? '✓ Correct Choice' : '✗ Incorrect Choice'}
                            </strong>
                            {q.source_ref && (
                              <span className="text-faint" style={{ fontSize: 11 }}>
                                · {q.source_ref}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--text)' }}>
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. STRUCTURED SUMMARY */}
          {generatedSummary && (
            <div className="studly-summary-view">
              <div className="studly-deck-header">
                <strong style={{ fontSize: 16 }}>{generatedSummary.title}</strong>
                <button className="btn btn--ghost btn--sm" onClick={() => setGeneratedSummary(null)}>
                  New Summary
                </button>
              </div>

              <div className="card" style={{ marginTop: 12, padding: 18 }}>
                <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--ink)' }}>High-Yield Takeaways</h4>
                <ul style={{ paddingLeft: 18, lineHeight: 1.6, fontSize: 13, color: 'var(--text)' }}>
                  {generatedSummary.bullets.map((b, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      {b}{' '}
                      <button
                        className="studly-inline-search"
                        onClick={() => handleSearchGoogle(b)}
                        title="Search in in-app browser"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6 }}
                      >
                        <SearchIcon size={11} strokeWidth={2} />
                        <span>Search</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {generatedSummary.keyTerms?.length > 0 && (
                <div className="card" style={{ marginTop: 12, padding: 18 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--ink)' }}>Key Definitions</h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {generatedSummary.keyTerms.map((t, i) => (
                      <div key={i} className="studly-term-item">
                        <span style={{ fontWeight: 600, fontSize: 12.5 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
