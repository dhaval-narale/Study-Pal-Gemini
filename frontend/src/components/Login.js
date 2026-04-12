import { useState } from 'react';
import api from '../api';

export default function Login({ onLogin, switchToRegister }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.username);
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>📚 StudyPal</h1>
          <span>Your AI-powered study companion</span>
        </div>
        <h2>Welcome back</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button type="submit">Continue</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <span onClick={switchToRegister}>Sign up</span>
        </div>
      </div>
    </div>
  );
}
