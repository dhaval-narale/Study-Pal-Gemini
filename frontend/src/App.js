import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import './App.css';

export default function App() {
  const [page, setPage] = useState('login');
  const [username, setUsername] = useState('');

  const handleLogin = (uname) => {
    setUsername(uname);
    setPage('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    setUsername('');
    setPage('login');
  };

  if (page === 'chat') return <Chat username={username} onLogout={handleLogout} />;
  if (page === 'register') return <Register onLogin={handleLogin} switchToLogin={() => setPage('login')} />;
  return <Login onLogin={handleLogin} switchToRegister={() => setPage('register')} />;
}
