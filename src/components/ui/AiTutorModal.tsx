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
        'Habari! I am your Yuni Study Companion. What are we reviewing today? I can break down clinical concepts, summarize lecture topics, or generate spaced-repetition flashcards.',
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
          throw new Error('Could not parse flashcards.');
        }
      } else {
        const response = await askNemotron(newMessages);
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : '';
      let cleanMsg = 'Unable to connect to the study assistant.';
      if (rawMsg.includes('quota') || rawMsg.includes('rate limit') || rawMsg.includes('429')) {
        cleanMsg = 'Daily study quota temporarily reached. Please try again shortly or use your personal key.';
      } else if (rawMsg.includes('network') || rawMsg.includes('Failed to fetch')) {
        cleanMsg = 'Network connection offline. Local notes remain available.';
      }
      setError(cleanMsg);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ ${cleanMsg} You can review cached cards offline anytime.`,
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
                <strong>Yuni Study Companion</strong>
                <span className="badge badge--blue" style={{ fontSize: 10 }}>AI</span>
              </div>
              <p className="text-faint" style={{ fontSize: 11 }}>
                MUHAS revision aid · High-yield context
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
                  Thinking...
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
                : 'Ask a question or describe what you want to revise...'
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
