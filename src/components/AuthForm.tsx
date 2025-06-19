import React, { useState } from 'react';

export default function AuthForm({ onSubmit, type }: { onSubmit: (email: string, password: string) => void, type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    setError('');
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto text-black">
      <h2 className="text-xl font-bold text-center mb-2 text-black">{type === 'login' ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="text-red-500 text-sm text-black">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-black placeholder-black"
        autoFocus
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-black placeholder-black"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">{type === 'login' ? 'Login' : 'Sign Up'}</button>
    </form>
  );
} 