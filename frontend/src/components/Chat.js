import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import Quiz from './Quiz';

const CHAPTERS = {
  Biology: [
    "1. Reproduction in Organisms", "2. Sexual Reproduction in Flowering Plants",
    "3. Human Reproduction", "4. Reproductive Health",
    "5. Principles of Inheritance and Variation", "6. Evolution",
    "7. Human Health and Disease", "8. Strategies for Enhancement in Food Production",
    "9. Microbes in Human Welfare", "10. Biotechnology: Principles and Processes",
    "11. Biotechnology and its Applications", "12. Ecosystem",
    "13. Organisms and Populations", "14. Biodiversity and Conservation",
    "15. Environmental Issues",
  ],
  Physics: [
    "1. Electric Charges and Fields", "2. Electrostatic Potential and Capacitance",
    "3. Current Electricity", "4. Moving Charges and Magnetism",
    "5. Magnetism and Matter", "6. Electromagnetic Induction",
    "7. Alternating Current", "8. Electromagnetic Waves",
    "9. Ray Optics and Optical Instruments", "10. Wave Optics",
    "11. Dual Nature of Radiation and Matter", "12. Atoms",
    "13. Nuclei", "14. Semiconductor Electronics",
  ],
  Chemistry: [
    "1. The Solid State", "2. Solutions", "3. Electrochemistry",
    "4. Chemical Kinetics", "5. Surface Chemistry",
    "6. General Principles and Processes of Isolation of Elements",
    "7. The p-Block Elements", "8. The d and f Block Elements",
    "9. Coordination Compounds", "10. Haloalkanes and Haloarenes",
    "11. Alcohols, Phenols and Ethers", "12. Aldehydes, Ketones and Carboxylic Acids",
    "13. Amines", "14. Biomolecules", "15. Polymers", "16. Chemistry in Everyday Life",
  ],
  Maths: [
    "1. Relations and Functions", "2. Inverse Trigonometric Functions",
    "3. Matrices", "4. Determinants", "5. Continuity and Differentiability",
    "6. Application of Derivatives", "7. Integrals", "8. Application of Integrals",
    "9. Differential Equations", "10. Vector Algebra",
    "11. Three Dimensional Geometry", "12. Linear Programming", "13. Probability",
  ],
};

const DIFFICULTY_COLORS = { easy: '#10a37f', medium: '#f59e0b', hard: '#ef4444' };

