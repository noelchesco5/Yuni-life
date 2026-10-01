import { useState, useRef, useEffect } from 'react';
import { askNemotron, generateFlashcardsWithNemotron, type ChatMessage } from '../../lib/ai/openrouter';
import './AiTutorModal.css';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlashcardsCreated?: (cards: Array<{ front: string; back: string }>) => void;
}

export function AiTutorModal({ isOpen, onClose, onFlashcardsCreated }: AiTutorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Habari! I am your Yuni Study Companion, powered by NVIDIA Nemotron. I have access to a 1,000,000 token context window to help with your MUHAS coursework, anatomy, pharmacology, past papers, or flashcard generation. What are we studying today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'flashcards'>('chat');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain Cranial Nerves V and VII',
    'Cardiac Action Potential phases',
    'Generate 5 Anatomy flashcards',
    'Antibiotic mechanisms summary',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    setError(null);

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (mode === 'flashcards' || query.toLowerCase().includes('generate flashcards')) {
        const cards = await generateFlashcardsWithNemotron(query, 5);
        if (cards.length > 0) {
          onFlashcardsCreated?.(cards);
          setMessages([
            ...newMessages,
            {
              role: 'assistant',
              content: `✨ Generated ${cards.length} spaced-repetition flashcards and saved them to your deck:\n\n` +
                cards.map((c, i) => `**Card ${i + 1}:**\n**Q:** ${c.front}\n**A:** ${c.back}`).join('\n\n'),
            },
          ]);
        } else {
          throw new Error('Could not parse flashcards from Nemotron.');
        }
      } else {
        const response = await askNemotron(newMessages);
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Nemotron model.';
      setError(msg);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Error communicating with Nemotron: ${msg}. Please check your connection or quota.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal__header">
          <div className="ai-modal__title-box">
            <div className="ai-modal__avatar">🤖</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong>Yuni AI Tutor</strong>
                <span className="badge badge--nemotron">NVIDIA Nemotron</span>
              </div>
              <p className="text-faint" style={{ fontSize: 11 }}>
                Routed to Nemotron 3.5 Lightning (:free · 1M context)
              </p>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm ai-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="ai-modal__mode-toggle">
          <button
            className={`chip ${mode === 'chat' ? 'chip--active' : ''}`}
            onClick={() => setMode('chat')}
            type="button"
          >
            💬 Study Chat
          </button>
          <button
            className={`chip ${mode === 'flashcards' ? 'chip--active' : ''}`}
            onClick={() => setMode('flashcards')}
            type="button"
          >
            ⚡ Flashcard Generator
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--yuni-alert)', padding: '6px 16px', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Messages */}
        <div className="ai-modal__messages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`ai-message ${m.role === 'user' ? 'ai-message--user' : 'ai-message--assistant'}`}
            >
              <div className="ai-message__bubble">
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message ai-message--assistant">
              <div className="ai-message__bubble ai-message__bubble--loading">
                <span className="ai-dot"></span>
                <span className="ai-dot"></span>
                <span className="ai-dot"></span>
                <span style={{ fontSize: 12, marginLeft: 8, color: 'var(--text-faint)' }}>
                  Thinking with Nemotron...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && !loading && (
          <div className="ai-modal__prompts">
            <p className="text-faint" style={{ fontSize: 11, marginBottom: 4 }}>
              Suggested topics:
            </p>
            <div className="ai-modal__chips-row">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  className="chip chip--sm"
                  onClick={() => handleSend(p)}
                  type="button"
                  style={{ fontSize: 11, minHeight: 28, padding: '0 10px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="ai-modal__disclaimer">
          <span>🩺 Always verify clinical details with official MUHAS lecture notes. No patient data.</span>
        </div>

        {/* Input */}
        <form
          className="ai-modal__input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            className="input ai-modal__input"
            type="text"
            placeholder={
              mode === 'flashcards'
                ? 'Enter topic or paste notes to generate cards...'
                : 'Ask Nemotron a question or explain a concept...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn--primary btn--sm ai-modal__send"
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
