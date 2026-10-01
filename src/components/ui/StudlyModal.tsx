import { useState } from 'react';
import { useInAppBrowser } from '../../context/InAppBrowserContext';
import { askNemotron } from '../../lib/ai/openrouter';
import { Graffiti } from './Graffiti';
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
  difficulty?: number;
}

interface ExamQuestion {
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  source_ref?: string;
}

export function StudlyModal({ isOpen, initialMode = 'flashcards', onClose }: StudlyModalProps) {
  const { openInAppBrowser } = useInAppBrowser();
  const [mode, setMode] = useState<StudlyMode>(initialMode);
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[] | null>(null);
  const [generatedExam, setGeneratedExam] = useState<{ title: string; questions: ExamQuestion[] } | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<{ title: string; bullets: string[]; keyTerms: string[] } | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const topic = customPrompt || topicInput.trim() || 'Cranial Nerves & Neuroanatomy';
    setLoading(true);
    setStatusText('Reviewing course material...');

    try {
      if (mode === 'flashcards') {
        setStatusText('Generating high-yield flashcards...');
        const prompt = `You are the MUHAS Studly revision engine. Generate 5 high-yield study flashcards for: "${topic}".
Output ONLY valid JSON array without markdown formatting:
[
  { "front": "Question/concept", "back": "High-yield answer", "source_ref": "Lecture 2, slide 14" }
]`;
        const res = await askNemotron([{ role: 'user', content: prompt }]);
        const cleanJson = res.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        setGeneratedFlashcards(parsed);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } else if (mode === 'exam') {
        setStatusText('Constructing practice exam...');
        const prompt = `You are the MUHAS Studly revision engine. Generate a 3-question MCQ exam for: "${topic}".
Output ONLY valid JSON without markdown formatting:
{
  "title": "${topic} Assessment",
  "questions": [
    {
      "stem": "Question stem here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Clear clinical reasoning",
      "source_ref": "MUHAS Curriculum"
    }
  ]
}`;
        const res = await askNemotron([{ role: 'user', content: prompt }]);
        const cleanJson = res.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        setGeneratedExam(parsed);
        setUserExamAnswers({});
        setExamSubmitted(false);
      } else {
        // Summary or Key terms
        setStatusText('Synthesizing high-yield summary...');
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
        const cleanJson = res.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        setGeneratedSummary(parsed);
      }
    } catch (e) {
      console.error('Studly generation error:', e);
      // Fallback local high-yield cards so student is never stuck
      if (mode === 'flashcards') {
        setGeneratedFlashcards([
          { front: 'What is the function of Cranial Nerve V (Trigeminal)?', back: 'Sensory to face, motor to muscles of mastication.', source_ref: 'Anatomy L4' },
          { front: 'Which cranial nerve exits via the stylomastoid foramen?', back: 'Cranial Nerve VII (Facial Nerve).', source_ref: 'Anatomy L4' },
          { front: 'What clinical sign is characteristic of Bell\'s Palsy?', back: 'Unilateral facial paralysis affecting both upper and lower facial muscles.', source_ref: 'Clinical Neuro' },
        ]);
      }
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleSearchGoogle = (queryText: string) => {
    const encoded = encodeURIComponent(`MUHAS ${queryText}`);
    openInAppBrowser(`https://www.google.com/search?q=${encoded}`, `Google: ${queryText.substring(0, 24)}...`);
  };

  return (
    <div className="studly-modal-overlay" role="dialog" aria-modal="true">
      <div className="studly-modal">
        {/* Top Header */}
        <header className="studly-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="studly-brand">Studly</span>
            <Graffiti type="star-burst" color="var(--yuni-sun)" width={18} height={18} />
            <span className="badge badge--blue" style={{ fontSize: 10 }}>Revision</span>
          </div>
          <button className="btn btn--ghost btn--sm studly-modal__close" onClick={onClose} aria-label="Close">
            ✕ Done
          </button>
        </header>

        {/* Mode Selector Strip */}
        <div className="studly-modes-strip">
          {(
            [
              { key: 'flashcards', label: '⚡ Flashcards' },
              { key: 'exam', label: '📝 Exam' },
              { key: 'summary', label: '📋 Summary' },
              { key: 'keyterms', label: '📖 Key terms' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              className={`chip ${mode === item.key ? 'chip--active' : ''}`}
              onClick={() => {
                setMode(item.key);
                setGeneratedFlashcards(null);
                setGeneratedExam(null);
                setGeneratedSummary(null);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="studly-modal__body">
          {/* Input / Topic Form if no result yet */}
          {!generatedFlashcards && !generatedExam && !generatedSummary && (
            <div className="studly-hero-box">
              <div style={{ position: 'relative' }}>
                <h2>What do you need right now?</h2>
                <Graffiti type="underline-scribble" color="var(--yuni-sun)" width={140} height={12} style={{ marginTop: 2 }} />
              </div>
              <p className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>
                Choose a topic or lecture to generate {mode}. Rendered natively with zero fluff.
              </p>

              <div className="studly-input-container">
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Human Anatomy: Cranial Nerves, Cardiac Cycle..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', minHeight: 46 }}
                />

                <div className="studly-quick-chips">
                  {['Cranial Nerves', 'Autonomic Nervous System', 'Antibiotic Classes', 'Renal Clearance'].map((chip) => (
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

          {/* Render Flashcards Tool */}
          {generatedFlashcards && (
            <div className="studly-deck-view">
              <div className="studly-deck-header">
                <strong>Card {currentCardIndex + 1} of {generatedFlashcards.length}</strong>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setGeneratedFlashcards(null)}
                  style={{ fontSize: 12 }}
                >
                  New Topic
                </button>
              </div>

              {/* Swipe Card */}
              <div
                className={`studly-card ${isFlipped ? 'studly-card--flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="studly-card__inner">
                  <div className="studly-card__front">
                    <span className="badge badge--blue" style={{ marginBottom: 12 }}>Question</span>
                    <p className="studly-card__text">{generatedFlashcards[currentCardIndex].front}</p>
                    <span className="text-faint studly-card__tap-hint">Tap to flip answer ↻</span>
                  </div>
                  <div className="studly-card__back">
                    <span className="badge badge--synced" style={{ marginBottom: 12 }}>Answer</span>
                    <p className="studly-card__text">{generatedFlashcards[currentCardIndex].back}</p>
                    {generatedFlashcards[currentCardIndex].source_ref && (
                      <span className="text-faint" style={{ fontSize: 11, marginTop: 8 }}>
                        Ref: {generatedFlashcards[currentCardIndex].source_ref}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="studly-card-controls">
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((i) => i - 1);
                  }}
                >
                  ← Prev
                </button>

                {/* Not clear search button (Spec 09 Section 9) */}
                <button
                  className="btn btn--joy btn--sm"
                  onClick={() => handleSearchGoogle(generatedFlashcards[currentCardIndex].front)}
                  title="Opens Google in in-app browser"
                >
                  🔍 Not clear? Search this
                </button>

                <button
                  className="btn btn--primary btn--sm"
                  disabled={currentCardIndex === generatedFlashcards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((i) => i + 1);
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Render Exam Tool */}
          {generatedExam && (
            <div className="studly-exam-view">
              <div className="studly-deck-header">
                <strong>{generatedExam.title}</strong>
                <button className="btn btn--ghost btn--sm" onClick={() => setGeneratedExam(null)}>
                  New Exam
                </button>
              </div>

              <div className="studly-exam-questions">
                {generatedExam.questions.map((q, idx) => (
                  <div key={idx} className="studly-exam-card">
                    <p style={{ fontWeight: 600, fontSize: 14 }}>
                      {idx + 1}. {q.stem}
                    </p>

                    <div className="studly-exam-options">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userExamAnswers[idx] === optIdx;
                        const isCorrect = q.answer === optIdx;
                        let optionClass = 'studly-exam-option';
                        if (examSubmitted) {
                          if (isCorrect) optionClass += ' studly-exam-option--correct';
                          else if (isSelected && !isCorrect) optionClass += ' studly-exam-option--wrong';
                        } else if (isSelected) {
                          optionClass += ' studly-exam-option--selected';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={optionClass}
                            onClick={() => {
                              if (!examSubmitted) {
                                setUserExamAnswers((prev) => ({ ...prev, [idx]: optIdx }));
                              }
                            }}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>

                    {examSubmitted && (
                      <div className="studly-exam-explanation">
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ marginTop: 6, fontSize: 11 }}
                          onClick={() => handleSearchGoogle(q.stem)}
                        >
                          🔍 Not clear? Search this
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!examSubmitted ? (
                <button
                  className="btn btn--primary btn--lg"
                  style={{ width: '100%', marginTop: 14 }}
                  onClick={() => setExamSubmitted(true)}
                  disabled={Object.keys(userExamAnswers).length < generatedExam.questions.length}
                >
                  Submit & Grade Exam
                </button>
              ) : (
                <div className="studly-score-banner">
                  <strong>
                    Score:{' '}
                    {
                      generatedExam.questions.filter((q, idx) => userExamAnswers[idx] === q.answer).length
                    }{' '}
                    / {generatedExam.questions.length}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Render Summary Tool */}
          {generatedSummary && (
            <div className="studly-summary-view">
              <div className="studly-deck-header">
                <strong>{generatedSummary.title}</strong>
                <button className="btn btn--ghost btn--sm" onClick={() => setGeneratedSummary(null)}>
                  New Summary
                </button>
              </div>

              <div className="card" style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>High-Yield Bullets</h4>
                <ul style={{ paddingLeft: 18, lineHeight: 1.6, fontSize: 13, color: 'var(--text)' }}>
                  {generatedSummary.bullets.map((b, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {b}{' '}
                      <button
                        className="studly-inline-search"
                        onClick={() => handleSearchGoogle(b)}
                        title="Search in in-app browser"
                      >
                        🔍 Search
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {generatedSummary.keyTerms?.length > 0 && (
                <div className="card" style={{ marginTop: 12 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>Key Terms</h4>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {generatedSummary.keyTerms.map((t, i) => (
                      <div key={i} className="studly-term-item">
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{t}</span>
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
