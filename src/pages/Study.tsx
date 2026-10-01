import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { AiTutorModal } from '../components/ui/AiTutorModal';
import './Study.css';

export function StudyPage() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <>
      <TopBar title="Study" />
      <div className="page__content">
        <section className="study-hero">
          <h2>Pick your mode</h2>
          <p className="text-muted">Choose a course, then dive in.</p>
        </section>

        {/* Study Mode Cards */}
        <div className="study-modes">
          <button className="study-mode-card">
            <div className="study-mode-card__icon" style={{ background: 'var(--grad-focus)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="study-mode-card__content">
              <strong>Flashcards</strong>
              <span className="text-faint" style={{ fontSize: 13 }}>Spaced repetition</span>
            </div>
          </button>

          <button
            className="study-mode-card"
            onClick={() => setIsAiModalOpen(true)}
            style={{ position: 'relative' }}
          >
            <div className="study-mode-card__icon" style={{ background: 'var(--grad-health)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="study-mode-card__content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong>AI Tutor</strong>
                <span className="badge badge--nemotron" style={{ fontSize: 9 }}>Nemotron</span>
              </div>
              <span className="text-faint" style={{ fontSize: 13 }}>Ask anything · 1M context</span>
            </div>
          </button>

          <button className="study-mode-card">
            <div className="study-mode-card__icon" style={{ background: 'var(--grad-joy)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="study-mode-card__content">
              <strong>Past Papers</strong>
              <span className="text-faint" style={{ fontSize: 13 }}>Practice exams</span>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <section className="study-section">
          <h3>Continue studying</h3>
          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Cranial Nerves</p>
                <p className="text-faint" style={{ fontSize: 13 }}>12 cards · 40% mastered</p>
              </div>
              <div className="study-progress-ring" aria-label="40% complete">
                <svg viewBox="0 0 36 36" width="44" height="44">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--yuni-blue)"
                    strokeWidth="3"
                    strokeDasharray="40, 100"
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--text)">40%</text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Streak */}
        <section className="study-section">
          <div className="study-streak">
            <span className="study-streak__flame">🔥</span>
            <div>
              <strong className="num">5 day streak</strong>
              <p className="text-faint" style={{ fontSize: 13 }}>Keep it up!</p>
            </div>
          </div>
        </section>
      </div>

      <AiTutorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
}
