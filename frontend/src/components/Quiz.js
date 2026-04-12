import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api';

const DIFFICULTY_COLORS = { easy: '#10a37f', medium: '#f59e0b', hard: '#ef4444' };

export default function Quiz({ subject, chapter, onClose }) {
  const [screen, setScreen] = useState('setup'); // setup | loading | attempt | result | review
  const [config, setConfig] = useState({ numQuestions: 10, difficulty: 'mixed' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setScreen('loading');
    try {
      const res = await api.post('/quiz/generate', {
        subject, chapter,
        numQuestions: config.numQuestions,
        difficulty: config.difficulty,
      });
      const qs = res.data.questions || res.data;
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);
      setScreen('attempt');
    } catch (err) {
      console.error('Quiz error:', err.response?.status, err.response?.data);
      alert(`Failed to generate quiz. Error: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
      setScreen('setup');
    }
  };

  const handleAnswer = (idx, option) => {
    setAnswers(prev => ({ ...prev, [idx]: option }));
  };

  const handleSubmit = async () => {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    const resultData = {
      score, total: questions.length,
      byDifficulty: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      }
    };
    questions.forEach((q, i) => {
      const d = q.difficulty || 'medium';
      resultData.byDifficulty[d].total++;
      if (answers[i] === q.correct) resultData.byDifficulty[d].correct++;
    });
    setResult(resultData);

    // Save to backend
    try {
      await api.post('/quiz/result', {
        subject, chapter,
        score, total: questions.length,
        difficulty: config.difficulty,
        questionsJson: JSON.stringify(questions),
        answersJson: JSON.stringify(answers),
      });
    } catch {}

    setScreen('result');
  };

  if (screen === 'setup') return <SetupScreen subject={subject} chapter={chapter} config={config} setConfig={setConfig} onGenerate={handleGenerate} onClose={onClose} />;
  if (screen === 'loading') return <LoadingScreen chapter={chapter} />;
  if (screen === 'attempt') return <AttemptScreen questions={questions} answers={answers} current={current} setCurrent={setCurrent} onAnswer={handleAnswer} onSubmit={handleSubmit} onClose={onClose} />;
  if (screen === 'result') return <ResultScreen result={result} chapter={chapter} onReview={() => setScreen('review')} onNewQuiz={() => setScreen('setup')} onClose={onClose} />;
  if (screen === 'review') return <ReviewScreen questions={questions} answers={answers} onBack={() => setScreen('result')} onClose={onClose} />;
}

function SetupScreen({ subject, chapter, config, setConfig, onGenerate, onClose }) {
  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-modal-header">
          <h2>🧠 Generate Quiz</h2>
          <button className="quiz-close" onClick={onClose}>✕</button>
        </div>
        <div className="quiz-subject-badge">{subject} · {chapter}</div>

        <div className="quiz-setup-field">
          <label>Number of Questions</label>
          <div className="quiz-options-row">
            {[5, 10, 15, 20].map(n => (
              <button key={n}
                className={`quiz-option-btn ${config.numQuestions === n ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, numQuestions: n })}>{n}</button>
            ))}
          </div>
        </div>

        <div className="quiz-setup-field">
          <label>Difficulty</label>
          <div className="quiz-options-row">
            {['easy', 'medium', 'hard', 'mixed'].map(d => (
              <button key={d}
                className={`quiz-option-btn ${config.difficulty === d ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, difficulty: d })}
                style={config.difficulty === d && d !== 'mixed' ? { borderColor: DIFFICULTY_COLORS[d], color: DIFFICULTY_COLORS[d] } : {}}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-setup-info">
          {config.difficulty === 'mixed' && <span>⚡ Mixed: balanced easy, medium & hard questions</span>}
          {config.difficulty === 'easy' && <span style={{ color: '#10a37f' }}>🟢 Easy: basic recall and definitions</span>}
          {config.difficulty === 'medium' && <span style={{ color: '#f59e0b' }}>🟡 Medium: application and understanding</span>}
          {config.difficulty === 'hard' && <span style={{ color: '#ef4444' }}>🔴 Hard: analysis and higher order thinking</span>}
        </div>

        <div className="quiz-modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-save" onClick={onGenerate}>🧠 Generate Quiz</button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ chapter }) {
  return (
    <div className="quiz-overlay">
      <div className="quiz-modal" style={{ textAlign: 'center', padding: 48 }}>
        <div className="quiz-loading-icon">🧠</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Generating your quiz...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>AI agent is analyzing {chapter}</p>
        <div className="quiz-loading-steps">
          <div className="quiz-loading-step">📖 Retrieving chapter content</div>
          <div className="quiz-loading-step">⚖️ Planning difficulty distribution</div>
          <div className="quiz-loading-step">✍️ Generating questions</div>
          <div className="quiz-loading-step">✅ Validating quality</div>
        </div>
      </div>
    </div>
  );
}

function AttemptScreen({ questions, answers, current, setCurrent, onAnswer, onSubmit, onClose }) {
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const allAnswered = questions.every((_, i) => answers[i]);

  return (
    <div className="quiz-fullscreen">
      <div className="quiz-topbar">
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Question {current + 1} of {questions.length}</span>
        <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${progress}%` }} /></div>
        <button className="quiz-close-sm" onClick={onClose}>✕ Exit</button>
      </div>

      <div className="quiz-attempt-body">
        <div className="quiz-difficulty-tag" style={{ background: DIFFICULTY_COLORS[q.difficulty] + '22', color: DIFFICULTY_COLORS[q.difficulty] }}>
          {q.difficulty?.toUpperCase()}
        </div>

        <h3 className="quiz-question">{q.question}</h3>

        <div className="quiz-options">
          {Object.entries(q.options).map(([key, val]) => {
            const selected = answers[current] === key;
            return (
              <button key={key}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => onAnswer(current, key)}>
                <span className="quiz-option-key">{key}</span>
                <span>{val}</span>
              </button>
            );
          })}
        </div>

        <div className="quiz-nav">
          <button className="quiz-nav-btn" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</button>
          <div className="quiz-dots">
            {questions.map((_, i) => (
              <div key={i} className={`quiz-dot ${i === current ? 'active' : ''} ${answers[i] ? 'answered' : ''}`}
                onClick={() => setCurrent(i)} />
            ))}
          </div>
          {current < questions.length - 1
            ? <button className="quiz-nav-btn primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
            : <button className="quiz-nav-btn primary" onClick={onSubmit} disabled={!allAnswered}>Submit Quiz ✓</button>
          }
        </div>
        {!allAnswered && current === questions.length - 1 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Answer all questions to submit
          </p>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result, chapter, onReview, onNewQuiz, onClose }) {
  const pct = Math.round((result.score / result.total) * 100);
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
  const msg = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep studying!';

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-modal-header">
          <h2>{emoji} Quiz Complete!</h2>
          <button className="quiz-close" onClick={onClose}>✕</button>
        </div>

        <div className="quiz-result-score">
          <div className="quiz-score-circle">
            <span className="quiz-score-num">{result.score}</span>
            <span className="quiz-score-total">/{result.total}</span>
          </div>
          <div className="quiz-score-pct" style={{ color: pct >= 80 ? '#10a37f' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>{pct}%</div>
          <div className="quiz-score-msg">{msg}</div>
        </div>

        <div className="quiz-result-breakdown">
          {Object.entries(result.byDifficulty).map(([d, v]) => v.total > 0 && (
            <div key={d} className="quiz-breakdown-row">
              <span style={{ color: DIFFICULTY_COLORS[d], fontWeight: 600, textTransform: 'capitalize' }}>{d}</span>
              <div className="quiz-breakdown-bar">
                <div style={{ width: `${(v.correct / v.total) * 100}%`, background: DIFFICULTY_COLORS[d], height: '100%', borderRadius: 4 }} />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v.correct}/{v.total}</span>
            </div>
          ))}
        </div>

        <div className="quiz-modal-actions">
          <button className="modal-cancel" onClick={onNewQuiz}>🔄 New Quiz</button>
          <button className="modal-save" onClick={onReview}>📋 Review Answers</button>
        </div>
      </div>
    </div>
  );
}

function ReviewScreen({ questions, answers, onBack, onClose }) {
  return (
    <div className="quiz-fullscreen">
      <div className="quiz-topbar">
        <button className="quiz-nav-btn" onClick={onBack}>← Back to Results</button>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Answer Review</span>
        <button className="quiz-close-sm" onClick={onClose}>✕ Exit</button>
      </div>
      <div className="quiz-review-body">
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
              <div className="quiz-explanation">
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>💡 Explanation: </span>
                <ReactMarkdown>{q.explanation}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