export default function Chat({ username, onLogout }) {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('history');
  const [chatSessions, setChatSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [reviewQuiz, setReviewQuiz] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadNotes();
    loadQuizResults();
  }, []);

  useEffect(() => {
    if (!subject || !chapter) return;
    setMessages([]);
    api.get('/chat/history', { params: { subject, chapter } })
      .then(res => setMessages(res.data.map(h => ({ role: h.role, content: h.message }))))
      .catch(() => {});
  }, [subject, chapter]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = () => api.get('/chat/sessions').then(res => setChatSessions(res.data)).catch(() => {});
  const loadNotes = () => api.get('/notes').then(res => setNotes(res.data)).catch(() => {});
  const loadQuizResults = () => api.get('/quiz/results').then(res => setQuizResults(res.data)).catch(() => {});

  const handleSubjectChange = e => { setSubject(e.target.value); setChapter(''); setMessages([]); };
  const handleChapterChange = e => setChapter(e.target.value);

  const handleSend = async () => {
    if (!input.trim() || !subject || !chapter || loading) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chat', { subject, chapter, history: [], question });
      setMessages(prev => [...prev, { role: 'model', content: res.data.answer }]);
      loadSessions();
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const openSaveNote = content => {
    setNoteForm({ title: `${chapter} - Note`, content });
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim()) return;
    await api.post('/notes', { subject, chapter, ...noteForm });
    setShowNoteModal(false);
    loadNotes();
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleEditNote = () => {
    setEditForm({ title: selectedNote.title, content: selectedNote.content });
    setEditingNote(true);
  };

  const handleSaveEdit = async () => {
    const res = await api.put(`/notes/${selectedNote.id}`, {
      subject: selectedNote.subject, chapter: selectedNote.chapter, ...editForm,
    });
    setSelectedNote(res.data);
    setNotes(prev => prev.map(n => n.id === res.data.id ? res.data : n));
    setEditingNote(false);
  };

  const handleDownloadNote = note => {
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHistoryClick = item => { setSubject(item.subject); setChapter(item.chapter); };

  const sidebarProps = {
    username, onLogout, sidebarTab, setSidebarTab,
    chatSessions, notes, quizResults,
    onHistoryClick: handleHistoryClick,
    onDeleteNote: handleDeleteNote,
    onNewChat: () => { setSubject(''); setChapter(''); setMessages([]); setSelectedNote(null); },
    activeChapter: chapter,
    onReviewQuiz: setReviewQuiz,
  };

  // Quiz review from history
  if (reviewQuiz) {
    return <ReviewFromHistory quiz={reviewQuiz} onClose={() => setReviewQuiz(null)} />;
  }

  // Note viewer
  if (selectedNote) {
    return (
      <div className="app-layout">
        <Sidebar {...sidebarProps} onNoteClick={n => { setSelectedNote(n); setEditingNote(false); }} />
        <div className="note-viewer">
          <div className="note-viewer-header">
            <button className="back-btn" onClick={() => { setSelectedNote(null); setEditingNote(false); }}>←</button>
            {editingNote ? (
              <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }} />
            ) : (
              <div style={{ flex: 1 }}>
                <h2>{selectedNote.title}</h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedNote.subject} · {selectedNote.chapter}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {editingNote ? (
                <>
                  <button className="save-note-btn" onClick={handleSaveEdit}>💾 Save</button>
                  <button className="modal-cancel" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13 }} onClick={() => setEditingNote(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="save-note-btn" onClick={handleEditNote}>✏️ Edit</button>
                  <button className="save-note-btn" onClick={() => handleDownloadNote(selectedNote)}>⬇️ Download</button>
                </>
              )}
            </div>
          </div>
          <div className="note-viewer-content">
            {editingNote ? (
              <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                style={{ width: '100%', minHeight: '60vh', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'monospace', resize: 'vertical', outline: 'none' }} />
            ) : (
              <div className="msg-text"><ReactMarkdown>{selectedNote.content}</ReactMarkdown></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar {...sidebarProps} onNoteClick={setSelectedNote} />

      <div className="chat-main">
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <select className="subject-select" value={subject} onChange={handleSubjectChange}>
              <option value="">Select Subject</option>
              {Object.keys(CHAPTERS).map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="chapter-select" value={chapter} onChange={handleChapterChange} disabled={!subject}>
              <option value="">Select Chapter</option>
              {(CHAPTERS[subject] || []).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {subject && chapter && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="save-note-btn" onClick={() => openSaveNote('')}>📝 New Note</button>
              <button className="save-note-btn" onClick={() => setShowQuiz(true)}>🧠 Quiz</button>
            </div>
          )}
        </div>

        <div className="messages-area">
          {!subject || !chapter ? (
            <div className="welcome-screen">
              <h2>📚 StudyPal</h2>
              <p>Select a subject and chapter to start studying</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-content">
                  <div className={`msg-avatar ${msg.role}`}>
                    {msg.role === 'user' ? username[0].toUpperCase() : '✦'}
                  </div>
                  <div className="msg-body">
                    <div className="msg-sender">{msg.role === 'user' ? username : 'StudyPal'}</div>
                    <div className="msg-text"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    {msg.role === 'model' && (
                      <div className="msg-actions">
                        <button className="msg-action-btn" onClick={() => navigator.clipboard.writeText(msg.content)}>📋 Copy</button>
                        <button className="msg-action-btn" onClick={() => openSaveNote(msg.content)}>📝 Save as Note</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message-row model">
              <div className="message-content">
                <div className="msg-avatar model">✦</div>
                <div className="msg-body">
                  <div className="msg-sender">StudyPal</div>
                  <div className="typing-indicator">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-wrapper">
          <div style={{ width: '100%', maxWidth: 720 }}>
            <div className="input-box">
              <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={subject && chapter ? `Ask about ${chapter}...` : 'Select a subject and chapter first'}
                disabled={!subject || !chapter || loading}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }} />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim() || !subject || !chapter || loading}>↑</button>
            </div>
            <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>

      {showQuiz && subject && chapter && (
        <Quiz subject={subject} chapter={chapter} onClose={() => { setShowQuiz(false); loadQuizResults(); }} />
      )}

      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📝 Save Note</h3>
            <input placeholder="Note title" value={noteForm.title}
              onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
            <textarea placeholder="Note content (supports markdown)" value={noteForm.content}
              onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} rows={6} />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowNoteModal(false)}>Cancel</button>
              <button className="modal-save" onClick={handleSaveNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewFromHistory({ quiz, onClose }) {
  const questions = JSON.parse(quiz.questionsJson || '[]');
  const answers = JSON.parse(quiz.answersJson || '{}');
  const pct = Math.round((quiz.score / quiz.total) * 100);
  const color = pct >= 80 ? '#10a37f' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="quiz-fullscreen">
      <div className="quiz-topbar">
        <button className="quiz-nav-btn" onClick={onClose}>← Back</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{quiz.subject} · {quiz.chapter}</span>
          <span style={{ marginLeft: 12, fontWeight: 700, color }}>{quiz.score}/{quiz.total} ({pct}%)</span>
        </div>
        <button className="quiz-close-sm" onClick={onClose}>✕ Close</button>
      </div>
      <div className="quiz-review-body">
        {questions.length === 0 && (
          <div className="empty-state"><span>📋</span>No review data available</div>
        )}
        {questions.map((q, i) => {
          const correct = answers[i] === q.correct;
          return (
            <div key={i} className={`quiz-review-card ${correct ? 'correct' : 'wrong'}`}>
              <div className="quiz-review-header">
                <span className="quiz-review-num">Q{i + 1}</span>
                <span className={`quiz-review-status ${correct ? 'correct' : 'wrong'}`}>{correct ? '✅ Correct' : '❌ Wrong'}</span>
                <span className="quiz-difficulty-tag" style={{ background: DIFFICULTY_COLORS[q.difficulty] + '22', color: DIFFICULTY_COLORS[q.difficulty], marginLeft: 'auto' }}>{q.difficulty}</span>
              </div>
              <p className="quiz-review-question">{q.question}</p>
              <div className="quiz-review-options">
                {Object.entries(q.options).map(([key, val]) => {
                  const isCorrect = key === q.correct;
                  const isSelected = key === answers[i];
                  return (
                    <div key={key} className={`quiz-review-option ${isCorrect ? 'correct' : ''} ${isSelected && !isCorrect ? 'wrong' : ''}`}>
                      <span className="quiz-option-key">{key}</span>
                      <span>{val}</span>
                      {isCorrect && <span style={{ marginLeft: 'auto', color: '#10a37f' }}>✓</span>}
                      {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: '#ef4444' }}>✗</span>}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <div className="quiz-explanation">
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>💡 Explanation: </span>
                  <ReactMarkdown>{q.explanation}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sidebar({ username, onLogout, sidebarTab, setSidebarTab, chatSessions, notes, quizResults,
  onHistoryClick, onNoteClick, onDeleteNote, onNewChat, activeChapter, onReviewQuiz }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">📚 StudyPal</span>
      </div>
      <button className="new-chat-btn" onClick={onNewChat}>✏️ New Chat</button>
      <div className="sidebar-tabs">
        <button className={`sidebar-tab ${sidebarTab === 'history' ? 'active' : ''}`} onClick={() => setSidebarTab('history')}>History</button>
        <button className={`sidebar-tab ${sidebarTab === 'notes' ? 'active' : ''}`} onClick={() => setSidebarTab('notes')}>Notes</button>
        <button className={`sidebar-tab ${sidebarTab === 'quizzes' ? 'active' : ''}`} onClick={() => setSidebarTab('quizzes')}>Quizzes</button>
      </div>
      <div className="sidebar-list">
        {sidebarTab === 'history' && (
          <>
            {chatSessions.length === 0 && <div className="empty-state"><span>💬</span>No chats yet</div>}
            {chatSessions.map((item, i) => (
              <div key={i} className={`history-item ${activeChapter === item.chapter ? 'active' : ''}`}
                onClick={() => onHistoryClick(item)}>
                <div className="history-item-subject">{item.subject}</div>
                <div className="history-item-chapter">{item.chapter}</div>
                <div className="history-item-time">{new Date(item.lastActive).toLocaleDateString()}</div>
              </div>
            ))}
          </>
        )}
        {sidebarTab === 'notes' && (
          <>
            {notes.length === 0 && <div className="empty-state"><span>📝</span>No notes yet</div>}
            {notes.map(note => (
              <div key={note.id} className="note-item" onClick={() => onNoteClick(note)}>
                <div className="note-item-info">
                  <div className="note-item-title">{note.title}</div>
                  <div className="note-item-chapter">{note.subject} · {note.chapter}</div>
                </div>
                <button className="note-delete-btn" onClick={e => onDeleteNote(note.id, e)}>🗑</button>
              </div>
            ))}
          </>
        )}
        {sidebarTab === 'quizzes' && (
          <>
            {(!quizResults || quizResults.length === 0) && <div className="empty-state"><span>🧠</span>No quizzes yet</div>}
            {(quizResults || []).map(r => {
              const pct = Math.round((r.score / r.total) * 100);
              const color = pct >= 80 ? '#10a37f' : pct >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <div key={r.id} className="quiz-history-item" onClick={() => onReviewQuiz(r)}>
                  <div className="quiz-history-item-info">
                    <div className="quiz-history-item-subject">{r.subject}</div>
                    <div className="quiz-history-item-chapter">{r.chapter}</div>
                    <div className="history-item-time">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className="quiz-score-badge" style={{ background: color + '22', color }}>{pct}%</span>
                </div>
              );
            })}
          </>
        )}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{username[0].toUpperCase()}</div>
          <span className="user-name">{username}</span>
          <button className="logout-btn" onClick={onLogout} title="Logout">⏻</button>
        </div>
      </div>
    </div>
  );
}
